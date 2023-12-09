'use strict';
const assert = require('assert');
const debug = require('debug')('nodist:test');
const vows = require('vows');

const Npmist = require('../lib/npm');
const { createNodistInstance, promiseWithCallback } = require('./helper');

const npmBaseVersion = '6.10.1';
const versionRegex = /^v\d+\.\d+\.\d+/;

vows.describe('npm')
  .addBatch({
    'NPMIST': {
      topic: new Npmist(createNodistInstance(), npmBaseVersion),
      'calling `latestVersion()`': {
        topic(npmist) { promiseWithCallback(npmist.latestVersion(), this.callback); },
        'should return valid version number': (error, result) => {
          assert.ifError(error);
          debug('latestVersion: ' + result);
          assert.match(result, versionRegex);
        }
      },
      'calling `listAvailable()`': {
        topic(npmist) { promiseWithCallback(npmist.listAvailable(), this.callback); },
        'should return an array of available versions': (error, result) => {
          assert.ifError(error);
          debug('listVersions: ' + result);
          assert.ok(Array.isArray(result));
          result.forEach((version) => assert.match(version, versionRegex));
        }
      }
    }
  })
  .export(module);
