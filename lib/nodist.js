'use strict';
/*!
 * nodist
 * A Node version manager for the windows folks out there.
 * Copyright 2012 by Marcel Klehr <mklehr@gmx.net>
 *
 * (MIT LICENSE)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var child_process = require('child_process');
var crypto = require('crypto');
var debug = require('debug')('nodist:nodist');
var mkdirp = require('mkdirp');
var request = require('request');
var fs = require('fs');
var path = require('path');
var ProgressBar = require('progress');
var rimraf = require('rimraf');
var vermanager = require('./versions');


/**
 * Nodist class holder
 * @type {object}
 */
var nodist = {};


/**
 * Nodist instance
 * @this nodist
 * @param {string} sourceUrl is the url to fetch node versions from
 * @param {string} iojsSourceUrl is the url to fetch iojs versions from
 * @param {string} nodistDir is the path to the directory
 *                 in which to store installed node versions
 * @param {object} proxy is proxy setting if is needed
 * @param {boolean} wantX64 '0' or '1'
 * @param {object} envVersion the NODIST_VERSION env vars
 */
module.exports = nodist = function nodist(
  sourceUrl,
  iojsSourceUrl,
  nodistDir,
  proxy,
  wantX64,
  envVersion
){
  this.wantX64 = !!wantX64;
  this.sourceUrl = sourceUrl;
  this.iojsSourceUrl = iojsSourceUrl;
  this.nodistDir = nodistDir;
  this.sourceDir = path.resolve(nodistDir + '/' + (this.wantX64? 'v-x64': 'v'));
  this.proxy = proxy;
  this.envVersion = envVersion;
  this.installedCache = null;
  this.availableCache = null;

  // Create source dir if it does not exist
  mkdirp.sync(this.sourceDir);
};


/**
 * Set the property of wanting x64 binaries
 * @param {boolean} wantX64
 */
nodist.prototype.setWantX64 = function(wantX64) {
  this.wantX64 = !!wantX64;
};

nodist.isIojs = function(version) {
  var major = parseInt(version.split('.')[0])
  return (major >= 1 && major < 4)
}

nodist.isZeroVersion = function(version) {
  var major = parseInt(version.split('.')[0])
  return (major == 0)
}

/**
 * Determine the version of the passed node exe
 * @param {string} file the path to the node.exe to test
 * @param {function} cb A callback with (error, node_version)
 */
nodist.determineVersion = function determineVersion(file, cb) {
  var returned = false;

  var node = child_process.spawn(file, ['-v']);
  node.stdout.on('data', function(data){
    var version = data.toString().trim().replace(/v(\d+\.\d+\.\d+)/, '$1');
    if(!returned) cb(null, version);
    returned = true;
  });
  node.on('error', function(err){
    if(!returned) cb(err);
    returned = true;
  });
  node.on('exit', function(err){
    if(!returned) cb(err);
    returned = true;
  });
};


/**
 * Returns the path to the executable of the passed node version
 * (Relies on n.sourceDir)
 * @param {string} version
 * @return {string} source directory with the version appended
 */
nodist.prototype.getVersionDir = function getVersionDir(version){
  var dir = path.resolve(path.join(this.sourceDir, version));
  debug('getVersionDir', dir);
  return dir;
};


/**
 * Get path to an EXE from the version
 * @param {string} version
 * @return {string} version directory with exe appended
 */
nodist.prototype.getPathToExe = function getPathToExe(version){
  var file = path.resolve(path.join(this.getVersionDir(version), 'node.exe'));
  debug('getPathToExe', file);
  return file;
};


/**
 * Get Path to global version file
 * @return {string} path to global version file
 */
nodist.prototype.getPathToGlobalVersion = function getPathToGlobalVersion(){
  var dir = path.resolve(path.join(this.nodistDir, '.node-version-global'));
  debug('getPathToGlobalVersion', dir);
  return dir;
};


/**
 * Get relative path to EXE
 * @param {string} version
 * @return {string} relative path to EXE eg: 'win-x64/node.exe'
 */
nodist.prototype.getRelativePathToExe = function getRelativePathToExe(version){
  //this default reflects node 4+ which is most likely to be what is used now
  var dir = (this.wantX64 ? 'win-x64/' : 'win-x86/') + 'node.exe';
  if(nodist.isIojs(version)){
    dir = (this.wantX64 ? 'win-x64/' : 'win-x86/') + 'iojs.exe';
  } else {
    if(nodist.isZeroVersion(version)) {
      // node 0.x
      dir = (this.wantX64 ? 'x64/' : '') + 'node.exe';
    } else {
      // node 4.x and newer
      dir = (this.wantX64 ? 'win-x64/':'win-x86/') + 'node.exe';
    }
  }
  debug('getRelativePathToExe', dir);
  return dir;
};


