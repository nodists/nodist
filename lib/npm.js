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

//make some promising APIs
P.promisifyAll(buildHelper);
P.promisifyAll(fs);
P.promisifyAll(github);
P.promisifyAll(github.releases);
P.promisifyAll(github.repos);
mkdirp = P.promisify(mkdirp);
ncp = P.promisify(ncp);
rimraf = P.promisify(rimraf);

/**
 * npmist /nopmist/
 * This poorly named module manages npm versions
 */
function npmist(nodist) {
  this.nodist = nodist
  //define where we store our npms
  this.repoPath = path.resolve(path.join(__dirname,'..','npmv'));
  this.prodPath = path.resolve(
    path.join(__dirname,'..','bin','node_modules','npm'));
}

module.exports = npmist

var NPMIST = npmist.prototype

/**
 * List available NPM versions
 * @return {string}
 */
NPMIST.listAvailable = function(){
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
NPMIST.latestVersion = function(){
  return github.releases.getLatestReleaseAsync({
      owner: 'npm',
      repo: 'npm'
    })
    .then(function(result){
      return result.tag_name;
    });
};

/**
 * Get latest NPM version
 * @return {string}
 */
NPMIST.matchingVersion = function(){
  return new Promise((done, reject) => {
    this.nodist.getCurrentVersion((er, nodeVersion) => {
      if (er) return reject(er)
      this.nodist.getMatchingNpmVersion(nodeVersion, (er, npmVersion) => {
        if (er) return reject(er)
	      done(npmVersion)
      })
    })
  })
};

/**
 * Get a download URL for the version
 * @param {string} version
 * @return {string}
 */
NPMIST.downloadUrl = function(version){
  return 'https://codeload.github.com/npm/npm/zip/vVERSION'
    .replace('VERSION',version.replace('v',''));
};


/**
 * Resolve a version from a string
 * @param {string} v
 * @param {function} done
 */
NPMIST.resolveVersion = function(v,done){
  if ('latest' === v) {
    this.latestVersion()
    .then((latest) => {
      done(null, latest)
    })
    return
  }

  if ('match' === v) {
    this.matchingVersion()
    .then((version) => {
      done(null, version)
    })
    return
  }

  P.all([
    this.listAvailable(),
    this.latestVersion()
  ])
    .then(function(results){
      var latestVersion = results[1];
      var available = results[0].map(function(v){
        return v.tag_name;
      });
      //correct latest version
      if(!v){
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
NPMIST.use = function(v,done){
  debug('use', 'Activating npm v'+v)
  var version = semver.clean(v);
  if(!semver.valid(version)) return done(new Error('Invalid version'));
  var archivePath = path.resolve(
    path.join(this.repoPath,version,'npm-' + version)
  );
  //make sure we have the current version in the repo it should already be
  //installed
  if(!fs.existsSync(archivePath))
    return done(new Error('Version not installed'));
  //we can go ahead and nuke the old version
  rimraf(this.prodPath)
    .then(() => {
      //now copy the new version in
      return ncp(archivePath,this.prodPath);
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
NPMIST.remove = function(v, done){
  var version = semver.clean(v);
  if(!semver.valid(version)) return done(new Error('Invalid version'));
  var zipFile = path.resolve(path.join(this.repoPath,version + '.zip'));
  var archivePath = path.resolve(path.join(this.repoPath,version));

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
NPMIST.install = function(v,done){
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
      mkdirp(this.prodPath),
      mkdirp(this.repoPath),
      mkdirp(archivePath)
  ])
    .then(() => {
      var downloadLink = NPMIST.downloadUrl(version);
      //download tarball i think, i am going to steal this from the build script
      console.log(
        'Downloading NPM from ' + downloadLink + ' to ' + zipFile);
      return buildHelper.downloadFileAsync(downloadLink,zipFile);
    })
    .then(() => {
      return mkdirp(path.dirname(archivePath));
    })
    .then(() => {
      //now actually extract the zip files
      return promisePipe(
        fs.createReadStream(zipFile).
        pipe(unzip.Extract({ path: archivePath }))
      );
    })
    .then(() => {
      //the last thing to do is to use the version
      this.use(version,done);
    })
    .catch((err) => {
      done(err);
    });
};
