'use strict';
var fs = require('fs');
var path = require('path');
var promisePipe = require('promisepipe');
var ProgressBar = require('progress');
var request = require('request');
var debug = require('debug')('nodist:build')

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
 * @param {number} loopCount  only used to prevent redirect loops looking for
 *   content length
 */
exports.downloadFile = function downloadFile(url, dest, cb, loopCount){
  dest = path.resolve(dest);
  var file = fs.createWriteStream(dest);
  var progress = {};
  var fileSize = 1;
  var req = request({url: url});
  req.on('response',function(res){
    if(res.statusCode !== 200){
      cb(new Error('Failed to read response from ' + url));
    } else if(!res.headers['content-length']){
      if(!loopCount) loopCount = 0;
      if(loopCount < 5){
        loopCount++;
        debug('build.downloadFile',
          'Failed to find content length on ' + url + ' retry ' + loopCount);
        return downloadFile(url,dest,cb);
      } else {
        cb(new Error('Too many redirects looking for content length'));
      }
    } else {
      var fileSize = Math.round(
        ((+res.headers['content-length']) || 3145728) / 1024
      );
      progress = new ProgressBar(
        path.basename(dest) +
        ' [:bar] :current/:total KiB :rate/Kbps :percent :etas',
        {
          complete: '=',
          incomplete: ' ',
          width: 15,
          total: fileSize,
          clear: true
        }
      );
    }
  });
  req.on('data',function(chunk){
    if(progress && 'function' === typeof progress.tick)
      progress.tick(Math.round(chunk.length / 1024));
  });
  promisePipe(req,file).then(function(){
    progress.update(1,fileSize);
    cb();
  });
};


/**
 * Download file with progress bar
 * @param {string} url
 * @param {string} dest
 * @param {function} cb
 * @param {number} loopCount  only used to prevent redirect loops looking for
 *   content length
 */
exports.downloadFileStream = function downloadFileStream(url) {
  var loopCount
   , progress = {}
   , fileSize = 1;
  var req = request({url: url});
  req.on('response',function(res){
    if(res.statusCode !== 200){
      req.emit('error', new Error('Failed to read response from ' + url));
    } else if(!res.headers['content-length']){
      if(!loopCount) loopCount = 0;
      if(loopCount < 5){
        loopCount++;
        debug('build.downloadFile',
          'Failed to find content length on ' + url + ' retry ' + loopCount);
        return downloadFileStream(url);
      } else {
        req.emit('error',new Error('Too many redirects looking for content length'));
      }
    } else {
      var fileSize = Math.round(
        ((+res.headers['content-length']) || 3145728) / 1024
      );
      progress = new ProgressBar(
        url +
        ' [:bar] :current/:total KiB :percent :etas',
        {
          complete: '=',
          incomplete: ' ',
          width: 15,
          total: fileSize,
          clear: true
        }
      );
    }
  });
  req.on('data',function(chunk){
    if(progress && 'function' === typeof progress.tick)
      progress.tick(Math.round(chunk.length / 1024));
  });
  return req
}