/**
 * Get Prefix for Source URL using the version
 * @param {string} version
 * @return {string} URL base
 */
nodist.prototype.getSourceUrlPrefix = function getSourceUrlPrefix(version){
  var url = this.sourceUrl + '/v' + version;
  if(nodist.isIojs(version)) {
    url = this.iojsSourceUrl + '/v' + version;
  }else {
    url = this.sourceUrl + '/v' + version;
  }
  debug('getSourceUrlPrefix',url);
  return url;
};


/**
 * Get URL to EXE based on version
 * @param {string} version
 * @return {string} URL
 */
nodist.prototype.getUrlToExe = function getUrlToExe(version){
  var url = this.getSourceUrlPrefix(version) +
    '/' + this.getRelativePathToExe(version);
  debug('getUrlToExe',url);
  return url;
};


/**
 * Get URL to SHASUM file
 * @param {string} version
 * @return {string} URL to SHASUM file
 */
nodist.prototype.getUrlToShasum = function getUrlToShasum(version) {
  var url = this.getSourceUrlPrefix(version) + '/SHASUMS256.txt';
  debug('getUrlToShasum',url);
  return url;
};


/**
 * Return a SHA SUM from the released SHASUMS based on the version
 * @param {string} shasumBody  the actual downloaded text file from dist
 * @param {string} version  the user provided version identifier
 * @param {string} file  optional file name to find the shashum of,
 *                   defaults to node.exe
 * @return {string} shasum value matching the file path
 */
nodist.prototype.getShasumFromBody = function getShasumFromBody(
  shasumBody,
  version,
  file
){
  if(!file)
    file = this.getRelativePathToExe(version);
  var lines = shasumBody.split('\n');
  var shasum = '';
  lines.forEach(function(line){
    var parts = line.split('  ');
    if(2 !== parts.length) return;
    if(parts[1].trim() === file){
      shasum = parts[0].trim();
    }
  });
  shasum = shasum ? shasum : false;
  debug('getShasumFromBody', shasum);
  return shasum;
};

/**
 * Determine which version the user would get at this moment
 * if they ran `node -v`
 * @param {Function} cb as (er, currentVersion)
 */
nodist.prototype.getCurrentVersion = function(cb) { 
  // LOL, don't judge me. I know I should be using promises...
  this.getGlobal((er1, globalSpec) => {
    this.resolveVersionLocally(globalSpec, (er2, globalVersion) => {
      this.getLocal((er3, localSpec, localFile) => {
        this.resolveVersionLocally(localSpec, (er4, localVersion) => {
          this.getEnv((er5, envSpec) => {
            this.resolveVersionLocally(envSpec, (er6, envVersion) => {
              if (er1 || er2 || er3 || er4 || er5 || er6) // I'l use promises next time. I promise.
                return cb(er1 || er2 || er3 || er4 || er5 || er6)
              cb(null, envVersion || localVersion || globalVersion)
            })
          })
        })
      })
    })
  })
}

/**
 * Finds the npm version that matches the given node version
 * @param {String} nodeVersion the node version
 * @param {Function} cb as (er, npmVersion)
 */
nodist.prototype.getMatchingNpmVersion = function(nodeVersion, cb) { 
  debug('getMatchingNpmVersion', 'for node version', nodeVersion)
  this.fetchVersionList((er, versions) => {
    if (er) return cb(er)
    var npmVersion
    versions
    .some((v) => v.version.substr(1) === nodeVersion && (npmVersion = v.npm))
    debug('getMatchingNpmVersion', 'found npm version', npmVersion)
    cb(null, npmVersion)
  })
}

/**
 * fetch, merge and sort the version lists of io.js and node
 * @param {Function} cb called with (er, versions)
 * @returns {*} nothing
 */
