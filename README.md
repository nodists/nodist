# nodist
A Node version manager for the windows folks out there. Inspired by [n](https://github.com/visionmedia/n).

## Install
You no longer need to install node beforehand. Just grab the [zip](https://github.com/marcelklehr/nodist/zipball/master), unpack it, and add `path\to\nodist\bin` to your path ([how?](http://www.computerhope.com/issues/ch000549.htm)).
That's all!

## Usage
The `v` in front of a version number is optional.

All commands implicitly install the specified version before using it, if it isn't already installed.

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

### Remove a version
If you want to remove a version for some reason, use this:
```
nodist - 0.5.10
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

### Run a specific version
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
    
    nodist use <version>            Use <version> in the current environment only
                                    (usually the current terminal window).

    nodist run <version> -- <file>  Run <file> with the specified node version
    nodist r <version> -- <file>    (downloads the executable, if necessary).

    nodist bin <version>            Get the path to the specified node executable
                                    (downloads the executable, if necessary).
    
    nodist path <version>           Get the path to the specified node version directory
                                    (downloads the executable, if necessary).

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


## Got ideas?  Doesn't work for you? Want to give feedback?
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