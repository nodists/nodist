'use strict';
var P = require('bluebird');
var exec = require('child_process').exec;
var fs = require('fs');
var mkdirp = require('mkdirp');
var path = require('path');
var promisePipe = require('promisepipe');
var recursiveReaddir = require('recursive-readdir');
var request = require('request');
var rimraf = require('rimraf');
var unzip = require('unzip');

var helper = require('./helper');

//make some promises
P.promisifyAll(fs);
P.promisifyAll(helper);
P.promisifyAll(request);
exec = P.promisify(exec);
mkdirp = P.promisify(mkdirp);
rimraf = P.promisify(rimraf);
recursiveReaddir = P.promisify(recursiveReaddir);

//just a quick note about this builder. for it to work you must have a working
//node and npm and install the node modules for the repo sort of a chicken and
//the egg for my environments i use my working installation of nodist to
//provide this, as an initial seed i use the installer from nodejs.org


//what would we have to do to build this......

//create a build folder, where all the files we will need for the installer
//will go, hopefully it can just include the whole folder

//in the build folder we are going to have to create the following directory
//structure in order to get nodist to work

/*
bin
  node.exe - this is the binary shim that loads the real node executable
  nodist - this is a bash script that chain loads the cli.js
  nodist.cmd - this is a cmd that interacts with the nodist cli
  nodist.ps1 - a ps1 file for nodist
  npm - this is a shell script that chain loads to the npm cli
  npm.cmd - a windows cmd script that chain loads the npm cli
  node_modules - folder to contain modules used globally
    npm - latest copy of npm
lib
  nodist.js - main js code
  versions.js - helper js code
node_modules - node modules needed to make nodist work
  (automatic) - will be installed during the build process
cli.js - cli interface code
node.exe - latest node executable downloaded from nodejs.org
 */

//first we are going to need some static URLS that will probably need to be
//maintained with this script

//we ship the 32bit version for the bootstrap and download 64bit versions later
//var nodeLatestUrl = 'http://nodejs.org/dist/latest/win-x86/node.exe';
var nodeLatestUrl = 'https://nodejs.org/dist/latest/win-x86/node.exe';
var npmLatestReleaseUrl = 'https://github.com/npm/npm/releases/latest';
//this gets updated once we know the right version
var npmLatestUrl = 'https://codeload.github.com/npm/npm/zip/vVERSION';

//setup some folders
var tmpDir = path.resolve(path.join(__dirname,'tmp'));
var stagingDir = path.resolve(path.join(__dirname,'staging'));
var stagingBin = path.join(stagingDir,'bin');
var stagingLib = path.join(stagingDir,'lib');
var stagingNpmDir = stagingBin + '/node_modules/npm';
var nodistDir = path.resolve(path.dirname(__dirname));
var nodistBin = path.join(nodistDir,'bin');
var nodistLib = path.join(nodistDir,'lib');

//file paths
var npmZip = path.resolve(tmpDir + '/npm.zip');

//default npm version to the latest at the time of writing
var npmVersion = '3.3.8';

//manifests
var installManifest = [];
var uninstallManifest = [];
var uninstallFolders = [];

//lets get started by doing some bootstrapping
console.log('Welcome to the Nodist Builder');
console.log('  before going further we need to prep our staging folder');

