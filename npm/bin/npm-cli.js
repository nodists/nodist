/*
This is a shim for the npm binary shim of Nodist.
It exists, so that WebStorm is happy.
See https://github.com/marcelklehr/nodist/issues/158
Instructions:
  1. Create the following directory: `Nodist\bin\bin`
  2. Place this file in the new directory
*/
var child_process = require('child_process')

child_process.spawn(process.env['NODIST_PREFIX']+'/bin/npm.exe', process.argv.slice(2), {stdio: 'inherit'})
.on('error', function(er) {
  console.log('Sorry. There was a problem with nodist.')
  throw er
})
.on('exit', function(code) {
  if (code) {
    process.exit(code)
  }
})
