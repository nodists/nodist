'use strict';
const { Octokit } = require('@octokit/rest');
const nodistPackage = require('../package.json')

var octokit = new Octokit({
  auth: process.env.NODIST_GITHUB_TOKEN,
  userAgent: `nodist v${nodistPackage.version}`,
});

/**
 * Github API instance
 * @type {module.exports|exports}
 */
module.exports = octokit;
