var semver = require('semver');

var versions = module.exports;

/**
Returns a number representation of the version number that can be compared with other such representations
e.g. compareable('0.6.12') > compareable('0.6.10')
*/
versions.compareable = function compareable(ver) {
  var parts = ver.split('.');
  return parseInt(parts.map(function(d){ while(d.length < 3) d = '0'+d; return d; }).join(''), 10);
}

/*
Returns the matching version number in a list of sorted version numbers
*/
versions.find = function(version_spec, list, cb) {
  var v, i = list.length-1;
  
  if(version_spec.match(/^stable$/i)) {
    if(i >= 0) do { v = list[i--] }while(v && parseInt(v.split('.')[1]) % 2 != 0 && i >= 0);// search for an even number: e.g. 0.2.0
  }else
  if(version_spec.match(/^latest$/i)) {
    v = list[list.length-1];
  }else{
    if(i >= 0) do { v = list[i--] }while(v && !semver.satisfies(v, version_spec) && i >= 0);
    if(!semver.satisfies(v, version_spec)) v = null;
  }
  if(!v) return cb(new Error('Version spec, "' + version_spec + '", didn\'t match any available version'));
  cb(null, v);
};
