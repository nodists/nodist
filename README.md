# nodist
A Node version manager for the windows folks out there. Inspired by [n](https://github.com/visionmedia/n).

## Install
Install node and npm at once, using the [msi installer](http://nodejs.org/#download).

Install nodist globally. That's all!
```sh
npm install -g nodist
```

## Usage
The `v` in front of a version number is optional.

### Install a version
Checks, if the version is installed and downloads it if not.
```
nodist + v0.8.1
```

This installs the latest available version:
```
nodist + latest
```

And this installs the latest available stable version:
```
nodist + stable
```

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
All subsequent calls of `node` will use this version.
```
nodist 0.8.1
```

You can also use `latest` and `stable` here. This will implicitly install the latest version, before activating it.
```
nodist latest
```

### Removing a version
If you want to remove a version for some reason, use this:
```
nodist - 0.5.10
```

### Running a specific version
Use this to run a specific node version, regardless of the globally activated one.
Everything after `--` will be passed to node.
```
nodist r v0.8.1 -- foo.js -s
```

### Install everything
If you want to install all available versions at once, use this.
But be warned, as this may take a while.
```
nodist + all
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

    nodist <version>                Use the specified node version globally
                                    (downloads the executable, if necessary).

    nodist add <version>            Download the specified node version.
    nodist + <version>

    nodist rm <version>             Uninstall the specified node version.
    nodist - <version>

    nodist run <version> -- <file>  Run <file> with the specified node version
    nodist r <version> -- <file>    (downloads the executable, if necessary).

    nodist bin <version>            Get the path to the specified node version
                                    (downloads the executable, if necessary).

    nodist --help                   Display this help

    nodist -v                       Display nodist version
```


## Got ideas?  Doesn't work for you? Wnat to give feedback?
[File an issue](https://github.com/marcelklehr/nodist/issues) and tell me what you'd change or add or what doesn't work for you. Every issue is welcome!

## Details
`nodist` stores your node executables in `<global_npm>\.nodist\v\`, so it can see what's installed and activate previously installed versions.  
When a version is activated, `nodist` copies it to `<global_npm>\node.exe`. You can alter the path where `nodist` operates, using the **NODIST_PREFIX** env variable.

As the global node version will be subject to change, `nodist` comes with its own node version and command line files.

## What's with the name?
The name nodist was chosen to emphasise the puristic approach of implementing a node version manager and is not to be confused with the term 'nudist'. It was never my intention to make a connection between these two subjects by giving this program a similar name. What did you think?!

## Legal
Copyright (c) 2012 by Marcel Klehr  
MIT License