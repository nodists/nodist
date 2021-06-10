'use strict';
var GithubApi = require('github');

var github = new GithubApi({
  version: '3.0.0'
});

// -------------------------
// Github Authentication
//-------------------------
var githubCredentials = {
  type: 'oauth',
  // in order to raise your API limits place a token here generated from github
  // then remove the comment below
  token: 'xxx'
};
// remove the comment at the beginning of the line below to activate auth
// github.authenticate(githubCredentials);

/**
 * Github API instance
 * @type {module.exports|exports}
 */
module.exports = github;
