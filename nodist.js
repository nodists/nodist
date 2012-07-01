exec = require('child_process').spawn
  , mkdirp     = require('mkdirp').sync
  , request    = require('request')
  , fs         = require('fs')
;

module.exports = nodist = function nodist(target, sourceUrl, sourceDir) {
  this.target    = target;
  this.sourceUrl = sourceUrl;
  this.sourceDir = sourceDir;
  
  // Create source dir if unexistant
  mkdirp(sourceDir);
}

nodist.semver = /^v?(\d+\.\d+\.\d+|latest)$/ //| @TODO: Allow `0.6` -> node-v0.6.15

nodist.compareable = function compareable(ver) {
  var parts = ver.split('.');
  return parseInt(parts.map(function(d){ while(d.length < 3) d = '0'+d; return d; }).join(''), 10);
}

nodist.determineVersion = function determineVersion(file, cb) {
  var returned = false;
  
  var node = exec(file, ['-v']);
  node.stdout.on('data', function (data) {
    var version = data.toString().trim().replace(nodist.semver, '$1');
    if(!returned) cb(null, version);
    returned = true;
  });
  node.on('error', function (err) {
    if(!returned) cb(err);
    returned = true;
  });
  node.on('exit', function (err) {
    if(!returned) cb(err);
    returned = true;
  });
}

nodist.prototype.fetch = function fetch(version, fetch_target, cb) {
  var n = this;
  var url = this.sourceUrl+'/'+(version=='latest'?'':'v')+version+'/node.exe';
  var canTerminate = false
  var stream = request(url, function(err, resp){
    if(err || resp.statusCode != 200) {
      fs.unlinkSync(fetch_target);
      fs.unlinkSync(n.target);
      return cb(err || new Error('HTTP '+resp.statusCode));
    }
    cb();
  });
  stream.pipe(fs.createWriteStream(fetch_target));
  stream.pipe(fs.createWriteStream(this.target));
  stream.on('error', function(err) {
    fs.unlinkSync(fetch_target);
    fs.unlinkSync(n.target);
    cb(err);
  });
};

nodist.prototype.deploy = function deploy(version, cb) {
  var n = this;
  var source  = this.sourceDir+'/'+version+'.exe';
  
  // checkout source if it exists
  if(fs.existsSync(source)) {
    return this.checkout(source, cb);
  }
  
  // Check online availability
  if(nodist.compareable(version) < nodist.compareable('0.5.1')) {
    return cb(new Error('There are no builds available for versions older than 0.5.1.'));
  }
  
  // fetch build online
  this.fetch(version, source, function(err) {
    if(err) {
      cb(new Error('Couldn\'t fetch '+version+' ('+err.message+').'));
    }
    
    if(version == 'latest') {// clean up "latest.exe"
      nodist.determineVersion(source, function (err, real_version) {
        fs.renameSync(source, n.sourceDir+'/'+real_version+'.exe');
        console.log(real_version);
        cb();
      });
    }else
    return cb();
  });
};

nodist.prototype.checkout = function checkout(source, cb) {
  fs.createReadStream(source).pipe(fs.createWriteStream(this.target)).on('close', cb);
};

nodist.prototype.list = function list(empty_cb) {
  var list = fs.readdirSync(this.sourceDir).map(function(v) {
    return v.replace(/^(.+)\.exe$/, '$1');
  })
  .sort(function(val1, val2){
    return nodist.compareable(val1) > nodist.compareable(val2) ? 1 : -1;
  });
  if(list.length == 0) empty_cb();
  return list;
};