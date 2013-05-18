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

var child_process = require('child_process')
  , mkdirp     = require('mkdirp')
  , request    = require('request')
  , fs         = require('fs')
  , path       = require('path')
  , rimraf     = require('rimraf')
  , vermanager = require('./versions')
;

/**
Nodist instance
@param sourceUrl is the url to fetch node versions from
@param sourceDir is the path to the directory in which to store installed node versions
*/
module.exports = nodist = function nodist(sourceUrl, sourceDir) {
  this.sourceUrl = sourceUrl;
  this.sourceDir = sourceDir;
  
  // Create source dir if unexistant
  mkdirp.sync(sourceDir);
};


/**
Determine the version of the passed node exe
@param file the path to the node.exe to test
@param cb A callback with (error, node_version)
*/
nodist.determineVersion = function determineVersion(file, cb) {
  var returned = false;
  
  var node = child_process.spawn(file, ['-v']);
  node.stdout.on('data', function (data) {
    var version = data.toString().trim().replace(/v(\d+\.\d+\.\d+)/, '$1');
    if(!returned) cb(null, version);
    returned = true;
  });
  node.on('error', function (err) {
    if(!returned) cb(err);
    returned = true;
  });
  node.on('exit', function (err) {
    if(!returned) cb(err);
    returned = true;
  });
}

/**
Returns the path to the executable of the passed node version
(Relies on n.sourceDir)
*/
nodist.prototype.resolveToExe = function resolveToExe(version) {
  return this.sourceDir+'\\'+version+'\\node.exe';
}

