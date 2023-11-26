'use strict';
var fs = require('fs');
var path = require('path');
var promisePipe = require('promisepipe');
var ProgressBar = require('progress');
var request = require('request');
const P = require('bluebird');
var debug = require('debug')('nodist:build')

//make some promising APIs
P.promisifyAll(fs);

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

/**
 * Npm version >= 18 using symlinks that do not work in windows and have to be fixed
 * this function replace the broken symlinks with NTFS junction or move the directory if junctions are not supported
 *
 * @param {string} dirPath
 * @param {boolean} preferSymlink
 * @returns {Promise<number>} number of changed links
 */
exports.resolveLinkedWorkspaces = async function resolveLinkedWorkspaces(dirPath, preferSymlink = true) {
  let fixedLinks = 0;
  const packageLockJson = JSON.parse(fs.readFileSync(path.join(dirPath, 'package-lock.json')).toString());
  await Promise.all(Object.entries(packageLockJson.packages)
    .filter(([pkgPath, pkg]) => pkg.link === true)
    .map(async ([pkgPath, pkg]) => {

      const linkPath = path.join(dirPath, pkgPath);


      if (await fs.accessAsync(linkPath, fs.constants.F_OK).then(() => true).catch(() => false)) {
        await fs.unlinkAsync(linkPath);
      }

      let linkCreated = false;
      if (preferSymlink) {
        const linkTarget = path.join(
          ...pkgPath.split('/').slice(0, -1).map(() => '..'),
          pkg.resolved
        );
        debug('Create symlink for ', linkPath, 'with target', linkTarget);
        try {
          await fs.symlinkAsync(linkTarget, linkPath, 'junction');
          linkCreated = true;
        } catch (e) {
          debug('Link ', linkPath, 'could not be created');
        }
      }
      if (!linkCreated) {
        const from = path.join(dirPath, pkg.resolved);
        debug('Move', from, 'to', linkPath);
        await fs.renameAsync(from, linkPath);
      }

      fixedLinks++;
    }));

  return fixedLinks;
};
