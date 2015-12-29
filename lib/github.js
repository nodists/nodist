'use strict';
var GithubApi = require('github');

var github = new GithubApi({
  version: '3.0.0'
});

//do some auth
github.authenticate({
  type: 'oauth',
  //this is a key i made for @nullivex that has no special privileges it simply
  //increases the api limit, please do not abuse it :(
  token: 'f0150031de4ef62c5f7f38c5358c7cfc3785a595'
});


/**
 * Github API instance
 * @type {module.exports|exports}
 */
module.exports = github;
