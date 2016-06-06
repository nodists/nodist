'use strict';
var P = require('bluebird');
var fs = require('fs');
var mkdirp = require('mkdirp');
var ncp = require('ncp');
var path = require('path');
var rimraf = require('rimraf');
var semver = require('semver');
var extract = require('extract-zip')


var buildHelper = require('./build');
var github = require('./github');
var vermanager = require('./versions')

//make some promising APIs
P.promisifyAll(buildHelper);
P.promisifyAll(fs);
P.promisifyAll(github);
P.promisifyAll(github.releases);
P.promisifyAll(github.repos);
mkdirp = P.promisify(mkdirp);
ncp = P.promisify(ncp);
rimraf = P.promisify(rimraf);

var debug = require('debug')('nodist:npm')

/**
 * npmist /nopmist/
 * This poorly named module manages npm versions
 */
function npmist(nodist, envVersion) {
  this.nodist = nodist
  this.envVersion = envVersion
  //define where we store our npms
  this.repoPath = path.resolve(path.join(this.nodist.nodistDir,'npmv'));
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
 * List all npm versions installed in this.repoPath
 * @param {function} cb A callback with (error, arrayOfVersions)
 * @return {*} nothing
 */
NPMIST.listInstalled = function listInstalled(cb) {
  //return from cache if we can
  if(this.installedCache){
    return process.nextTick(() => {
      cb(null, this.installedCache);
    });
  }

  fs.readdir(this.repoPath, (err, ls) => {
    if(err){
      return cb({
        message: 'Reading the version directory ' +
        this.repoPath + ' failed: ' + err.message
      });
    }

    ls = ls.filter(semver.valid)
    ls.sort(function(v1, v2){
      if(vermanager.compareable(v1) > vermanager.compareable(v2)){
        return 1;
      }
      else{
        return -1;
      }
    });
    //set cache for later
    this.installedCache = ls;
    return cb(null, ls);
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

NPMIST.resolveVersionLocally = function(spec, done) {
  if (!spec) return done()
  this.listInstalled((er, installed) => { 
    if (spec === 'latest') return done(null, installed[0])

    if (spec === 'match') {
      this.nodist.getCurrentVersion((er, nodeVersion) => {
        if (er) return done(er)
        this.nodist.getMatchingNpmVersion(nodeVersion, (er, npmVersion) => {
          if (er) return done(er)
          resolveVersion(npmVersion, installed)
        })
      })
      return
    }

    resolveVersion(spec, installed)
  })
  function resolveVersion(spec, installed) {
    //try to get a version if its explicit
    var version = semver.clean(spec);
    //support version ranges
    if(semver.validRange(spec)){
      version = semver.maxSatisfying(installed,spec);
    }
    done(null,version);
  }
}

/**
 * Resolve a version from a string
 * @param {string} v
 * @param {function} done
 */
NPMIST.resolveVersion = function(v,done){
  if ('latest' === v || !v) {
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

  this.listAvailable()
  .then(function(results){
    var available = results.map(function(v){
      return v.tag_name;
    });
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
 * Remove a version of NPM
 * @param {string} v
 * @param {function} done
 * @return {*}
 */
NPMIST.remove = function(v, done){
  var version = semver.clean(v);
  if(!semver.valid(version)) return done(new Error('Invalid version'));
  var archivePath = path.resolve(path.join(this.repoPath,version));

  //check if this version is already not installed, if so just bail
  if(!fs.existsSync(archivePath)){
    return done(null,version);
  }

  //nuke everything for this version
  P.all([rimraf(archivePath)])
    .then(function(){
      done(null,version);
    })
    .catch(function(err){
      done(err);
    });
};


/**
 * Install NPM version
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

  //check if this version is already installed, if so just bail
  if(fs.existsSync(archivePath)){
    debug('install', 'this version is already installed')
    return done()
  }

  //otherwise install the new version
  P.all([
      mkdirp(this.repoPath),
  ])
    .then(() => {
      var downloadLink = NPMIST.downloadUrl(version);
      //download tarball i think, i am going to steal this from the build script
      debug(
        'Downloading NPM from ' + downloadLink + ' to ' + zipFile);
      return buildHelper.downloadFileAsync(downloadLink,zipFile);
    })
    .then(() => {
      return mkdirp(path.dirname(archivePath));
    })
    .then(() => {
      //now actually extract the zip files
      return new Promise((resolve,reject) => {
        extract(zipFile, { dir: repoPath }, (er) => {
          if (er) reject(er)
          resolve()
        })
      })
    })
    .then(() => {
      return Promise.all([
        rimraf(zipFile)
      , fs.renameAsync(
          path.resolve(
            this.repoPath + '/npm-' + version.replace('v','')
          ),
          archivePath
        )
      ])
    })
    .then(() => {
      done()
    })
    .catch((err) => {
      done(err);
    });
};

/**
 * Sets the global npm version
 * @param {string} version
 * @param {function} cb accepting (err)
 */
NPMIST.setGlobal = function setGlobal(versionSpec, cb){
  var globalFile = this.nodist.nodistDir+'/.npm-version';
  fs.writeFile(globalFile, versionSpec, function(er) {
    if(er){
      return cb(new Error(
        'Could not set npm version ' + versionSpec + ' (' + er.message + ')'
      ));
    }
    cb();
  });
};


/**
 * Gets the global npm version
 * @param {function} cb a callback accepting (err)
 */
NPMIST.getGlobal = function getGlobal(cb){
  var globalFile = this.nodist.nodistDir+'/.npm-version';
  fs.readFile(globalFile, function(er, version){
    if(er) return cb(er);
    cb(null, version.toString().trim(), cb);
  });
};


/**
 * Sets the local npm version
 * @param {string} version
 * @param {function} cb function accepting (err)
 */
NPMIST.setLocal = function setLocal(versionSpec, cb) {
  fs.writeFile('./.npm-version', versionSpec, function(er){
    if(er){
      return cb(new Error(
        'Could not set npm version ' + versionSpec + ' (' + er.message + ')'
      ));
    }
    cb(null, process.cwd() + '\\.npm-version');
  });
};


/**
 * Gets the local npm version
 * @param {function} cb callback accepting (err, version)
 */
NPMIST.getLocal = function getLocal(cb){
  var dir = process.cwd();
  var dirArray = dir.split('\\');

  //NOTE: this function is recursive and could loop!!
  function search(){
    if(dirArray.length === 0) return cb();
    dir = dirArray.join('\\');
    var file = dir + '\\.npm-version';
    fs.readFile(file, function(er, version){
      if(er){
        dirArray.pop();
        return search();
      }
      cb(null, version.toString().trim(), file);
    });
  }
  search();
};


/**
 * Gets the environmental npm version
 * @param {function} cb a callback accepting (err, env)
 * @return {*} nothing
 */
NPMIST.getEnv = function getEnv(cb) {
  if(!this.envVersion) return cb();
  cb(null, this.envVersion);
};
