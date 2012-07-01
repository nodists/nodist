/*!
 * nodist
 * A Node version manager for the windows folks out there.
 * Copyright 2012 by Marcel Klehr <mklehr@gmx.net>
 *
 * (MIT LICENSE)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

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

// --help switch
if(process.argv[2] == '--help') {
  console.log("nodist is a node version manager for windows\r\n");
  console.log('Usage:');
  console.log('  nodist             Displays all installed node versions');
  console.log('  nodist <VERSION>   Globally use the specified node version');
  console.log('  nodist --help      Display this help');
  exit(0);
}


var n = new nodist(
  (process.env['NODIST_PREFIX']
  ? process.env['NODIST_PREFIX'] : nodistPath+'/../../' )+'node.exe',
  'http://nodejs.org/dist',
  nodistPath+'/v'
);

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
  
}else{  // executed without args: List installed builds

  nodist.determineVersion(n.target, function (err, current) {// determine version of currently used build
    
    // display all versions
    n.list(function() {
      console.log('No builds installed, yet.');
    }).forEach(function(version) {
      var del = (version == current) ? '> ' : '  ';// highlight current
      console.log(del+version);
    });
    
    // and exit.
    exit(0);
  });
}