//start by clearing the staging and tmp folders
P.all([
  rimraf(stagingDir),
  rimraf(tmpDir)
])
  .then(function(){
    return P.all([
      fs.mkdirAsync(stagingDir),
      fs.mkdirAsync(tmpDir)
    ]);
  })
  .then(function(){
    console.log('Staging directory created');
    //next we need to start building what we need
    //first it is the bin folder lets create and populate
    console.log('Starting to stage static files');
    return P.all([
      fs.mkdirAsync(path.join(stagingDir,'bin')),
      fs.mkdirAsync(path.join(stagingDir,'lib'))
    ]);
  })
  .then(function(){
    return P.all([
      //bin folder
      helper.copyFileAsync(
        nodistBin + '/node.exe',stagingBin + '/node.exe'),
      helper.copyFileAsync(
        nodistBin + '/nodist',stagingBin + '/nodist'),
      helper.copyFileAsync(
        nodistBin + '/nodist.cmd',stagingBin + '/nodist.cmd'),
      helper.copyFileAsync(
        nodistBin + '/nodist.ps1',stagingBin + '/nodist.ps1'),
      helper.copyFileAsync(
        nodistBin + '/npm',stagingBin + '/npm'),
      helper.copyFileAsync(
        nodistBin + '/npm.cmd',stagingBin + '/npm.cmd'),
      //lib folder
      helper.copyFileAsync(
        nodistLib + '/nodist.js',stagingLib + '/nodist.js'),
      helper.copyFileAsync(
        nodistLib + '/versions.js',stagingLib + '/versions.js'),
      //root level files
      helper.copyFileAsync(
        nodistDir + '/cli.js',stagingDir + '/cli.js'),
      helper.copyFileAsync(
        nodistDir + '/LICENSE.txt',stagingDir + '/LICENSE.txt'),
      helper.copyFileAsync(
        nodistDir + '/package.json',stagingDir + '/package.json')
    ]);
  })
  .then(function(){
    console.log('Finished copying static files');
    console.log('Downloading the latest Node for packaging');
    return helper.downloadFileAsync(nodeLatestUrl,stagingDir + '/node.exe');
  })
  .then(function(){
    console.log('Figure out the latest version of NPM');
    return request.headAsync({
      url: npmLatestReleaseUrl,
      followRedirect: false
    });
  })
  .spread(function(resp){
    //extract version from url
    npmVersion = resp.headers.location.match(/v(.+)$/).slice(1);
    console.log('Determined latest NPM as ' + npmVersion);
    npmLatestUrl = npmLatestUrl.replace('VERSION',npmVersion);
    console.log('Downloading latest NPM from ' + npmLatestUrl);
    return helper.downloadFileAsync(npmLatestUrl,npmZip);
  })
  .then(function(){
    console.log('Extracting NPM to staging folder');
    return mkdirp(path.dirname(stagingNpmDir));
  })
  .then(function(){
    return promisePipe(
      fs.createReadStream(npmZip).
        pipe(unzip.Extract({ path: path.dirname(stagingNpmDir) }))
    );
  })
  .then(function(){
    return fs.renameAsync(
      path.resolve(path.dirname(stagingNpmDir) + '/npm-' + npmVersion),
      stagingNpmDir
    );
  })
  .then(function(){
    console.log('Install node_modules for distribution');
    return exec('npm install',{cwd: stagingDir});
  })
  .spread(function(stdout){
    console.log(stdout);
    console.log('Installation complete');
    console.log('Build Nodist.nsi');
    return recursiveReaddir(stagingDir);
  })
  .then(function(files){
    files.sort(function(a,b){
      return path.resolve(a).split('\\').length <
        path.resolve(b).split('\\').length;
    });
    var currentFolder = null;
    files.forEach(function(file){
      var folder = path.dirname(file);
      var relativeFolder = folder.replace(stagingDir,'');
      var relativeFile = file.replace(stagingDir,'');
      //change the folder and add it
      if(!currentFolder || folder !== currentFolder){
        currentFolder = folder;
        installManifest.push('SetOutPath "$INSTDIR' + relativeFolder + '"');
        if(relativeFolder)
          uninstallFolders.unshift('RmDir "$INSTDIR' + relativeFolder + '"');
      }
      //add the file
      installManifest.push('File "' + file + '"');
      uninstallManifest.push('Delete "$INSTDIR' + relativeFile + '"');
    });
    //now we must read the contents of the nsi template
    return fs.readFileAsync(
      path.resolve(nodistDir + '/build/Nodist.template.nsi')
    );
  })
  .then(function(nsiTemplate){
    nsiTemplate = nsiTemplate.toString();
    nsiTemplate = nsiTemplate.replace(
      ';ADD_FILES;',
      installManifest.join('\n')
    );
    nsiTemplate = nsiTemplate.replace(
      ';DELETE_FILES;',
      uninstallManifest.join('\n')
    );
    nsiTemplate = nsiTemplate.replace(
      ';DELETE_FOLDERS;',
      uninstallFolders.join('\n')
    );
    return fs.writeFileAsync(
      path.resolve(nodistDir + '/build/Nodist.nsi'),
      nsiTemplate
    );
  })
  .then(function(){
    console.log('NSI template created!');
    console.log('Build complete!');
    console.log('Just compile the Nodist.nsi file to complete the build');
    process.exit(0);
  })
  .catch(function(err){
    console.log('BUILD FAILED');
    console.log(err);
    process.exit(1);
  });
