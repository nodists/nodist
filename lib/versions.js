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
  if(~ver.indexOf('iojs')) ver = ver.substr('iojsv'.length);
  if(~ver.indexOf('node')) ver = ver.substr('nodev'.length);
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
  if(versionSpec.match(/^(node-?stable|stable-?node|stable)$/i)) {
    if(i >= 0){
      do {
        v = list[i--];
      }
      while(
        v && (!~v.indexOf('node') ||
        parseInt(v.substr('nodev'.length).split('.')[1]) % 2 !== 0) && i >= 0
      );// search for an even number: e.g. 0.2.0
    }
  } else if(versionSpec.match(/^(latest-?node|node-?latest|latest)$/i)){
    v = list
    .filter(function(v) { return !!~v.indexOf('node'); })
    .reduce(function(v1, v2) {
      return versions.compareable(v1) > versions.compareable(v2)? v1 : v2;
    }, '0.0.0');
  } else if(versionSpec.match(/^(latest-?iojs|iojs-?latest)$/i)){
    v = list
    .filter(function(v) { return !!~v.indexOf('iojs'); })
    .reduce(function(v1, v2) {
      return versions.compareable(v1) > versions.compareable(v2)? v1 : v2;
    }, '0.0.0');
  } else if(~versionSpec.indexOf('iojs')){
    versionSpec = versionSpec.substr('iojsv'.length);
    if(i >= 0){
      do { v = list[i--]; }
      while(
        v && (!~v.indexOf('iojs') ||
        !semver.satisfies(v.substr('iojsv'.length), versionSpec)) && i >= 0
      );
    }
    if(
      !semver.satisfies(v.substr('iojsv'.length), versionSpec) ||
      !~v.indexOf('iojs')
    ){
      v = null;
    }
  } else {
    if(~versionSpec.indexOf('node')){
      versionSpec = versionSpec.substr('nodev'.length);
    }
    if(i >= 0){
      do { v = list[i--]; }
      while(
        v && (!~v.indexOf('node') ||
        !semver.satisfies(v.substr('nodev'.length), versionSpec)) && i >= 0
      );
    }
    if(!semver.satisfies(v.substr('nodev'.length), versionSpec)) v = null;
  }
  if(!v)
    return cb(new Error('Version spec, "' +
      versionSpec + '", didn\'t match any available version'));
  cb(null, v);
};
