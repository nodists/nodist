'use strict';
var P = require('bluebird');
var exec = require('child_process').exec;
var fs = require('fs');
var mkdirp = require('mkdirp');
var ncp = require('ncp');
var path = require('path');
var recursiveReaddir = require('recursive-readdir');
var request = require('request');
var rimraf = require('rimraf');
var tar = require('tar');
var zlib = require('zlib');

var github = require('../lib/github');
var helper = require('../lib/build');
var pkg = require('../package.json');



//make some promises
P.promisifyAll(fs);
P.promisifyAll(github);
P.promisifyAll(github.releases);
P.promisifyAll(helper);
P.promisifyAll(request);
exec = P.promisify(exec);
mkdirp = P.promisify(mkdirp);
ncp = P.promisify(ncp);
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
  npm.exe - this is the binary shim for npm
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
var nodeLatestUrlx86 = 'https://nodejs.org/dist/VERSION/win-x86/node.exe';
var nodeLatestUrlx64 = 'https://nodejs.org/dist/VERSION/win-x64/node.exe';

//setup some folders
var outDir = path.resolve(path.join(__dirname, 'out'));
var packageDir = path.resolve(path.join(outDir, 'package'));
var tmpDir = path.resolve(path.join(outDir, 'tmp'));
var stagingDir = path.resolve(path.join(outDir, 'staging'));
var stagingNpmDir = path.join(stagingDir, 'npmv');
var stagingBin = path.join(stagingDir,'bin');
var stagingLib = path.join(stagingDir,'lib');
var nodistDir = path.resolve(path.dirname(__dirname));
var nodistBin = path.join(nodistDir,'bin');
var nodistLib = path.join(nodistDir,'lib');

var npm = new (require('../lib/npm'))({nodistDir: stagingDir});

//default npm version to the latest at the time of writing
var npmVersion = '3.3.8';
var nodeVersion = '4.2.1';

var versionPathx86 = '';
var versionPathx64 = '';

//manifests
var installManifest = [];
var uninstallManifest = [];
var uninstallFolders = [];

//lets get started by doing some bootstrapping
console.log('Welcome to the Nodist Builder');
console.log('  before going further we need to prep our staging folder');

