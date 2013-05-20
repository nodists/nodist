var vows = require('vows')
  , assert = require('assert')
  , nodist = require('../lib/nodist.js')
  , fs = require('fs')
  , path = require('path')
  , exec = require('child_process').exec
  , rimraf     = require('rimraf')
  , mkdirp     = require('mkdirp')

var rootOfTestFiles = "c:\\tmp";
var nodistInstallDir = 'C:\\tmp\\nodistInstallDir';
var emptyWorkingDirectory = 'C:\\tmp\\emptyCwd';
var dotversionedWorkingDirectory = 'C:\\tmp\\dotversionedWorkingDirectory';

rimraf.sync(rootOfTestFiles);
mkdirp.sync(emptyWorkingDirectory);
mkdirp.sync(dotversionedWorkingDirectory);

var proxy = (process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy || "");

var n = new nodist(
  'http://nodejs.org/dist',
  nodistInstallDir+'\\v'
)
var nodistCmd = '"'+__dirname+'\\..\\bin\\nodist.cmd"';

vows.describe('nodist cli')
.addBatch({'nodist add': {
  topic: function() {
    exec(nodistCmd+' add 0.8.0', {cwd: emptyWorkingDirectory, env:{ NODIST_PREFIX: nodistInstallDir, HTTP_PROXY: proxy }}, this.callback)
  },
  'should install the specified version': function(err, stdout) {
    assert.ifError(err)
    assert.ok(fs.existsSync(n.resolveToExe('0.8.0')))
  }
}})
.addBatch({'nodist list': {
  topic: function() {
    exec(nodistCmd+' list', {cwd: emptyWorkingDirectory, env:{ NODIST_PREFIX: nodistInstallDir, HTTP_PROXY: proxy }}, this.callback)
  },
  'should list the installed version': function(err, stdout) {
    assert.ifError(err)
    var versions = stdout.toString().split('\n').map(function(v) {
      return v.substr(2);
    })
    assert.ok(versions.some(function(v) { return v == '0.8.0'; }))
  }
}})
.addBatch({'nodist run': {
  topic: function() {
    exec(nodistCmd+' run 0.8.0 -- -v', {cwd: emptyWorkingDirectory, env:{ NODIST_PREFIX: nodistInstallDir, HTTP_PROXY: proxy }}, this.callback)
  },
  'should run the specified version': function(err, stdout) {
    assert.ifError(err)
    assert.ok(stdout.toString().trim().match(/v0\.8\.0/))
  }
}})
.addBatch({'nodist rm': {
  topic: function() {
    exec(nodistCmd+' rm 0.8.0', {cwd: emptyWorkingDirectory, env:{ NODIST_PREFIX: nodistInstallDir, HTTP_PROXY: proxy }}, this.callback)
  },
  'should remove the specified version': function(err, stdout) {
    assert.ifError(err)
    assert.ok(!fs.existsSync(n.resolveToExe('0.8.0')))
  },
  'nodist list': {
    topic: function() {
      exec(nodistCmd+' list', {cwd: emptyWorkingDirectory, env:{ NODIST_PREFIX: nodistInstallDir, HTTP_PROXY: proxy }}, this.callback)
    },
    'shouldn\'t list the installed version': function(err, stdout) {
      assert.ifError(err)
      var versions = stdout.toString().split('\n').map(function(v) {
        return v.substr(2);
      })
      assert.ok(!versions.some(function(v) { return v == '0.8.0'; }))
    }
  }
}})
.addBatch({'should honor .node-version files': {
  topic: function() {
    var versionFile = dotversionedWorkingDirectory + "\\.node-version";
    fs.writeFileSync("0.8.0");
  }
}})
.export(module);