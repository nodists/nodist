'use strict';
var fs = require('fs');
var path = require('path');
var promisePipe = require('promisepipe');
var ProgressBar = require('progress');
var request = require('request');


/**
 * Copy File
 * @param {string} source
 * @param {string} target
 * @param {function} cb
 */
exports.copyFile = function copyFile(source, target, cb){
  var cbCalled = false;

  var rd = fs.createReadStream(path.resolve(source));
  rd.on('error', function(err){
    done(err);
  });
  var wr = fs.createWriteStream(path.resolve(target));
  wr.on('error', function(err){
    done(err);
  });
  wr.on('close', function(){
    done();
  });
  rd.pipe(wr);

  function done(err) {
    if (!cbCalled) {
      cb(err);
      cbCalled = true;
    }
  }
};


/**
 * Download file with progress bar
 * @param {string} url
 * @param {string} dest
 * @param {function} cb
 */
exports.downloadFile = function downloadFile(url, dest, cb){
  dest = path.resolve(dest);
  var file = fs.createWriteStream(dest);
  var progress = {};
  var fileSize = 1;
  var req = request.get(url);
  req.on('response',function(res){
    fileSize = Math.round(res.headers['content-length'] / 1024);
    progress = new ProgressBar(
      path.basename(dest) +
      ' [:bar] :current/:total KiB :rate/Kbps :percent :etas',
      {
        complete: '=',
        incomplete: ' ',
        width: 15,
        total: fileSize
      }
    );
  });
  req.on('data',function(chunk){
    progress.tick(Math.round(chunk.length / 1024));
  });
  promisePipe(req,file).then(function(){
    progress.update(1,fileSize);
    cb();
  });
};
