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
cd
npm link
```

## Usage
```
  nodist             Displays all installed node versions
  nodist <VERSION>   Globally use the specified node version
  nodist latest      Globally use the latest available node version
  nodist --help      Display this help
```

## Details
`nodist` by default stores node executables in `<NPM_PREFIX>\node_modules\nodist\v\`, from where it can see what you have currently installed, and activate previously installed versions of node when `nodist <version>` is invoked again.

When a node is activated, nodist copies the version to `path\to\global-npm\node.exe`. This path may be altered using the *NODIST_PREFIX* env variable.

As the global node version will be subject to change, `nodist` comes with its own node version and command line files.

## Legal
Copyright (c) 2012 by Marcel Klehr  
MIT License