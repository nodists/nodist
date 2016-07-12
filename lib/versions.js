'use strict';
var semver = require('semver');

var versions = module.exports;


/**
 * Returns a number representation of the version number that can be compared
 *  with other such representations
 * e.g. compareable('0.6.12') > compareable('0.6.10')
 * @param {string} ver
 * @return {number} comparable version
*/
versions.compareable = function compareable(ver){
  if(ver[0] == 'v') ver = ver.substr(1);
  var parts = ver.split('.');
  return +parts.map(
    function(d){
      for(var i = d.length; i < 3; i++){
        d = '0' + d;
      }
      return d;
    }
  ).join('');
};


/**
 * Returns the matching version number in a list of sorted version numbers
 * @param {string} versionSpec
 * @param {Array} list
 * @param {function} cb
 * @return {*} nothing
 */
versions.find = function(versionSpec, list, cb){
  var v, i = list.length-1;
  if(versionSpec.match(/^(latest)$/i)){
    v = list
    .reduce(function(v1, v2) {
      return versions.compareable(v1) > versions.compareable(v2)? v1 : v2;
    }, '0.0.0');
  } else {
    if(i >= 0){
      do { v = list[i--]; }
      while(
        v && (!semver.satisfies(v, versionSpec)) && i >= 0
      );
    }
    if(v && !semver.satisfies(v, versionSpec)) v = null;
  }
  if(!v || v === '0.0.0')
    return cb(new Error('Version spec, "' +
      versionSpec + '", didn\'t match any version'));
  cb(null, v);
};
