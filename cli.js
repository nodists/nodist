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
  , nodist   = require('./lib/nodist')
  , program  = require('optimist')
  , path     = require('path')
  , fs       = require('fs')
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

function help() {
  fs.readFile(__dirname+'\\usage.txt', function(err, usage) {
    if(err) abort('Couldn\'t fetch help info. You\'ll have to look at the README. Sorry.');
    console.log(usage.toString());
    exit();
  });
}


process.title = 'nodist';

// set up the necessary paths
var nodePath = process.env['NODIST_PREFIX'];
var nodistPath = __dirname;

// Create a nodist instance
var n = new nodist(
  'http://nodejs.org/dist',
  nodistPath+'\\v'
);

// get cli args
argv = program.argv;
command = argv._[0];



// -V Display nodist version
if(argv.v) {
  console.log(require('./package.json').version);
  exit();
}

// --HELP Display help
if(argv.help) {
  help();
}

// LIST bare call -> list
if (!argv._[0] && !process.argv[2]) {
  command = 'list';
}

// LIST all installed buids
if (command == 'list' || command == 'ls') {

  nodist.determineVersion(__dirname+'\\bin\\node.cmd', function (err, current) {
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

// DIST list all available buids
if (command == 'dist' || command == 'ds') {
  
  n.listAvailable(function(err, ls) {
    if(err) abort(err.message+'. Sorry.');
    if(ls.length == 0) abort('No builds available. Strange...');
    
    // display all versions
    ls.forEach(function(version) {
      console.log('  '+version);
    });
    exit();
  });
  
}else

// ADD fetch a specific build
if ((command == 'add' || command == '+') && argv._[1]) {
  var version = argv._[1];
  
  if(version == 'all') {
    n.install('all', function(err, real_version) {
      if(err) return console.log(err.message+'.');
      console.log('Installed '+real_version);
    });
  }else
  {
    version = sanitizeVersion(version);
    
    n.install(version, function(err, real_version) {
      if(err) abort(err.message+'. Sorry.');
      if(version == 'latest' || version == 'stable') console.log(real_version);
      exit();
    });
  }
}else

// REMOVE an installed build
if ((command == 'remove' || command == 'rm' || command == '-') && argv._[1]) {
  var version = argv._[1];
  version = sanitizeVersion(version);
  
  n.remove(version, function() {
    exit();
  });
}else

// RUN a specific build
if ((command == 'run' || command == 'r') && argv._[1]) {
  var version = argv._[1];
  version = sanitizeVersion(version);
  
  n.emulate(version, argv._.splice(2), function(err, code) {
    if(err) abort(err.message+'. Sorry.');
    exit(code);
  });
}else

// BIN get the path to a specific version
if ((command == 'bin') && argv._[1]) {
  var version = argv._[1];
  version = sanitizeVersion(version);
  
  n.install(version, function(err) {
    if(err) abort(err.message+'. Sorry.');
    console.log(n.resolveToExe(version));
    exit();
  });
  
  
}else

// PATH get the directory of a specific version to be added to the path
if ((command == 'path') && argv._[1]) {
  var version = argv._[1];
  version = sanitizeVersion(version);
  
  n.install(version, function(err, version) {
    if(err) abort(err.message+'. Sorry.');
    console.log(path.dirname(n.resolveToExe(version)));
  });
  
  
}else

// DEPLOY globally use the specified node version
if (argv._[0]) {
  var version = argv._[0];
  version = sanitizeVersion(version);
  
  n.deploy(version, function(err, real_version) {
    if(err) abort(err.message+'. Sorry.');
    if(version == 'latest' || version == 'stable') console.log(real_version);
    exit();
  });
}else

// HELP display help for unknown cli parameters
{
  help();
}