nodist.prototype.fetchVersionList = function(cb) {
  var versions = []
  //request from nodejs.org first
  debug('fetchVersionList', this.sourceUrl + '/index.json');
  this.fetchAvailable(
    this.sourceUrl + '/index.json',
    'node',
    (err, result) => {
      if(err) console.log(err.message);
      var nodeErr = err;
      if(result instanceof Array)
        versions = versions.concat(result);
      //now chain and request from iojs
      debug(
        'fetchVersionList',
        this.iojsSourceUrl + '/index.json'
      );
      this.fetchAvailable(
        this.iojsSourceUrl + '/index.json',
        'iojs',
        (err, result) => {
          if(err) console.log(err.message);
          var ioErr = err;
          if(result instanceof Array)
            versions = versions.concat(result);
          //throw an error if both fail
          if(nodeErr && ioErr) return cb(nodeErr);
           
	  versions.sort(function(v1,v2){
	    if(vermanager.compareable(v1.version) > vermanager.compareable(v2.version))
	      return 1
	    else
	      return -1
	  });

          // Update local cache, whenever we can, so that shim can use it
          fs.writeFile(this.nodistDir+'/versions.json', JSON.stringify(versions), () => {
	    cb(null, versions)
	  })
	}
      );
    }
  );
}
/**
 * Used to fetch available versions from a dynamic dist
 * @param {string} sourceUrl
 * @param {string} name this is the name of the dist eg: 'node' or 'iojs'
 * @param {function} cb as err, arrayOfVersions
 * @return {*} nothing
 */
nodist.prototype.fetchAvailable = function fetchAvailable(sourceUrl, name, cb){
  var that = this;
  request(
    {
      proxy: that.proxy,
      uri: sourceUrl
    },
    function(err, resp, body){
      if(err){
        err.message = 'Could not list available ' + name + ' versions: ' +
          err.message;
      }
      if(!resp){
        err = new Error('Could not read response for ' + sourceUrl);
      }
      if(!err && resp.statusCode !== 200){
        err = new Error(
          'Could not list available ' + name + ' versions: HTTP ' +
          resp.statusCode
        );
      }
      if(err) return cb(err);
      var versionResult = JSON.parse(body)
      cb(null,versionResult);
    }
  );
};


/**
 * List all available node versions distributed by n.sourceUrl
 * @param {function} cb A callback with (error, arrayOfVersions)
 * @return {*} value of callback or nothingness
 */
nodist.prototype.listAvailable = function listAvailable(cb) {
  //check if we already have the list cached
  if(this.availableCache){
    return process.nextTick(function(){
      cb(null, this.availableCache);
    });
  }

  //request from nodejs.org first
  this.fetchVersionList((er, versions) => {
    if (er) return cb(er)
    versions = versions.map((v) => v.version.substr(1));
    //now set cache
    this.availableCache = versions;
    //otherwise we are done
    cb(null, versions);
  });
};


/**
 * List all node versions installed in n.sourceDir
 * @param {function} cb A callback with (error, arrayOfVersions)
 * @return {*} nothing
 */
nodist.prototype.listInstalled = function listInstalled(cb) {
  var that = this;

  //return from cache if we can
  if(that.installedCache){
    return process.nextTick(function(){
      cb(null,that.installedCache);
    });
  }

  fs.readdir(this.sourceDir, function(err, ls){
    if(err){
      return cb({
        message: 'Reading the version directory ' +
        that.sourceDir + ' failed: ' + err.message
      });
    }

    ls.sort(function(v1, v2){
      if(vermanager.compareable(v1) > vermanager.compareable(v2)){
        return 1;
      }
      else{
        return -1;
      }
    });
    //set cache for later
    that.installedCache = ls;
    return cb(null, ls);
  });
};


/**
 * Resolves version specs given by the user
 * relative to available versions and installed versions
 * @param {string} versionSpec such as '0.12.x'
 * @param {function} cb in the form of err, versions
 */
nodist.prototype.resolveVersion = function resolveVersion(versionSpec, cb){
  var that = this;
  that.listAvailable(function(err, list) {
    if(err) {
      that.resolveVersionLocally(versionSpec, cb)
      return
    }
    vermanager.find(versionSpec, list, cb);
  });
};

/**
 * Resolves version specs given by the user against the installed versions only
 * relative to available versions and installed versions
 * @param {string} versionSpec such as '0.12.x'
 * @param {function} cb in the form of err, versions
 */
nodist.prototype.resolveVersionLocally = function resolveVersion(versionSpec, cb){
  if(!versionSpec) return cb() // Hack in order to make `nodist list` work
  this.listInstalled(function(err, list) {
    if(err) return cb(err);
    vermanager.find(versionSpec, list, cb);
  });
};

/**
 * Install the passed version
 * This will first check, if the version is already installed.
 *
 * @param {string} version The version to install
 * @param {function} cb A callback with (error)
 */