/**
List all available node versions distributed by n.sourceUrl
@param cb A callback with (error, array_of_versions)
*/
nodist.prototype.listAvailable = function listAvailable(cb) {
  var n = this;
  request(n.sourceUrl, function(err, resp, body) {
    if(err) return cb(new Error('Couldn\'t list available versions: '+err.message));
    if(resp.statusCode != 200) return cb(new Error('Couldn\'t list available versions: HTTP '+resp.statusCode));

    var map = {},
      versions = [];
    body.match(/\d+\.\d+\.\d+\//g)// search for "0.0.0/" (only dirs contain node.exe)
    .sort(function(v1, v2) {
      return vermanager.compareable(v1) > vermanager.compareable(v2) ? 1 : -1;
    })
    .forEach(function(v) {
      v = v.substr(0, v.length-1);
      if(map[v]) return;
      map[v] = v;
      versions.push(v);
    });
    cb(null, versions);
  });
};

/**
List all node versions installed in n.sourceDir
@param cb A callback with (error, array_of_versions)
*/
nodist.prototype.listInstalled = function listInstalled(cb) {
  var n = this;
  fs.readdir(this.sourceDir, function(err, ls){
    if(err) return cb('Reading the version directory '+n.sourceDir+' failed: '+err.message);
    
    ls.sort(function(val1, val2){
      return vermanager.compareable(val1) > vermanager.compareable(val2) ? 1 : -1;
    });
    return cb(null, ls);
  })
};

nodist.prototype.resolveVersion = function(version_spec, cb) {
  var n = this;
  n.listAvailable(function(er, list) {
    if(er) {
      n.listInstalled(function(er, list) {
        if(er) return cb(er);
        vermanager.find(version_spec, list, cb);
      });
      return;
    }
    vermanager.find(version_spec, list, cb);
  });
};

/**
Install the passed version
This will first check, if the version is already installed.

@param version The version to install
@param cb A callback with (error)
*/
nodist.prototype.install = function install(version, cb) {
  var n = this;
  this.listInstalled(function(err, installed){
    if(err) return cb(err);
    
    n.listAvailable(function(err, available) {
      if(installed.indexOf(version) != -1)
        return cb(null);// already installed.
      
      n.fetch(version, function(err) {
        if(err) return cb(err);
        return cb(null);
      });
    });
  });
};

/**
Install all available versions.

@param cb A callback with (error, installed_version) that gets called for each version that is installed.
*/
nodist.prototype.installAll = function(cb) {
  var n = this;
  
  this.listInstalled(function(err, installed) {
    if(err) return cb(err);
    
    n.listAvailable(function(err, available) {
      if(err) return cb(err);
      available.forEach(function(version) {
        if(installed.indexOf(version) != -1)
          return cb(null, version);
        
        n.fetch(version, function(err) {
          if(err) return cb(err);
          return cb(null, version);
        });
      });
    });
  });
};

/**
Remove an installed version
@param version the version to remove
@param cb A callback with (error)
*/
nodist.prototype.remove = function remove(version, cb) {
  var n = this;
  var exe = this.resolveToExe(version);
  var versionDir = path.dirname(exe);
  
  fs.exists(versionDir, function(exists) {
    if(exists) return rimraf(versionDir, function(err) {
      if(err) return cb(err);
      cb();
    });
    cb();// don't cry if it doesn't exist
  });
};

/**
Downloads the passed version from n.sourceUrl
@param version The version to download
@param cb A callback with (error, array_of_versions)
*/
nodist.prototype.fetch = function fetch(version, callback) {
  var n = this;
  var url = this.sourceUrl+'/v'+version+'/node.exe';
  var fetch_target = this.resolveToExe(version);
  
  // Check online availability
  if(vermanager.compareable(version) < vermanager.compareable('0.5.1')) {
    return callback(new Error('There are no builds available for versions older than 0.5.1'));
  }
  
  // callback proxy (clean up things on error)
  var cb = function(err) {
    if(err) {
      n.remove(version, function(e) {// clean up
        if(e) return callback(new Error(err.message+'. Couldn\'t clean after error: '+e.message));
        callback(err);// pass on the error
      });
      return;
    }

    return callback(null, version);
  };
  
  // create path if necessary
  mkdirp.sync(path.dirname(fetch_target));
  
  // fetch from url
  var stream = request({ url: url, pool: {maxSockets: 25}}, function(err, resp){
    if(err || resp.statusCode != 200) {
      return cb(new Error('Couldn\'t fetch '+version+': '+(err? err.message : 'HTTP '+resp.statusCode)));
    }
    cb();
  });
  var writer = fs.createWriteStream(fetch_target);
  stream.pipe(writer);
  stream.on('error', function(err) {
    cb(new Error('Couldn\'t fetch '+version+': '+err.message));
  });
  writer.on('error', function(err) {
    cb(new Error('Couldn\'t write fetched version '+version+': '+err.message));
  });
};

/**
Deploys a node version. This will implicitly install the version, if it isn't already
*/
nodist.prototype.deploy = function deploy(version, cb) {
  var n = this;
  var source = this.resolveToExe(version);
  
  this.install(version, function(err){
    if(err) return cb(err);
    
    n.checkout(version, function(err) {
      if(err) return cb(err);
      cb(null);
    });
  });
};

/**
Use this node version globally.
*/
nodist.prototype.checkout = function checkout(version, cb) {
  var n = this;
  var source = this.resolveToExe(version);
  
  var read = fs.createReadStream(source);
  var write = fs.createWriteStream(__dirname+'\\..\\bin\\node.exe')
  read.on('error', onerror)
  write.on('error', onerror)
  
  read.pipe(write)
  .on('close', cb)
  
  function onerror(er){
    cb(new Error('Couldn\'t activate version '+version+' ('+er.message+')'))
  }
};

/**
Emulates the passed node version with args
@param cb A callback with (error) Will be called on error or exit.
*/
nodist.prototype.emulate = function emulate(version, args, cb) {
  var n = this;

  this.install(version, function(err) {
    if(err) return cb(err);
    
    var node = child_process.spawn(n.resolveToExe(version), args, {
      stdio: 'inherit',
      cwd: path.resolve('.')
    });
    node.on('exit', cb.bind(n, null));// onexit: cb(err=null, code)
  });
};