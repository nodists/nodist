# nodist
A Node version manager for the windows folks out there.

## Install
Install node and npm using the [msi installer](http://nodejs.org/#download).

Install nodist globally.
```sh
npm install -g nodist
```

### Install from source.
```
git clone git://github.com/marcelklehr/nodist.git
cd nodist
npm link
```

## Usage
```
Usage:
    nodist              List all installed node versions.
    nodist <version>    Use the specified node version globally (downloads the executable, if necessary).
    nodist rm <version> Uninstall the specified node version.
    nodist - <version>
    nodist -v           Display nodist version
    nodist --help       Display this help

Examples:

    nodist 0.8.1        Use node v0.8.1 globally
    nodist v0.5.10      Use node v0.5.10 globally
    nodist rm 0.5.10    Uninsall node v0.5.10
```

## Details
`nodist` by default stores node executables in `<NPM_PREFIX>\node_modules\nodist\v\`, from where it can see what you have currently installed, and activate previously installed versions of node when `nodist <version>` is invoked again.

When a node is activated, nodist copies the version to `path\to\global-npm\node.exe`. This path may be altered using the **NODIST_PREFIX** env variable.

As the global node version will be subject to change, `nodist` comes with its own node version and command line files.

## What's with the name?
The name nodist was chosen to emphasise the puristic approach of implementing a node version manager and is not to be confused with the term 'nudist'. It was never my intention to make a connection between these two subjects by giving this program a similar name. How, dare you!?

## Legal
Copyright (c) 2012 by Marcel Klehr  
MIT License