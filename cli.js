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
  , nodist   = require('./nodist')
  , program  = require('optimist')
  , fs       = require('fs')
  , path     = require('path')
;

var exit = function abort(code, msg) {
  if(msg) console.log(msg);
  process.exit(code);
}

var abort = function abort(msg) {
  exit(1, msg);
}

// get path to the nodist folder
var nodistPath = path.dirname(fs.realpathSync(process.execPath));

process.title = 'nodist';
function help() {
console.log('A node version manager for windows');
  console.log('Usage:');
  console.log('');
  console.log('    nodist              List all installed node versions.');
  console.log('    nodist list         ');
  console.log('    nodist ls           ');
  console.log('');
  console.log('    nodist <version>    Use the specified node version globally (downloads the executable, if necessary).');
  console.log('');
  console.log('    nodist rm <version> Uninstall the specified node version.');
  console.log('    nodist - <version>  ');
  console.log('');
  console.log('    nodist --help       Display this help');
  console.log('');
  console.log('    nodist -v           Display nodist version');
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('    nodist 0.8.1        Globally use node v0.8.1');
  console.log('    nodist v0.5.10      Globally use node v0.5.10');
  console.log('    nodist rm 0.5.10    Uninsall node v0.5.10');
}

var n = new nodist(
  (process.env['NODIST_PREFIX']
    ? process.env['NODIST_PREFIX']
    : nodistPath+'/../../' )
  +'node.exe',
  'http://nodejs.org/dist',
  nodistPath+'/v'
);

argv = program.argv;
command = argv._[0];

// Display nodist version
if(argv.v) {
  console.log(require('./package.json').version);
  exit();
}

// Display help
if(argv.help) {
  help();
  exit();
}

// bare call -> list
if (!argv._[0]) {
  command = 'list';
}

// List all installed buids
if (command == 'list' || command == 'ls') {

  nodist.determineVersion(n.target, function (err, current) {
    // if(err) -- don't bother, if we don't know current version
    // display all versions
    n.list(function(err, ls) {
      if(err) abort('Reading the version directory '+n.sourceDir+' failed.');
      if(ls.length == 0) abort('No builds installed, yet.');
      ls.forEach(function(version) {
        var del = (version == current) ? '> ' : '  ';// highlight current
        console.log(del+version);
      });
      exit();
    });
  });
}else

// Remove an installed build
if ((command == 'remove' || command == 'rm' || command == '-') && argv._[1]) {
  var version = argv._[1];
  
  // validate version number
  version = nodist.validateVersion(version)
  if (!version) {
    abort('Please provide a valid version number.');
  }
  
  n.unlink(version, function() {
    exit();
  });
}else

// Run a specific build
if ((command == 'run' || command == 'r') && argv._[1]) {
  var version = argv._[1];
  
  // validate version number
  version = nodist.validateVersion(version)
  if (!version) {
    abort('Please provide a valid version number.');
  }
  
  n.run(version, argv._.splice(2), function() {
    exit();
  });
}else

// Fetch a specific build
if ((command == 'install' || command == 'i') && argv._[1]) {
  var version = argv._[1];
  
  // validate version number
  version = nodist.validateVersion(version)
  if (!version) {
    abort('Please provide a valid version number.');
  }
  
  n.fetch(version, n.sourceDir+'/'+version+'.exe', function(err) {
    if(err) abort(err.message+'. Sorry.');
    exit();
  });
}else

// Globally use the latest available node version
if (command == 'latest') {
  n.deploy('latest', function(err) {
    if(err) abort(err.message+' Sorry.');
    exit();
  });
}else

// Globally use the specified node version
if (argv._[0] && nodist.validateVersion(argv._[0])) {
  // validate version number
  version = nodist.validateVersion(version)
  if (!version) {
    abort('Please provide a valid version number.');
  }
  
  n.deploy(version, function(err) {
    if(err) abort(err.message+' Sorry.');
    exit();
  });
}