nodist.prototype.install = function install(version, cb) {
  var that = this;
  debug('install','request to install',version);
  this.listInstalled(function(err, installed){
    if(err) return cb(err);
    // check if already installed.
    if(installed.indexOf(version) !== -1){
      return cb(null, version);
    }
    debug('install',version,'not already installed; installing...');
    that.fetch(version, function(err){
      if(err) return cb(err);
      debug('install','installation successful',version);
      return cb(null, version);
    });
  });
};


/**
 * Install all available versions.
 *
 * @param {function} cb A callback with (error, installed_version)
 *   that gets called for each version that is installed.
 * @return {*} nothing
 */
nodist.prototype.installAll = function(cb) {
  var that = this;

  this.listInstalled(function(err, installed){
    if(err) return cb(err);
    that.listAvailable(function(err, available){
      if(err) return cb(err);
      available.forEach(function(version) {
        if(installed.indexOf(version) !== -1){
          return cb(null, version);
        }
        that.fetch(version, function(err){
          if(err) return cb(err);
          return cb(null, version);
        });
      });
    });
  });
};


/**
 * Remove an installed version
 * @param {string} version the version to remove
 * @param {function} cb A callback with (error)
 */
nodist.prototype.remove = function remove(version, cb){
  var versionDir = path.dirname(this.getPathToExe(version));
  debug('remove','removing',version,versionDir);
  fs.exists(versionDir, function(exists) {
    if(exists){
      rimraf(versionDir,cb);
    } else {
      // don't cry if it doesn't exist
      cb();
    }
  });
};


/**
 * SHASUM256 a local file
 * This will call the callback with (err,hash)
 * @param {string} file  path to file to hash
 * @param {function} cb  callback
 */
nodist.prototype.SHASum256File = function SHASum256File(file, cb){
  debug('SHASum256File', 'request to hash', file);
  var sum = crypto.createHash('sha256');
  var readStream = fs.createReadStream(file);
  readStream.on('error',function(err){
    cb(err);
  });
  readStream.on('data',function(chunk){
    sum.update(chunk);
  });
  readStream.on('close',function(){
    var shasum = sum.digest('hex');
    debug('SHASum256File','hash complete', shasum);
    cb(null, shasum);
  });
};


/**
 * Downloads the passed version from this.sourceUrl
 * @param {string} version The version to download
 * @param {function} callback A callback with (error, arrayOfVersions)
 * @return {*} nothing
 */
nodist.prototype.fetch = function fetch(version, callback){
  var that = this;
  var bar;
  var binarySize = 1;
  var url = this.getUrlToExe(version);
  var shasumUrl = this.getUrlToShasum(version);
  var fetchTarget = this.getPathToExe(version);
  debug('fetch','new request',url,shasumUrl,fetchTarget);
  // Check online availability
  if(vermanager.compareable(version) < vermanager.compareable('0.5.1')) {
    return callback(
      new Error('There are no builds available for versions older than 0.5.1')
    );
  }

  // callback proxy (clean up things on error)
  var cb = function(err) {
    if(err) {
      // clean up
      that.remove(version, function(e) {
        if(e){
          return callback(
            new Error(
              err.message + '. Could not clean after error: ' + e.message)
          );
        }
        // pass on the error
        callback(err);
      });
      return;
    }
    return callback(null, version);
  };

  // create path if necessary
  if(!fs.existsSync(path.dirname(fetchTarget))){
    debug('fetch','creating target dir');
    mkdirp.sync(path.dirname(fetchTarget));
  }

  // fetch from url
  debug('fetch','starting download of binary');
  var stream = request(
    {
      proxy: that.proxy,
      url: url,
      pool: {maxSockets: 25}
    },
    function(err, resp){
      if(err || resp.statusCode !== 200) {
        return cb(new Error(
          'Could not fetch ' + version + ': ' +
          (err ? err.message : 'HTTP '+resp.statusCode)
        ));
      }
      bar.update(1,Math.round(binarySize / 1024));
      debug('fetch','binary download complete');
      //here we want to get the shasum text and then get the
      // actual sum from that file
      debug('fetch', 'downloading SHASUMS256.txt to verify', shasumUrl);
      request(
        {
          proxy: that.proxy,
          url: shasumUrl,
          pool: {maxSockets: 25}
        },
        function(err, resp, body){
          if(err || resp.statusCode !== 200) {
            return cb(new Error(
              'Could not fetch SHASUM256.txt for ' + version + ': ' +
              (err ? err.message : 'HTTP '+resp.statusCode)
            ));
          }
          //find out the shasum
          debug('fetch','sum file downloaded, finding hash we need');
          var shasum = that.getShasumFromBody(body, version);
          debug('fetch','got hash response',shasum);
          if(!shasum){
            return cb(
              new Error('Could not obtain SHASUM from dist file for ' + version)
            );
          }
          debug('fetch','hashing downloaded binary');
          that.SHASum256File(fetchTarget,function(err, hash){
            debug('fetch', 'got computed hash', err, hash);
            if(err){
              return cb(new Error(
                'Could not create SHA256 Hash of ' +
                fetchTarget + ' ' + err.message
              ));
            }
            debug('fetch', 'verifying hash', shasum === hash);
            if(shasum !== hash){
              return cb(new Error(
                'Bad SHA256 hash for ' + fetchTarget + ', please try again.'
              ));
            }
            debug('fetch', 'hash match, installation complete', version);
            cb();
          });
        }
      );
    }
  );
  var writer = fs.createWriteStream(fetchTarget);
  //pipe data to disk
  stream.pipe(writer);
  //seed progress bar
  stream.on('response',function(resp){
    if (resp.statusCode !== 200) return // handled above, we just make sure nothing throws before that...
    debug('fetch','binary size', +resp.headers['content-length'], 'bytes');
    binarySize = +resp.headers['content-length'];
    bar = new ProgressBar(
      ' ' + version + ' [:bar] :current/:total KiB :percent :etas',
      {
        complete: '=',
        incomplete: ' ',
        width: 15,
        total: Math.round(binarySize / 1024)
      }
    );
  });
  //update progress bar
  stream.on('data',function(chunk){
    if (bar) bar.tick(Math.round(chunk.length / 1024));
  });
  //handle errors
  stream.on('error', function(err){
    cb(new Error('Could not fetch ' + version + ': ' + err.message));
  });
  writer.on('error', function(err) {
    cb(new Error(
      'Could not write fetched version ' + version + ': ' + err.message
    ));
  });
  //write ignore file to prevent duplicate installation
  fs.writeFileSync(fetchTarget + '.ignore', '');
};


