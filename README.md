# nodist
A Node version manager for the windows folks out there. Inspired by [n](https://github.com/visionmedia/n).

## Installation
Don't install node beforehand! Nodist was designed to replace any existing node.js installation, so *if node is already installed on your machine, uninstall it first*.

### DIY installation
1. Grab the code by unpacking the [zip](https://github.com/marcelklehr/nodist/zipball/master) in a directory for use or run `git clone git://github.com/marcelklehr/nodist.git`.
   (Note: Certain paths, such as `Program Files`, requires admin rights for nodist to work.)

3. Add `<..path..>\nodist\bin` to your system's path.
```batchfile
setx /M PATH "<..path..>\nodist\bin;%PATH%"
```
([setx not available?](http://www.computerhope.com/issues/ch000549.htm))

4. Now, run `nodist update`, which will install the dependencies.

### Fancy installation (beta)

1.  Install chocolatey: http://chocolatey.org/

2.  Run `cinst nodist -Pre`

Note: Our chocolatey package has a limitation such that a reboot is required aftewards for nodist to be accessible.  We'll try to fix this soon.

### Uninstall

1. Remove `<..path..>\nodist\bin` from your path. ([how?](http://www.computerhope.com/issues/ch000549.htm)).

2. Delete the nodist directory


## Usage
Nodist understands basic version patterns. You can use all of the following:

* `stable`
* `latest`
* `0.8` or `0.8.x` or `~0.8`
* `1` or `~1` (this isn't out, though...)
* `0.6.12`

The `v` in front of a version number is optional.


**All commands implicitly install the specified version before using it, if it isn't installed already.**

Btw, nodist also works in your PowerShell, but you might first need to 'Unblock' the file `\bin\nodist.ps1`.

### List versions
This lists all installed versions and highlights the current active one.
```
nodist ls
```

This lists all available node versions.
```
nodist dist
```

### Activate a version
Activate the specified version globally.  
All subsequent calls of `node` in any environment will use this version.
```
nodist 0.8.1
```

You can also use `latest` and `stable` here.
```
nodist latest
```

### Activate version in current env
Temporarily adds the specified version to the current *Path*, so all subsequent calls to `node` in the current terminal environment use that version.  
This doesn't have any effects on the globally activated version -- closing the current terminal window will cause nodist to forget the set version.
```
nodist use v0.7.12
```

In a batch script, use
```
call nodist use 0.7.12
```

### Run a specific version
Use this to run a specific node version, regardless of the globally activated one.
Everything after `--` will be passed to node.
```
nodist r v0.8.1 -- foo.js -s
```

### Install a version
Just checks, if the version is installed and downloads it if not.
```
nodist + v0.8.1
```

Use `nodist + all` to install everything. Get yourself a cuppa in the meantime.

### Remove a version
If you want to remove a version for some reason, use this:
```
nodist - 0.5.10
```

### All comands
Output of `nodist --help`:
```
Usage:

    nodist                          List all installed node versions.
    nodist list
    nodist ls

    nodist dist                     List all available node versions.
    nodist ds

    nodist add <version>           Download the specified node version.
    nodist + <version>

    nodist rm <version>             Uninstall the specified node version.
    nodist - <version>
    
    nodist <version>                Use the specified node version globally
                                    (downloads the executable, if necessary).
    
    nodist use <version>            Use <version> in the current environment only
                                    (usually the current terminal window).

    nodist run <version> -- <file>  Run <file> with the specified node version
    nodist r <version> -- <file>    (downloads the executable, if necessary).

    nodist bin <version>            Get the path to the specified node executable
                                    (downloads the executable, if necessary).
    
    nodist path <version>           Get the path to the specified node version directory
                                    (downloads the executable, if necessary).

    nodist update                   Update nodist's dependencies along with the globally installed npm.
    
    nodist --help                   Display this help

    nodist -v                       Display nodist version

Examples:

    nodist 0.8.1                    Use node v0.8.1 globally
    
    nodist v0.5.10                  Use node v0.5.10 globally
    
    nodist - 0.5.10                 Uninstall node v0.5.10
    
    nodist r v0.8.1 -- foo.js -s    Run `foo.js -s` with node v0.8.1, regardless
                                    of the global version
                                    
    nodist latest                   Use the latest available node version globally
                                    (downloads the executable, if necessary).
                                   
    nodist stable                   Use the latest stable available node version
                                    globally (downloads the executable, if necessary).
                                   
    nodist + all                    Installs *all* available node versions.
                                    (Get yourself a cuppa in the meantime...)
```

## Settings

### Set a proxy to use for fetching the executables
Exceedingly simple: Just set an env var containing the proxy information (can be one of `HTTP_PROXY`/`http_proxy`/`HTTPS_PROXY`/`https_proxy`).

e.g. `set HTTP_PROXY=http://myproxy.com:8213` (better put it into your system's global environment)

### Overriding x64 auto-detection
If you want to override our x64 auto-detection, the `NODIST_X64` environment variable is for you. Set it to `1` to deal with the 64bit versions of node, or to `0` to deal with the 32bit versions, regardless of what system you're on.

e.g. `set NODIST_X64=1` (better put it into your system's global environment)


## Got ideas?  Doesn't work for you? Want to give feedback?
[File an issue](https://github.com/marcelklehr/nodist/issues) and tell me what you'd change or add or what doesn't work for you. Every issue is welcome!

## Details
`nodist` stores your node executables in `path\to\nodist\v\`, so it can see what's installed and activate previously installed versions.  
When a version is activated globally, `nodist` copies it from `nodist\v\<version>\node.exe` to `nodist\bin\node.exe`. 64bit versions are stored in a separate directory called `\v-x64`. You can alter the path where versions are stored (default: `path/to/nodist`) using the `NODIST_PREFIX` env variable.

`nodist` comes with the latest npm version and will use this all the time, regardless of the node version you have installed.

As the global node version will be subject to change, `nodist` comes with its own node version and command line files.

Btw, nodist also works in your PowerShell!

## What's with the name?
The name nodist was chosen to emphasise the puristic approach of implementing a node version manager and is not to be confused with the term 'nudist'. It was never my intention to make a connection between these two subjects by giving this program a similar name. What did you think?!

## Legal
Copyright (c) 2012-2013 by Marcel Klehr  
MIT License

## Changelog

v0.4.3
 * Fix a type coercion catch in x64 detection (NODIST_X64=0 had the same effect as NODIST_X64=1; thanks to @springmeyer for reporting)

v0.4.2
 * Use the right URI for fetching the x64 executables

v0.4.1
 * x64 auto-detection

v0.4.0
 * Refactor 64bit support (All commands now work with x64 versions)
 * Make npm use the user-chosen node version (thanks to @k-j-kleist for reporting)
 * Fix some minor bugs in error handling
 * Don't try installing 'vUpdate' after running nodist update
 * Install latest stable version after running nodist update

v0.3.11

 * Fix 'use' command in powershell (thanks to @paulbatum for reporting)

v0.3.10

 * Fix 'use' by fixing 'path' and 'bin' commands

v0.3.9

* Fix renaming mistake (thanks to @paulbatum for reporting)
* Tighten `nodist update`

v0.3.8

* Add support for x64 versions (thanks to @CycoPH)
* Improve performance by caching version lists

v0.3.7

* Fix `nodist run` and `list` commands
* Allow people to use an http proxy (thanks to @gratex)

v0.3.5

* Fix install script. How did that go astray?

v0.3.4

* Fix error message if n.checkout fails

v0.3.3

* Fix installer (thanks to @Ciantic for reporting)
* Fix a bug introduced by npm update

v0.3.2

* Update npm on install/update

v0.3.1

* Optimized `nodist + all`
* Use a clean npm
* Don't bundle dependencies, anymore -- `nodist update` must be run at install

v0.3.0

* Dropped `optimist` (caused more problems than it solved)
* Using `node-semver`, now, for better usability... (fixes #10)
* Allow use of version patterns for every command (fixes #9)
* Fix issue #8: Version patterns should *require* internet access

v0.2.8

* Fix use command

v0.2.7

* Deploy by copying node.exe, again, this should allow people to use nodist together with nodemon

v0.2.6

* Fix a bug, that used to break everything on Win7 x64

v0.2.5

* Updated npm to v1.1.48

v0.2.4

* Fix `nodist update` command to work from all drives
* Add basic support for MinGW shell (thanks to jdiamond) (update and use commands are still missing)
* Fix tests
* Allow npm updates with `npm u npm -g`
* updated npm

v0.2.3

* Install latest stable as default version
* Add update command
* Updated npm
