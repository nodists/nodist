# nodist

[![Join the chat at https://gitter.im/marcelklehr/nodist](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/marcelklehr/nodist?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
A Node version manager for the windows folks out there. Inspired by [n](https://github.com/visionmedia/n). And [nodenv](https://github.com/OiNutter/nodenv).

```
> nodist 0.10
0.10.26

> node -v
v0.10.26

> nodist
  0.10.24
  0.10.25
> 0.10.26 (global)
  0.11.11
  0.11.12
```

(see [Usage](#usage))

You might also be interested in [iodist](https://github.com/marcelklehr/iodist), a version manager for io.js.


## Installation
Nodist was designed to replace any existing node.js installation, so *if node is already installed on your machine, uninstall it first*.

### DIY installation
1. `git clone git://github.com/marcelklehr/nodist.git` (or grab the [zip](https://github.com/marcelklehr/nodist/zipball/master))  
   (Note that certain paths, e.g. `Program Files`, require admin rights!)

2. `set PATH="path\to\nodist\bin;%PATH%"` ([how?](http://www.computerhope.com/issues/ch000549.htm))

3. `set NODIST_PREFIX="path\to\nodist"`

4. `set NODE_PATH="path\to\nodist\bin\node_modules;%NODE_PATH%"` if you want your globally-installed modules to be visible in `node` REPL

5. Run `nodist selfupdate` (updates the dependencies and sets npm's global prefix)

6. `npm config set prefix "%NODIST_PREFIX%\bin"`

### Fancy installation (beta; discouraged)

1.  Install chocolatey: http://chocolatey.org/

2.  Run `cinst nodist -Pre`

Note: Our chocolatey package has a limitation such that a reboot is required aftewards for nodist to be accessible.  We'll try to fix this soon.

### Migrating from <=0.4 to 0.5
Instead of copying around the executables, there's now a binary shim (written in go). Prior to 0.4 the global executable was switched everytime you changed the version,
now nodist uses a binary shim that makes sure every call to node gets the correct versoin, so when migrating to 0.5, please make sure that `/nodist/bin/node.exe` is that shim.
You can build the shim yourself from source (`nodist/src/shim.go`) with `nodist/build.bat`, but it should come ready with the zip and git packages.

### Uninstall

1. Remove `<..path..>\nodist\bin` from your path. ([how?](http://www.computerhope.com/issues/ch000549.htm)).

3. Remove the `NODIST_PREFIX` env var.

2. Delete the nodist directory


## Usage
Nodist understands version patterns, like `0.8` or `0.8.x` or `~0.8` as well as `0.8.12` or `v0.8.12`.
As an added bonus, you may also use `latest` and `stable`.

Btw, nodist also works in your PowerShell, but you might first need to 'Unblock' the file `\bin\nodist.ps1`.

### Commands
*All commands implicitly install the specified version before using it, if it's not installed already.*

```
> nodist
# Lists installed versions highlighting the active one.
```

```
> nodist 0.8.1
# Sets the global node version.
```

```
> nodist local 0.8.1
# Sets the node version per directory (including subdirectories).
```

```
> nodist env v0.7.12
# Sets the node version per terminal.
```

```
call nodist env 0.7.12
# In a batch script use `call`.
```

```
> nodist dist
# Lists all available node versions.
```

```
> nodist r v0.8.1 -- foo.js -s
# Runs a specific version without modifying any state.
```

```
> nodist + v0.8.1
# Just checks, if the version is installed and downloads it if not.

> nodist + all
# will install *everything*.
```

```
> nodist - 0.5.10
# Removes a version.
```


```
> nodist --help
# Displays a complete list of commands with examples.
```

### Settings

```
> set HTTP_PROXY=http://myproxy.com:8213
# Set a proxy to use for fetching the executables
# (you may also use `HTTP_PROXY`/`http_proxy`/`HTTPS_PROXY`/`https_proxy`).
```

```
> set NODIST_X64=0
# Override x64 auto-detection.
# (Set to `1` to enforce 64bit, `0` to enforce 32bit.)
```

## Details
Node executables are stored in `NODIST_PREFIX\v` and `NODIST_PREFIX\v-x64`.
The global `node.exe` is a shim and chooses the right node version to run based on the various version settings:
 * global -- `NODIST_PREFIX\.node-version` contains the global node version 
 * local -- `./.node-version` in the current working directory contains the local node verison
 * env -- `NODIST_VERSION` containst the environmental node version

The latest npm version is available out of the box.

As the global node version will be subject to change, `nodist` comes with its own dedicated node binary.

## Got ideas?  Doesn't work for you? Want to give feedback?
[File an issue](https://github.com/marcelklehr/nodist/issues) and tell me what you'd change or add or what doesn't work for you. Every issue is welcome!

## Legal
Copyright (c) 2012-2014 by Marcel Klehr  
MIT License

## Changelog

v0.5.2
 * Fix nodist version

v0.5.1
 * Fix npm prefix in `nodist selfupdate`

v0.5.0
 * Use a binary shim
 * Support for localized version switching

v0.4.8
 * Check in dependencies to avoid relying on npm on install

v0.4.7
 * Update bundled npm to v1.4.6 and check-in all files

v0.4.6
 * Update pre-packaged npm to v1.4.3

v0.4.5
 * Fix `nodist -v` in powershell (thanks to @devert for reporting)

v0.4.4
 * Fix GOTO in batch file (thanks to @BergWerkGIS)

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
