#!/usr/bin/env node

const Http = require('https')
const Semver = require('semver')
const Inquirer = require('inquirer')
const InquirerVersion = require('./inquirer-version-prompt')

const { exec } = require('child_process')

function loadJSON (url) {
  return new Promise((resolve, reject) => {
    Http.get(url, (response) => {
      let data = ''
      response.on('data', (chunk) => {
        data += chunk
      })
      response.on('end', () => {
        resolve(JSON.parse(data))
      })
    }).on('error', (error) => {
      reject(error)
    })
  })
}

loadJSON('https://nodejs.org/download/release/index.json').then((versions)=>{

  Inquirer.registerPrompt('version', InquirerVersion)
  Inquirer.prompt([
    {
      name: 'nodejs',
      type: 'version',
      message: 'full list of releases',
      rows:versions.sort((a, b) => {
        if (Semver.gt(a.version, b.version)) return -1
        if (Semver.lt(a.version, b.version)) return +1
        return 0
      })
    }
  ]).then(row => {
    
    require('child_process').exec(
      `start "" "${__dirname}\\install.bat" ${Semver.clean(row.nodejs.version)} ${row.nodejs.npm}`,
    ).stdout.pipe(process.stdout)
  }).catch(err => {
    console.error(err.stack)
  })
})