'use strict';
var P = require('bluebird');
var fs = require('fs');
var mkdirp = require('mkdirp');
var ncp = require('ncp');
var path = require('path');
var promisePipe = require('promisepipe');
var rimraf = require('rimraf');
var semver = require('semver');
var unzip = require('unzip');
var debug = require('debug')('nodist:npm')

var buildHelper = require('./build');
var github = require('./github');

//make some promises
P.promisifyAll(buildHelper);
P.promisifyAll(fs);
P.promisifyAll(github);
P.promisifyAll(github.releases);
P.promisifyAll(github.repos);
mkdirp = P.promisify(mkdirp);
ncp = P.promisify(ncp);
rimraf = P.promisify(rimraf);

//define where we store our npms
var npmRepoPath = path.resolve(path.join(__dirname,'..','npmv'));
var npmProdPath = path.resolve(
  path.join(__dirname,'..','bin','node_modules','npm'));


/**
 * List available NPM versions
 * @return {string}
 */
exports.listAvailable = function(){
  return github.releases.listReleasesAsync({
    owner: 'npm',
    repo: 'npm',
    per_page: '100'
  });
};


/**
 * Get latest NPM version
 * @return {string}
 */
exports.latestVersion = function(){
  return github.releases.getLatestReleaseAsync({
      owner: 'npm',
      repo: 'npm'
    })
    .then(function(result){
      return result.tag_name;
    });
};


/**
 * Get a download URL for the version
 * @param {string} version
 * @return {string}
 */
exports.downloadUrl = function(version){
  return 'https://codeload.github.com/npm/npm/zip/vVERSION'
    .replace('VERSION',version.replace('v',''));
};


/**
 * Resolve a version from a string
 * @param {string} v
 * @param {function} done
 */
exports.resolveVersion = function(v,done){
  P.all([
    exports.listAvailable(),
    exports.latestVersion()
  ])
    .then(function(results){
      var latestVersion = results[1];
      var available = results[0].map(function(v){
        return v.tag_name;
      });
      //correct latest version if used
      if('latest' === v || !v){
        v = latestVersion;
      }
      //try to get a version if its explicit
      var version = semver.clean(v);
      //support version ranges
      if(semver.validRange(v)){
        version = semver.maxSatisfying(available,v);
      }
      done(null,version);
    })
    .catch(function(err){
      done(err);
    });
};


/**
 * Use a version of NPM
 * @param {string} v
 * @param {function} done
 * @return {*}
 */
exports.use = function(v,done){
  debug('use', 'Activating npm v'+v)
  var version = semver.clean(v);
  if(!semver.valid(version)) return done(new Error('Invalid version'));
  var archivePath = path.resolve(
    path.join(npmRepoPath,version,'npm-' + version)
  );
  //make sure we have the current version in the repo it should already be
  //installed
  if(!fs.existsSync(archivePath))
    return done(new Error('Version not installed'));
  //we can go ahead and nuke the old version
  rimraf(npmProdPath)
    .then(function(){
      //now copy the new version in
      return ncp(archivePath,npmProdPath);
    })
    .then(function(){
      done(null,version);
    })
    .catch(function(err){
      done(err);
    });
};


/**
 * Remove a version of NPM
 * @param {string} v
 * @param {function} done
 * @return {*}
 */
exports.remove = function(v, done){
  var version = semver.clean(v);
  if(!semver.valid(version)) return done(new Error('Invalid version'));
  var zipFile = path.resolve(path.join(npmRepoPath,version + '.zip'));
  var archivePath = path.resolve(path.join(npmRepoPath,version));

  //check if this version is already installed, if so just use it
  if(!fs.existsSync(archivePath) && !fs.existsSync(zipFile)){
    return done(null,version);
  }

  //nuke everything for this version
  P.all([rimraf(archivePath),rimraf(zipFile)])
    .then(function(){
      done(null,version);
    })
    .catch(function(err){
      done(err);
    });
};


/**
 * Install NPM version or use it if already installed
 * @param {string} v
 * @param {function} done
 * @return {*}
 */
exports.install = function(v,done){
  debug('install', v)
  var version = semver.clean(v);
  if(!semver.valid(version)) return done(new Error('Invalid version'));
  
  var zipFile = path.resolve(path.join(this.repoPath,version + '.zip'));
  var archivePath = path.resolve(path.join(this.repoPath,version));

  //check if this version is already installed, if so just use it
  if(fs.existsSync(archivePath) && fs.existsSync(zipFile)){
    debug('install', 'this version is already installed')
    return this.use(version,done);
  }

  //otherwise install the new version
  P.all([
      mkdirp(npmProdPath),
      mkdirp(npmRepoPath),
      mkdirp(archivePath)
  ])
    .then(function(){
      var downloadLink = exports.downloadUrl(version);
      //download tarball i think, i am going to steal this from the build script
      console.log(
        'Downloading NPM from ' + downloadLink + ' to ' + zipFile);
      return buildHelper.downloadFileAsync(downloadLink,zipFile);
    })
    .then(function(){
      return mkdirp(path.dirname(archivePath));
    })
    .then(function(){
      //now actually extract the zip files
      return promisePipe(
        fs.createReadStream(zipFile).
        pipe(unzip.Extract({ path: archivePath }))
      );
    })
    .then(function(){
      //the last thing to do is to use the version
      exports.use(version,done);
    })
    .catch(function(err){
      done(err);
    });
};
