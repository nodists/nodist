# nodist
A Node version manager for the windows folks out there. Inspired by [n](https://github.com/visionmedia/n).

## Install
Install node and npm at once, using the [msi installer](http://nodejs.org/#download).

Install nodist globally. That's all!
```sh
npm install -g nodist
```

## Usage
Output of `nodist --help`:
```
A node version manager for windows
Usage:

    nodist                         List all installed node versions.
    nodist list
    nodist ls

    nodist dist                    List all available node versions.
    nodist ds

    nodist <version>               Use the specified node version globally (downloads the executable, if necessary).

    nodist add <version>           Download the specified node version.
    nodist + <version>

    nodist rm <version>            Uninstall the specified node version.
    nodist - <version>

    nodist run <version> -- <file> Run <file> with the specified node version (downloads the executable, if necessary).
    nodist r <version> -- <file>

    nodist bin <version>           Get the path to the specified node version (downloads the executable, if necessary).

    nodist --help                  Display this help

    nodist -v                      Display nodist version

Examples:

    nodist 0.8.1                   Use node v0.8.1 globally
    nodist v0.5.10                 Use node v0.5.10 globally
    nodist r v0.8.1 -- foo.js -s   Run `foo.js -s` with node v0.8.1, regardless of the global version
    nodist - 0.5.10                Uninstall node v0.5.10
    nodist latest                  Use the latest available node version globally (downloads the executable).
    nodist + all                   Installs *all* available node versions. // Get yourself a cuppa in the meantime...
```

## Details
`nodist` stores your node executables in `<global_npm>\.nodist\v\`, from there it can see what's installed and activate previously installed versions when `nodist <version>` is invoked again.  
When a version is activated, `nodist` copies it to `<global_npm>\node.exe`. This path may be altered using the **NODIST_PREFIX** env variable.

As the global node version will be subject to change, `nodist` comes with its own node version and command line files.

## Got ideas?  Doesn't work for you?
[File an issue](https://github.com/marcelklehr/nodist/issues) and tell me what you'd change or add or what doesn't work for you. Every issue is welcome!

## What's with the name?
The name nodist was chosen to emphasise the puristic approach of implementing a node version manager and is not to be confused with the term 'nudist'. It was never my intention to make a connection between these two subjects by giving this program a similar name. What did you think?!

## Legal
Copyright (c) 2012 by Marcel Klehr  
MIT License