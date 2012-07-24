var vows = require('vows')
  , assert = require('assert')
  , nodist = require('../lib/nodist.js')
  , fs = require('fs')
  , path = require('path')
  , exec = require('child_process').exec

var testPath = 'C:\\tmp\\'

var n = new nodist(
  'http://nodejs.org/dist',
  testPath+'\\v'
)
var nodistCmd = '"'+__dirname+'\\..\\bin\\nodist.cmd"';

vows.describe('nodist cli')
.addBatch({'nodist add': {
  topic: function() {
    exec(nodistCmd+' add 0.8.0', {env:{ NODIST_PREFIX: testPath }}, this.callback)
  },
  'should install the specified version': function(err, stdout) {
    assert.ifError(err)
    assert.ok(fs.existsSync(n.resolveToExe('0.8.0')))
  }
}})
.addBatch({'nodist list': {
  topic: function() {
    exec(nodistCmd+' list', {env:{ NODIST_PREFIX: testPath }}, this.callback)
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
    exec(nodistCmd+' run 0.8.0 -- -v', {env:{ NODIST_PREFIX: testPath }}, this.callback)
  },
  'should run the specified version': function(err, stdout) {
    assert.ifError(err)
    assert.ok(stdout.toString().trim().match(/v0\.8\.0/))
  }
}})
.addBatch({'nodist rm': {
  topic: function() {
    exec(nodistCmd+' rm 0.8.0', {env:{ NODIST_PREFIX: testPath }}, this.callback)
  },
  'should remove the specified version': function(err, stdout) {
    assert.ifError(err)
    assert.ok(!fs.existsSync(n.resolveToExe('0.8.0')))
  },
  'nodist list': {
    topic: function() {
      exec(nodistCmd+' list', {env:{ NODIST_PREFIX: testPath }}, this.callback)
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
.export(module);