# nodist

[![Join the chat at https://gitter.im/marcelklehr/nodist](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/marcelklehr/nodist?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

A node.js and io.js version manager for the windows folks out there. Inspired by [n](https://github.com/visionmedia/n). And [nodenv](https://github.com/OiNutter/nodenv).

*Heads up! Nodist v0.8 is here! Nodist supports cmd, Powershell, Git bash and Cygwin!*

```
C:\> nodist + 5
5.11.0

C:\> nodist global 5
5

C:\> node -v
v5.11.0

C:\> nodist
  0.10.26
  4.4.3
> 5.11.0 (global: 5)
```

(see [Usage](#usage))


## Installation
Nodist was designed to replace any existing node.js installation, so *if node is already installed on your machine, uninstall it first*.

### with the installer

1. Download the installer [here](https://github.com/marcelklehr/nodist/releases/download/v0.8.1/NodistSetup-v0.8.1.exe)
2. Run the installer and follow the install wizard

### via chocolatey
For this you'll need [chocolatey](https://chocolatey.org),  of course.

1. `choco install nodist`

### Activating nodist in git bash
Git bash integration is setup automatically.

### Activating nodist in cygwin
Before you are able to use nodist in cygwin you need to run the following in your cygwin terminal after installing nodist:

```
cat "$NODIST_PREFIX/bin/nodist_bash_profile_content.sh" >> ~/.bash_profile
source ~/.bash_profile
```

### Migrating from 0.7 or lower
If you're looking to upgrade your Nodist installation, the easiest way is to uninstall (see below) the old installation and install the new version with the installer above.
You may need to reset your per-directory node version settings in order for them to work in v0.8 (ones set using nodist v0.6 should work fine, ones set using v0.7 will not).

### Uninstall (v0.7)

1. Run the uninstaller either from the directory where you installed nodist, or from the Software Control Panel

2. Make sure to completely remove the nodist directory. (This will remove all your globally installed npm modules. If you don't want that, remove everything else, other than `nodist\bin\`.)

### Uninstall (<v0.7)

1. Remove `<..path..>\nodist\bin` from your path. ([how?](http://www.computerhope.com/issues/ch000549.htm)).

2. Remove the `NODIST_PREFIX` env var.

3. Delete the nodist directory

4. Run `npm config delete prefix` on the command prompt to restore NPM functionality if you are going back to the official node install.


## Usage
Nodist understands version patterns, like `0.12` or `4.x` or `~5` as well as `4.4.3` or `v4.4.3`.
As an added bonus, you may also use `latest`.

io.js is supported natively: Since node and io.js versions form a continuum you can simply use io.js versions as if they were node versions.

Btw, nodist also works in your PowerShell, but you might first need to 'Unblock' the file `bin\nodist.ps1`.

### Upgrading from < v0.8?
Starting in v0.8 Nodist employs lazy version pattern evaluation. This means that setting versions per env/locally/globally doesn't set an explicit version, if you didn't give one. Instead the node.exe shim chooses a suitable version *at runtime*. To update your node version (if your global version is set to `6`, e.g.), you now need to run `nodist + 6` (i.e. `nodist 6` doesn't do that for you anymore), which is probably how it should have worked all along.

### Commands
*All commands automatically install the latest matching version before setting the version pattern.*

```
> nodist
# Lists installed versions highlighting the active ones.
```

```
> nodist 4.x
# Sets the global node version.
```

```
> nodist local 4.x
# Sets the node version per directory (including all subdirectories).
```

```
> nodist env 4.x
# Sets the node version per terminal.
```

```
> nodist npm 3.x
# Globally activate npm 3

> nodist npm match
# Globally activates the npm version that corresponds to the active node version
# (the active node version may be the env, local or global version)
```

```
> nodist npm local 2.x
# Set the npm version for the current directory.
```

```
> nodist npm env 2.x
# Set the npm version for the current terminal environment.
```

```
call nodist env 4.x
# In a batch script use `call`.
```

```
> nodist dist
# Lists all available node versions.
```

```
> nodist r 4.x -- foo.js -s
# Runs a specific version without modifying any state.
```

```
> nodist + 4.x
# Just checks, if the version is installed and downloads it if not.

> nodist + all
# will install *everything*.
```

```
> nodist - 4.1.1
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
> set NODIST_NODE_MIRROR=https://mymirror.com/dist
# Set a mirror that has the same directory structure as https://nodejs.org/dist
# (you may also use `NODIST_IOJS_MIRROR` in the same fashion).
```

```
> set NODIST_X64=0
# (Set to `1` to enforce 64bit, `0` to enforce 32bit.)
```

## Details
Node executables are stored in `NODIST_PREFIX\v` and `NODIST_PREFIX\v-x64`.
The global `node.exe` is a shim and chooses the right node version to run based on the various version settings:
 * global -- `NODIST_PREFIX\.node-version` contains the global node version pattern
 * local -- `./.node-version` in the current working directory contains the local version pattern
 * env -- `NODIST_VERSION` containst the per-terminal version pattern

npm is always switched globally!

As the global node version will be subject to change, `nodist` comes with its own dedicated node binary.

## Got ideas?  Doesn't work for you? Want to give feedback?
[File an issue](https://github.com/marcelklehr/nodist/issues) and tell me what you'd change or add or what doesn't work for you. Every issue is welcome!

## Debugging
To see all debug messages, set the DEBUG env var before running nodist or node as follows:

```
> set DEBUG=nodist:*
```

## Testing

The default test suite can be ran using npm

```
$ npm test
```

Testing also accepts env variables for using a mirror to download from, as well as setting a proxy.

```
> set NODIST_NODE_MIRROR=http://nodejs.serverpals.com/dist
> vows --spec test\cli-test.js
```

## Building
Building nodist requires
 * [go](https://golang.org) for compiling the shim
 * [NSIS](http://nsis.sourceforge.net/Main_Page) v2 for compiling the installer
   * NSIS Plugin: [AccessControl](http://nsis.sourceforge.net/AccessControl_plug-in)
 * node.js for running the build script
 * and npm for installing nodist's dependencies
 * Finally you need to `go get github.com/marcelklehr/semver github.com/tj/go-debug`

If you have met all requirements, run the build command:

```
> npm run build
```
Afterwards you'll find the installer in `build/out/NodistSetup.exe` and fully prepared installation folder in `build/out/staging` (you could zip this, for example).
The chocolatey package will be in `build/out/package`, you can run `cpack` and `cpush --source https://chocolatey.org/` inside that directory (if you are a registered maintainer).

## Legal
Copyright (c) 2012-2016 by Marcel Klehr  
MIT License

## Changelog

v0.8.2
* Fix Git bash support and add support for Cygwin
* Fix `nodist dist` output being unsorted

v0.8.1
* Fix usage/help output: `stable` has been removed
* Fix installer: Use the correct path to npm when setting npm prefix

v0.8.0
* Add NPM version management (thanks to @nullivex)
* Treat io.js versions as node versions
* Allow setting ranges in global/local/env (don't resolve before setting versions)
* Drop support for setting node command line args
* Respect engines field declaration in package.json
* Fix local switching: Use the target script's dir as the base dir
* Allow setting env vars for mirror support
* Support bash
* Remove selfupdate command
* Fix help flag
* [installer] Fix: Set system not user PATH
* [installer] Fix: auto-detect x64 arch
* Improve build script
* Revive chocolatey package

v0.7.2
* correct version of NPM
* Fixed offline support (#104)

v0.7.1
 * Fix x64 support

v0.7.0 (thanks to @nullivex)
 * Add support for hashing downloading binaries and comparing to upstream
 * Code refactor to implement standards similar to npmjs style
 * Implement download progress bar
 * Add debugging output to aid in development and issue handling
 * Bump NPM version to 3.3.8
 * Improve testing and offer ability to see test output
 * Testing now accepts mirror env variables
 * Env variables can now be used to point nodist at a mirror
 * Only downloads binaries from HTTPS now as node is phasing out HTTP support

v0.6.1
 * Fix for node v4 dist directory structure (thanks to @jakub-g)

v0.6.0
 * Write out version spec that's being used, to make version errors more intuitive. (thanks to @blzaugg)
 * Fix replace for nodistPrefix and envVersion (thanks to @sdovenor)
 * Fix chocolatey package (thanks to @u9520107)
 * Add support for io.js

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
