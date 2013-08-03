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
  , path     = require('path')
  , fs       = require('fs')
;

// Exit with a code and (optionally) with a message
var exit = function exit(code, msg) {
  if(msg) console.log(msg);
  process.exit(code);
};

// Abort with an optional message being displayed
var abort = function abort(msg) {
  exit(1, !msg? null : msg.split('. ').join('.\r\n'));
};

// Display the command line help and exit
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
var wantX64 = process.env['NODIST_X64'];
var nodistPath = __dirname;
// set up proxy
var proxy = (process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy || "");

// Create a nodist instance
var n = new nodist(
  'http://nodejs.org/dist',
  (nodePath? nodePath : nodistPath)+'\\v',
  proxy.replace("https://", "http://") //replace https for http, nodejs.org/dist doesnt support https 
  ,wantX64
);

// Parse args
argv = process.argv.splice(2);
argv.remainder = [];
if(argv.indexOf('--') !== -1) {
  argv.remainder = argv.splice(argv.indexOf('--')).slice(1);
}
args = argv.join(' ');
command = argv[0];



// -V Display nodist version
if (args.match(/-v/i) !== null) {
  console.log(require('./package.json').version);
  exit();
}

// --HELP Display help
if (args.match(/--help/i)) {
  help();
}

// (bare call of 'nodist') -> list
if (!argv[0]) {
  command = 'list';
}

// LIST all installed buids
if (command.match(/^list|ls$/i)) {

  nodist.determineVersion(__dirname+'\\bin\\node.exe', function (err, current) {
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
if (command.match(/^dist|ds$/i)) {
  
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
if ((command.match(/^add|\+$/i)) && argv[1]) {
  var version = argv[1]; 
  
  if(version.match(/^all$/i)) {
    n.installAll(function(err, real_version) {
      if(err) return console.log(err.message+'.');
      console.log('Installed '+real_version);
    });
  }else
  {
    n.resolveVersion(version, function(er, v) {
      if(er) abort(er.message+'. Sorry.');
      n.install(v, function(err) {
        if(err) abort(err.message+'. Sorry.');
        console.log(v);
        exit();
      });
    })
  }
}else

// REMOVE an installed build
if (command.match(/^remove|rm|-$/i) && argv[1]) {
  var version = argv[1];

  n.resolveVersion(version, function(er, v) {
    if(er) abort(er.message+'. Sorry.');
    n.remove(v, function() {
      exit();
    });
  });
}else

// RUN a specific build
if (command.match(/^run|r$/i) && argv[1]) {
  var version = argv[1];
  
  n.resolveVersion(version, function(er, v) {
    if(er) abort(er.message+'. Sorry.');
    n.emulate(v, argv.remainder, function(err, code) {
      if(err) abort(err.message+'. Sorry.');
      exit(code);
    });
  });
}else

// BIN get the path to a specific version
if (command.match(/^bin$/i) && argv[1]) {
  var version = argv[1];
  
  n.resolveVersion(version, function(er, v) {
    if(er) abort(er.message+'. Sorry.');
    n.install(version, function(err) {
      if(err) abort(err.message+'. Sorry.');
      console.log(n.resolveToExe(v));
      exit();
    });
  });
}else

// PATH get the directory of a specific version to be added to the path
if (command.match(/^path$/i) && argv[1]) {
  var version = argv[1];
  
  n.resolveVersion(version, function(er, v) {
    if(er) abort(er.message+'. Sorry.');
    n.install(version, function(err, v) {
      if(err) abort(err.message+'. Sorry.');
      console.log(path.dirname(n.resolveToExe(v)));
    });
  });
}else

// DEPLOY globally use the specified node version
if (argv[0]) {
  var version = argv[0];
  
  n.resolveVersion(version, function(er, v) {
    if(er) abort(er.message+'. Sorry.');
    n.deploy(v, function(err) {
      if(err) abort(err.message+'. Sorry.');
      console.log(v);
      exit();
    });
  });
}else

// HELP display help for unknown cli parameters
{
  help();
}