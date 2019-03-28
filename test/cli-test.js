'use strict';
var vows = require('vows');
var debug = require('debug')('nodist:test');
var assert = require('assert');
var nodist = require('../lib/nodist.js');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

var testPath = path.resolve(__dirname + '/tmp');
var testVersion = '4.2.1';

//populate proxy if we can
var proxy = (
  process.env.HTTP_PROXY ||
  process.env.http_proxy ||
  process.env.HTTPS_PROXY ||
  process.env.https_proxy || ''
);

//setup new nodist
var n = new nodist(
  process.env.NODIST_NODE_MIRROR || 'https://nodejs.org/dist',
  process.env.NODIST_IOJS_MIRROR || 'https://iojs.org/dist',
  path.resolve(testPath)
);


/**
 * Exec Nodist for Testing
 * @param {Array} args
 * @param {function} cb
 */
var execNodist = function execNodist(args, cb){
  var stdout = '';
  var stderr = '';
  var nodistCmd = path.resolve(__dirname + '/../bin/nodist.cmd');
  debug('execNodist','executing',nodistCmd,args.join(' '));
  var cp = spawn(
    nodistCmd,
    args,
    {
      env: {
        NODIST_PREFIX: testPath,
        NODIST_NODE_MIRROR: n.iojsSourceUrl,
        NODIST_IOJS_MIRROR: n.sourceUrl,
        HTTP_PROXY: proxy,
        DEBUG: process.env.DEBUG
      }
    }
  );
  if(process.env.TEST){
    cp.stdout.pipe(process.stdout);
    cp.stderr.pipe(process.stderr);
  }
  cp.stdout.on('data',function(chunk){
    stdout = stdout + chunk.toString();
  });
  cp.stderr.on('data',function(chunk){
    stderr = stderr + chunk.toString();
  });
  cp.on('error', function(err){
    console.log('execution error',err);
    cb(err);
  });
  cp.on('close', function(code){
    debug('execNodist', 'exec complete', code);
    console.log('exit code',code);
    cb(null, stdout, stderr, code);
  });
};

vows.describe('nodist cli')
  .addBatch({
    'nodist add': {
      topic: function() {
        execNodist(['add',testVersion], this.callback);
      },
      'should install the specified version': function(err) {
        console.log('got response for should install', err);
        assert.isNull(err);
        debug('nodist add test for', n.getPathToExe(testVersion));
        debug('nodist add exists', fs.existsSync(n.getPathToExe(testVersion)));
        assert.ok(fs.existsSync(n.getPathToExe(testVersion)));
      }
    }
  })
  .addBatch({
    'nodist list': {
      topic: function() {
        execNodist(['list'], this.callback);
      },
      'should list the installed version': function(err, stdout) {
        assert.ifError(err);
        var versions = stdout.toString().split('\n').map(function(v) {
          return v.substr(2);
        });
        assert.ok(versions.some(function(v) { return v === testVersion; }));
      }
    }
  })
  .addBatch({
    'nodist run': {
      topic: function(){
        execNodist(['run',testVersion,'--','-v'], this.callback);
      },
      'should run the specified version': function(err, stdout){
        assert.ifError(err);
        assert.ok(stdout.toString().trim().match('v' + testVersion));
      }
    }
  })
  .addBatch({
    'nodist rm': {
      topic: function(){
        execNodist(['rm',testVersion], this.callback);
      },
      'should remove the specified version': function(err){
        assert.ifError(err);
        assert.ok(!fs.existsSync(n.getPathToExe(testVersion)));
      },
      'nodist list': {
        topic: function(){
          execNodist(['list'], this.callback);
        },
        'should not list the installed version': function(err, stdout){
          assert.ifError(err);
          var versions = stdout.toString().split('\n').map(function(v){
            return v.substr(2);
          });
          assert.ok(!versions.some(function(v) { return v === testVersion; }));
        }
      }
    }
  })
  .export(module);
