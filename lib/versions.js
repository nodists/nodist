var semver = require('semver');

var versions = module.exports;

/**
Returns a number representation of the version number that can be compared with other such representations
e.g. compareable('0.6.12') > compareable('0.6.10')
*/
versions.compareable = function compareable(ver) {
  if(~ver.indexOf('iojs')) ver = ver.substr('iojsv'.length)
  if(~ver.indexOf('node')) ver = ver.substr('nodev'.length)
  var parts = ver.split('.');
  return parseInt(parts.map(function(d){ while(d.length < 3) d = '0'+d; return d; }).join(''), 10);
}

/*
Returns the matching version number in a list of sorted version numbers
*/
versions.find = function(version_spec, list, cb) {
  var v, i = list.length-1;
  
  if(version_spec.match(/^stable$/i) || version_spec.match(/^node-?stable$/i) || version_spec.match(/^stable-?node$/i)) {
    if(i >= 0) do { v = list[i--] }while(v && (!~v.indexOf('node') || parseInt(v.substr('nodev'.length).split('.')[1]) % 2 != 0 ) && i >= 0);// search for an even number: e.g. 0.2.0
  }else
  if(version_spec.match(/^latest-?node$/i) || version_spec.match(/^node-?latest$/i)) {
    v = list
    .filter(function(v) { return !!~v.indexOf('node') })
    .reduce(function(v1, v2) {
      return versions.compareable(v1) > versions.compareable(v2)? v1 : v2
    }, '0.0.0')
  }else
  if(version_spec.match(/^latest-?iojs$/i) || version_spec.match(/^iojs-?latest$/i)) {
    v = list
    .filter(function(v) { return !!~v.indexOf('iojs') })
    .reduce(function(v1, v2) {
      return versions.compareable(v1) > versions.compareable(v2)? v1 : v2
    }, '0.0.0')
  }else
  if(~version_spec.indexOf('iojs')) {
    version_spec = version_spec.substr('iojsv'.length)
    if(i >= 0) do { v = list[i--] }while(v && ( !semver.satisfies(v, version_spec) || !~v.indexOf('iojs')) && i >= 0);
    if(!semver.satisfies(v, version_spec) || !~v.indexOf('iojs') ) v = null;
  }else{
    if(~version_spec.indexOf('node')) version_spec = version_spec.substr('nodev'.length)
    if(i >= 0) do { v = list[i--] }while(v && !semver.satisfies(v, version_spec) && i >= 0);
    if(!semver.satisfies(v, version_spec)) v = null;
  }
  if(!v) return cb(new Error('Version spec, "' + version_spec + '", didn\'t match any available version'));
  cb(null, v);
};
