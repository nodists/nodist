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
};

var abort = function abort(msg) {
  exit(1, !msg? null : msg.split('. ').join('.\r\n'));
};

var sanitizeVersion = function sanitizeVersion(v) {
  if (!nodist.validateVersion(v)) {
    abort('Please provide a valid version number.');
  }
  return v.replace(nodist.semver,'$1');
};

// get path to the nodist folder
var nodistPath = fs.realpathSync(path.dirname(process.argv[1]+'.'));

process.title = 'nodist';
function help() {
console.log('A node version manager for windows');
  console.log('Usage:');
  console.log('');
  console.log('    nodist                         List all installed node versions.');
  console.log('    nodist list                    ');
  console.log('    nodist ls                      ');
  console.log('');
  console.log('    nodist <version>               Use the specified node version globally (downloads the executable, if necessary).');
  console.log('');
  console.log('    nodist add <version>           Download the specified node version.');
  console.log('    nodist + <version>             ');
  console.log('');
  console.log('    nodist rm <version>            Uninstall the specified node version.');
  console.log('    nodist - <version>             ');
  console.log('');
  console.log('    nodist run <version> -- <file> Run <file> with the specified node version (downloads the executable, if necessary).');
  console.log('    nodist r <version> -- <file>   ');
  console.log('');
  console.log('    nodist bin <version>           Get the path to the specified node version (downloads the executable, if necessary).');
  console.log('');
  console.log('    nodist --help                  Display this help');
  console.log('');
  console.log('    nodist -v                      Display nodist version');
  console.log('');
  console.log('Examples:');
  console.log('');
  console.log('    nodist 0.8.1                   Use node v0.8.1 globally');
  console.log('    nodist v0.5.10                 Use node v0.5.10 globally');
  console.log('    nodist r v0.8.1 -- foo.js -s   Run `foo.js -s` with node v0.8.1, regardless of the global version');
  console.log('    nodist - 0.5.10                Uninstall node v0.5.10');
  console.log('    nodist latest                  Use the latest available node version globally (downloads the executable).');
}

var n = new nodist(
  (process.env['NODIST_PREFIX']
    ? process.env['NODIST_PREFIX']
    : nodistPath+'\\..\\..\\' )
  +'node.exe',
  'http://nodejs.org/dist',
  nodistPath+'\\v'
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
if (!argv._[0] && !process.argv[2]) {
  command = 'list';
}

// List all installed buids
if (command == 'list' || command == 'ls') {

  nodist.determineVersion(n.target, function (err, current) {
    if(err) void(0); //don't bother, if we don't know current version
    
    n.listInstalled(function(err, ls) {
      if(err) abort(err.message+'. Sorry.');
      if(ls.length == 0) abort('No builds installed, yet.');
      
      // display all versions
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
  version = sanitizeVersion(version);
  
  n.remove(version, function() {
    exit();
  });
}else

// Run a specific build
if ((command == 'run' || command == 'r') && argv._[1]) {
  var version = argv._[1];
  version = sanitizeVersion(version);
  
  n.emulate(version, argv._.splice(2), function(err, code) {
    if(err) abort(err.message+'. Sorry.');
    exit(code);
  });
}else

// Fetch a specific build
if ((command == 'add' || command == '+') && argv._[1]) {
  var version = argv._[1];
  version = sanitizeVersion(version);
  
  n.install(version, function(err, real_version) {
    if(err) abort(err.message+'. Sorry.');
    if(version == 'latest' || version == 'stable') console.log(real_version);
    exit();
  });
}else

// Get the path to a specific version
if ((command == 'bin') && argv._[1]) {
  var version = argv._[1];
  version = sanitizeVersion(version);
  
  n.install(version, function(err) {
    if(err) abort(err.message+'. Sorry.');
    console.log(n.resolveToExe(version));
    exit();
  });
  
  
}else

// Globally use the specified node version
if (argv._[0]) {
  var version = argv._[0];
  version = sanitizeVersion(version);
  
  n.deploy(version, function(err, real_version) {
    if(err) abort(err.message+'. Sorry.');
    if(version == 'latest') console.log(real_version);
    exit();
  });
}else

// unknown parameters -> display help
{
  help();
  exit();
}