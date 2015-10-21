# Building Nodist

Moving forward as of 0.7.0 Nodist no longer installs like it had previously.

Now an installer is generated from the build process. This document is going
to overview the build process in the hope that it can then be scripted.

## Preparation

Before a build can be made the following software is needed.

* Working Node at least 0.10.40
* Working NPM at least 2.x
* Install the NSIS Package
  * Download here: http://nsis.sourceforge.net/Download
  * I am using 3.0b2
  * Install with the wizard
* Install the NSIS Plugin AccessControl
  * Download here: http://nsis.sourceforge.net/AccessControl_plug-in
  * Extract ZIP File
  * Copy `Plugin\AccessControl.dll` to `C:\Program Files x86\NSIS\Plugins\x86-ansi`
  * Copy `Unicode\Plugin\AccessControl.dll` to `C:\Program Files x86\NSIS\Plugins\x86-unicode`

## Build Process


First run the build script to prepare the installer for compilation.

```
$ cd <NODIST_DEV_FOLDER>
$ node build\build.js
``

Next compile the installer by opening NSIS and selecting the "Compile Scripts"
option. Point the compiler to `<NODIST_DEV_FOLDER>\build\Nodist.nsi` this will
start the compile process.

Provided the process is successful the installer will be at
`<NODIST_DEV_FOLDER>\build\NodistSetup.exe`

Next, move the `NodistSetup.exe` to the final production name of
`NodistSetup-v<VERSION>.exe` for example `NodistSetup-v0.7.0.exe`

## Publishing

Now to publish the new builds simply cut a release tag based on the code
just used for the build here: https://github.com/marcelklehr/nodist/releases

Attach the binary to the release.
