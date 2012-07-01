var version = process.argv[2]
  , nodist  = require('./nodist')
  , fs      = require('fs')
  , path    = require('path')
  , exit = function exit(code, msg) {
      if(msg) console.log(msg);
      process.exit(code);
    }
;

// get path to the nodist folder
var nodistPath = path.dirname(fs.realpathSync(process.execPath));

process.title = 'nodist';

if(process.argv[2] == '--help') {
  console.log("nodist is a node version manager for windows\r\n");
  console.log('Usage:');
  console.log('  nodist             Displays all installed node versions');
  console.log('  nodist <VERSION>   Globally use the specified node version');
  console.log('  nodist --help      Display this help');
  exit(0);
}


var n = new nodist(nodistPath+'/../../node.exe', nodistPath+'/v');
  n.sourceUrl  = 'http://nodejs.org/dist';

if(version && version != '') { // executed with args: Deploy node version

  // validate version number
  if (!version.match(nodist.semver)) {
    exit(1, 'Please provide a valid version number.');
  }
  
  version = version.replace(nodist.semver,'$1');
  
  n.deploy(version, function(err) {
    if(err) exit(1, err.message+' Sorry.');
    exit(0);
  });
  
}else{  // executed without args: Provide node versions

  nodist.determineVersion(n.target, function (err, current) {// determine version of currently used build
    // display all versions
    n.list().forEach(function(version) {
      var del = (version == current) ? '> ' : '  ';// highlight current
      console.log(del+version);
    });
    
    // and exit.
    exit(0);
  });
}