/**
 * Sets the global node version
 * @param {string} version
 * @param {function} cb accepting (err)
 */
nodist.prototype.setGlobal = function setGlobal(versionSpec, cb){
  var globalFile = this.getPathToGlobalVersion();
  fs.writeFile(globalFile, versionSpec, function(er) {
    if(er){
      return cb(new Error(
        'Could not set version ' + versionSpec + ' (' + er.message + ')'
      ));
    }
    cb();
  });
};


/**
 * Gets the global node version
 * @param {function} cb a callback accepting (err)
 */
nodist.prototype.getGlobal = function getGlobal(cb){
  var globalFile = this.getPathToGlobalVersion();
  fs.readFile(globalFile, function(er, version){
    if(er) return cb(er);
    cb(null, version.toString().trim(), cb);
  });
};


/**
 * Sets the local node version
 * @param {string} version
 * @param {function} cb function accepting (err)
 */
nodist.prototype.setLocal = function setLocal(versionSpec, cb) {
  fs.writeFile('./.node-version', versionSpec, function(er){
    if(er){
      return cb(new Error(
        'Could not set version ' + versionSpec + ' (' + er.message + ')'
      ));
    }
    cb(null, process.cwd() + '\\.node-version');
  });
};


/**
 * Gets the local node version
 * @param {function} cb callback accepting (err, version)
 */
nodist.prototype.getLocal = function getLocal(cb){
  var dir = process.cwd();
  var dirArray = dir.split('\\');

  //NOTE: this function is recursive and could loop!!
  function search(){
    if(dirArray.length === 0) return cb();
    dir = dirArray.join('\\');
    var file = dir + '\\.node-version';
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
 * Gets the environmental node version
 * @param {function} cb a callback accepting (err, env)
 * @return {*} nothing
 */
nodist.prototype.getEnv = function getEnv(cb) {
  if(!this.envVersion) return cb();
  cb(null, this.envVersion);
};

/**
 * Emulates the passed node version with args
 * @param {string} version
 * @param {object} args
 * @param {function} cb A callback with (error) Will be called on error or exit.
 */
nodist.prototype.emulate = function emulate(version, args, cb) {
  var that = this;

  this.install(version, function(err) {
    if(err) return cb(err);
    var node = child_process.spawn(that.getPathToExe(version), args, {
      stdio: 'inherit',
      cwd: path.resolve('.')
    });
    node.on('exit', cb.bind(that, null));// onexit: cb(err=null, code)
  });
};