//start by clearing the staging and tmp folders
P.all([
  rimraf(outDir)
])
  .then(function(){
    return P.all([
      mkdirp(stagingDir),
      mkdirp(tmpDir),
      mkdirp(stagingNpmDir)
    ]);
  })
  .then(function(){
    console.log('Staging directory created');
    //next we need to start building what we need
    //first it is the bin folder lets create and populate
    console.log('Starting to stage static files');
    return P.all([
      fs.mkdirAsync(path.join(stagingDir,'bin')),
      fs.mkdirAsync(path.join(stagingDir,'lib')),
      mkdirp(path.join(stagingDir,'npm','bin'))
    ]);
  })
  .then(function(){
    return P.all([
      //bin folder
      helper.copyFileAsync(
        nodistBin + '/nodist',stagingBin + '/nodist'),
      helper.copyFileAsync(
        nodistBin + '/nodist.sh',stagingBin + '/nodist.sh'),
      helper.copyFileAsync(
        nodistBin + '/nodist_bash_profile_content.sh',stagingBin + '/nodist_bash_profile_content.sh'),
      helper.copyFileAsync(
        nodistBin + '/nodist.cmd',stagingBin + '/nodist.cmd'),
      helper.copyFileAsync(
        nodistBin + '/nodist.ps1',stagingBin + '/nodist.ps1'),
      helper.copyFileAsync(
        nodistBin + '/npm.cmd',stagingBin + '/npm.cmd'),
      //npm folder
      helper.copyFileAsync(
        nodistDir + '/npm/bin/npm-cli.js',stagingDir + '/npm/bin/npm-cli.js'),
      //lib folder
      helper.copyFileAsync(
        nodistLib + '/build.js',stagingLib + '/build.js'),
      helper.copyFileAsync(
        nodistLib + '/github.js',stagingLib + '/github.js'),
      helper.copyFileAsync(
        nodistLib + '/nodist.js',stagingLib + '/nodist.js'),
      helper.copyFileAsync(
        nodistLib + '/npm.js',stagingLib + '/npm.js'),
      helper.copyFileAsync(
        nodistLib + '/versions.js',stagingLib + '/versions.js'),
      //root level files
      helper.copyFileAsync(
        nodistDir + '/cli.js',stagingDir + '/cli.js'),
      helper.copyFileAsync(
        nodistDir + '/LICENSE.txt',stagingDir + '/LICENSE.txt'),
	  helper.copyFileAsync(
        nodistDir + '/usage.txt',stagingDir + '/usage.txt'),
      helper.copyFileAsync(
        nodistDir + '/package.json',stagingDir + '/package.json')
    ]);
  })
  .then(function(){
    console.log('Finished copying static files');
    
    console.log('Compiling node shim');
    return exec('go build -o "'+stagingBin +'/node.exe" src/shim-node.go');
  })
  .then(function(){
    console.log('Done compiling node shim');
    
    console.log('Compiling shim');
    return exec('go build -o "'+stagingBin +'/npm.exe" src/shim-npm.go');
  })
  .then(function() {
    console.log('Done compiling npm shim');
    
    console.log('Determining latest version of node');
    return request.getAsync({
      url: 'https://nodejs.org/dist/index.json',
      json: true
    });
  })
  .then(function(res){
    nodeVersion = res.body[0].version;
    nodeLatestUrlx86 = nodeLatestUrlx86.replace('VERSION',nodeVersion);
    nodeLatestUrlx64 = nodeLatestUrlx64.replace('VERSION',nodeVersion);
    console.log('Latest version of Node ' + nodeVersion);
    console.log('Downloading ' + nodeLatestUrlx86);
    return helper.downloadFileAsync(nodeLatestUrlx86,stagingDir + '/node.exe');
  })
  .then(function(){
    console.log('Copying that EXE as if it were installed normally');
    versionPathx86 = stagingDir + '/v/' + nodeVersion.replace('v','');
    versionPathx64 = stagingDir + '/v-x64/' + nodeVersion.replace('v','');
    return P.all([
      mkdirp(versionPathx86),
      mkdirp(versionPathx64)
    ]);
  })
  .then(function(){
    return ncp(
      stagingDir + '/node.exe',
      versionPathx86 + '/node.exe'
    );
  })
  .then(function(){
    //download the 64bit version as well
    console.log('Downloading the 64bit version for packaging');
    return helper.downloadFileAsync(
      nodeLatestUrlx64,versionPathx64 + '/node.exe');
  })
  .then(function(){
    console.log('Writing ' + nodeVersion + ' as global node version');
    return fs.writeFileAsync(
      path.resolve(path.join(stagingDir,'.node-version-global')),
      nodeVersion
    );
  })
  .then(function(){
    console.log('Figure out the latest version of NPM');
    return npm.latestVersion();
  })
  .then(function(version){
    npmVersion = version;
    var downloadLink = npm.downloadUrl(version);
    console.log('Determined latest NPM as ' + npmVersion);
    console.log('Downloading latest NPM from ' + downloadLink);
    return Promise.resolve()
    .then(() => mkdirp(stagingNpmDir+'/'+npmVersion.replace('v','')))
    .then(() => {
      return new Promise((resolve, reject) => {
        var extractStream = tar.x({
          cwd: stagingNpmDir+'/'+npmVersion.replace('v','')
          , strip: 1
        });
        helper.downloadFileStream(downloadLink)
        .pipe(zlib.createUnzip())
        .pipe(extractStream)
        .on('error', reject);
        extractStream.on('error',reject);
        extractStream.on('end', resolve);
      });
    });
  })
  .then(function(){
    console.log('Writing ' + npmVersion + ' as global npm version');
    return fs.writeFileAsync(
      path.resolve(path.join(stagingDir,'.npm-version-global')),
      npmVersion.replace('v','')
    );
  })
  .then(function(){
    console.log('Install node_modules for distribution');
    return exec('npm install',{cwd: stagingDir});
  })
  .spread(function(){
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
      ';VERSION;',
      pkg.version
    );
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
      path.resolve(nodistDir + '/build/out/Nodist.nsi'),
      nsiTemplate
    );
  })
  .then(function() {
    console.log('Run NSIS compiler');
	// /Vx verbosity where x is 4=all,3=no script,2=no info,1=no warnings,0=none
    return exec('makensis /V2 "' + nodistDir + '/build/out/Nodist.nsi"'); // Verbosity level 2, because we don't want to exhaust the buffer
  })
  .then(function(){
    console.log('NSIS compilation complete!');
    console.log('Preparing chocolatey package');
  })
  .then(() => Promise.all([mkdirp(packageDir), mkdirp(packageDir+'/tools')]))
  .then(() => fs.readFileAsync(
      path.resolve(nodistDir + '/build/nodist.template.nuspec')
   ))
   .then((nuspec) => {
     nuspec = nuspec.toString().replace('__VERSION__', pkg.version);
     return Promise.all([
       fs.writeFileAsync(
         path.resolve(packageDir + '/nodist.nuspec'),
         nuspec
       )
     , helper.copyFileAsync(nodistDir+'/build/chocolateyinstall.ps1', packageDir+'/tools/chocolateyinstall.ps1')
     , helper.copyFileAsync(nodistDir+'/build/chocolateyuninstall.ps1', packageDir+'/tools/chocolateyuninstall.ps1')
     , helper.copyFileAsync(nodistDir+'/LICENSE.txt', packageDir+'/tools/LICENSE.txt')
     , helper.copyFileAsync(nodistDir+'/build/VERIFICATION.txt', packageDir+'/tools/VERIFICATION.txt')
     , helper.copyFileAsync(outDir+'/NodistSetup.exe', packageDir+'/tools/Installer.exe')
     ]);
   })
  .then(() => {
    console.log('Build complete!');
    process.exit(0);
  })
  .catch(function(err){
    console.log('BUILD FAILED');
    console.log(err);
    process.exit(1);
  });
