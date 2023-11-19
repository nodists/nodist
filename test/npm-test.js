'use strict';
const assert = require('assert');
const debug = require('debug')('nodist:test');
const vows = require('vows');

const Npmist = require('../lib/npm');
const { createNodistInstance, promiseWithCallback } = require('./helper');

const npmBaseVersion = '6.10.1';

vows.describe('npm')
  .addBatch({
    'NPMIST': {
      topic: new Npmist(createNodistInstance(), npmBaseVersion),
      'calling `latestVersion()`': {
        topic(npmist) { promiseWithCallback(npmist.latestVersion(), this.callback); },
        'should return valid version number': (error, result) => {
          assert.ifError(error);
          debug('latestVersion: ' + result);
          assert.match(result, /^v\d+\.\d+\.\d+$/);
        }
      }
    }
  })
  .export(module);
