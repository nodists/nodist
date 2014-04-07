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

if(!process.env['NODIST_PREFIX']) abort('Please set the path to the nodist directory in the NODIST_PREFIX environment variable.')

var distUrl = 'http://nodejs.org/dist'
var nodistPrefix = process.env['NODIST_PREFIX'].replace('"', '')
var proxy = (process.env.HTTP_PROXY || process.env.http_proxy || process.env.HTTPS_PROXY || process.env.https_proxy || "");
var wantX64 = process.env['NODIST_X64']!=null? process.env['NODIST_X64']==1 : (process.arch=='x64'); // if the env var is set, use its value, other wise use process.arch
var envVersion = process.env['NODIST_VERSION']? process.env['NODIST_VERSION'].replace('"', '') : process.env['NODIST_VERSION']

// Create a nodist instance
var n = new nodist(
  distUrl
, nodistPrefix
, proxy.replace("https://", "http://") //replace https for http, nodejs.org/dist doesnt support https 
, wantX64
, envVersion
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

  n.getGlobal(function (err, global) {
    if(err) void(0);
    
    n.getLocal(function (err, local, localFile) {
      if(err) void(0);
    
      n.getEnv(function (err, env) {
        if(err) void(0);
      
        n.listInstalled(function(err, ls) {
          if(err) abort(err.message+'. Sorry.');

          if(n.wantX64) console.log('  (x64)')
          if(ls.length == 0) abort('No builds installed, yet.');
          
          current = env || local || global;
          
          // display all versions
          ls.forEach(function(version) {
            var del = '  '
              , note = ' '
            
            if (version == env) {
              note += ' (env)'
            }
            if (version == local) {
              note += ' ('+localFile+')'
            }
            if (version == global) {
              note += ' (global)'
            }
            if (version == current) del ='> ';// highlight current

            console.log(del+version+note);
          });
          exit();
        });
      });
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
    if(n.proxy) console.log('\n  (Proxy: '+n.proxy+')')
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
    n.install(v, function(err) {
      if(err) abort(err.message+'. Sorry.');
      console.log(n.getPathToExe(v));
      exit();
    });
  });
}else

// PATH get the directory of a specific version to be added to the path
if (command.match(/^path$/i) && argv[1]) {
  var version = argv[1];
  
  n.resolveVersion(version, function(er, v) {
    if(er) abort(er.message+'. Sorry.');
    n.install(v, function(err, v) {
      if(err) abort(err.message+'. Sorry.');
      console.log(path.dirname(n.getPathToExe(v)));
    });
  });
}else

// ARGS globally use the specified node version
if (command.match(/^args$/i) && argv[1]) {
  var version = argv[1]
    , args = argv.slice(2).join(' ')
  
  n.resolveVersion(version, function(er, v) {
    if(er) abort(er.message+'. Sorry.');
    n.setArgsForVersion(v, args, function(err) {
      if(err) abort(err.message+'. Sorry.');
      console.log(v, args);
      exit();
    });
  });
}else

// LOCAL use the specified version locally
if (command.match(/^local$/i) && argv[1]) {
  var version = argv[1];
  
  n.resolveVersion(version, function(er, v) {
    if(er) abort(er.message+'. Sorry.');
    n.setLocal(v, function(err, file) {
      if(err) abort(err.message+'. Sorry.');
      console.log(v, "("+file+")");
      exit();
    });
  });
}else

// GLOBAL globally use the specified node version
if (command.match(/^global$/i) && argv[1] || argv[0] && !argv[1]) {
  var version = argv[1] || argv[0];
  
  n.resolveVersion(version, function(er, v) {
    if(er) abort(er.message+'. Sorry.');
    n.setGlobal(v, function(err) {
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