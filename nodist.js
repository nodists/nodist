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

var exec = require('child_process').spawn
  , mkdirp     = require('mkdirp').sync
  , request    = require('request')
  , fs         = require('fs')
;

module.exports = nodist = function nodist(target, sourceUrl, sourceDir) {
  this.target    = target;
  this.sourceUrl = sourceUrl;
  this.sourceDir = sourceDir;
  
  // Create source dir if unexistant
  mkdirp(sourceDir);
}

nodist.semver = /^v?(\d+\.\d+\.\d+)$/ //| @TODO: Allow `0.6` -> node-v0.6.15

nodist.validateVersion = function validateVersion(ver) {
  if(!ver.match(nodist.semver)) return false;
  return ver.replace(nodist.semver,'$1');
}

nodist.compareable = function compareable(ver) {
  var parts = ver.split('.');
  return parseInt(parts.map(function(d){ while(d.length < 3) d = '0'+d; return d; }).join(''), 10);
}

nodist.determineVersion = function determineVersion(file, cb) {
  var returned = false;
  
  var node = exec(file, ['-v']);
  node.stdout.on('data', function (data) {
    var version = data.toString().trim().replace(nodist.semver, '$1');
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

nodist.prototype.fetch = function fetch(version, fetch_target, cb) {
  var n = this;
  var url = this.sourceUrl+'/'+(version=='latest'?'':'v')+version+'/node.exe';
  
  // Check online availability
  if(nodist.compareable(version) < nodist.compareable('0.5.1')) {
    return cb(new Error('There are no builds available for versions older than 0.5.1.'));
  }
  
  var canTerminate = false
  var stream = request(url, function(err, resp){
    if(err || resp.statusCode != 200) {
      fs.unlinkSync(fetch_target);
      return cb(new Error('Couldn\'t fetch '+version+' ('+(err.message || 'HTTP '+resp.statusCode)+')'));
    }
    cb();
  });
  stream.pipe(fs.createWriteStream(fetch_target));
  stream.on('error', function(err) {
    fs.unlinkSync(fetch_target);
    cb(err);
  });
};

nodist.prototype.checkout = function checkout(source, cb) {
  fs.createReadStream(source).pipe(fs.createWriteStream(this.target)).on('close', cb);
};

nodist.prototype.list = function list(cb) {
  fs.readdir(this.sourceDir, function(err, ls){
    if(err) return cb(err);
    
    ls = ls.map(function(v) {
      return v.replace(/^(.+)\.exe$/, '$1');
    });
    ls.sort(function(val1, val2){
      return nodist.compareable(val1) > nodist.compareable(val2) ? 1 : -1;
    });
    return cb(null, ls);
  })
};

nodist.prototype.deploy = function deploy(version, cb) {
  var n = this;
  var source  = this.sourceDir+'/'+version+'.exe';
  
  // checkout source if it exists
  if(fs.existsSync(source)) {
    return this.checkout(source, cb);
  }
  
  // fetch build online
  this.fetch(version, source, function(err) {
    if(err) {
      return cb(err);
    }
    
    n.checkout(source, function() {
      if(version == 'latest') {
        // clean up "latest.exe"
        nodist.determineVersion(source, function (err, real_version) {
          fs.renameSync(source, n.sourceDir+'/'+real_version+'.exe');
          console.log(real_version);
          cb();
        });
      }else
      return cb();
    });
  });
};

nodist.prototype.unlink = function unlink(version, cb) {
  var n = this;
  var source  = this.sourceDir+'/'+version+'.exe';
  
  // delete source if it exists
  if(fs.existsSync(source)) {
    return fs.unlink(source, cb);
  }
  
  return cb();
};

nodist.prototype.run = function run(version, args, cb) {
  var n = this;
  var source = this.sourceDir+'/'+version+'.exe';
  var run = function(err) {
    if(err) return cb(err);
    var node = exec(source, args);
    node.stdout.pipe(process.stdout);
    node.stderr.pipe(process.stderr);
    //process.stdin.pipe(node.stdin);
    node.on('exit', cb);
    node.on('error', cb);
  }
  
  // fetch source if it doesn't exist
  if(!fs.existsSync(source)) {
    this.fetch(version, source, run);
  }
  
  return run();
};