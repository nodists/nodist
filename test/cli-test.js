'use strict';
var vows = require('vows');
var debug = require('debug')('nodist:test');
var assert = require('assert');
var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;
var rimraf = require('rimraf');
var { testPath, createNodistInstance } = require('./helper');

var testVersion = '4.2.1';

//populate proxy if we can
var proxy = (
  process.env.HTTP_PROXY ||
  process.env.http_proxy ||
  process.env.HTTPS_PROXY ||
  process.env.https_proxy || ''
);

// check if node is available for tests
if (!fs.existsSync(path.join(__dirname, '..', 'node.exe'))) {
  console.log('node.exe missing in the main directory');
  process.exit(1);
}

// clean testpath
if ((process.env.NODIST_TESTS_CLEAN || '1') === '1') {
  rimraf.sync(testPath);
}

//setup new nodist
var n = createNodistInstance();

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
        NODIST_NODE_MIRROR: n.sourceUrl,
        NODIST_IOJS_MIRROR: n.iojsSourceUrl,
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
    debug('execNodist', 'exec failed with error', err);
    cb(err);
  });
  cp.on('close', function(code){
    var err = null;
    debug('execNodist', 'exec completed with', { err, stdout, stderr, code });
    cb(err, stdout, stderr, code);
  });
};

vows.describe('nodist cli')
  .addBatch({
    'nodist add': {
      topic: function() {
        execNodist(['add',testVersion], this.callback);
      },
      'should install the specified version': function(err, stdout) {
        assert.isNull(err);
        assert.match(stdout, new RegExp(testVersion));
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
          return v.trim();
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
      'should remove the specified version': function(err, stdout){
        assert.isNull(err);
        assert.equal(stdout, '');
        assert.ok(!fs.existsSync(n.getPathToExe(testVersion)));
      },
      'nodist list': {
        topic: function(){
          execNodist(['list'], this.callback);
        },
        'should not list the installed version': function(err, stdout){
          assert.ifError(err);
          var versions = stdout.toString().split('\n').map(function(v){
            return v.trim();
          });
          assert.ok(!versions.some(function(v) { return v === testVersion; }));
        }
      }
    }
  })
  .export(module);
