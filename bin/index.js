#!/usr/bin/env node

const Fs = require('fs');
const Path = require('path');
const Http = require('http');
const Semver = require('semver');
const Inquirer = require('inquirer');
const Commander = require('commander');
const AwaitSpawn = require('await-spawn');
const Package = require('../package.json');
const InquirerRelease = require('./inquirer.js');
const installation = 'C:\\Program Files (x86)\\Nodist'

function CreateSymlinks (folder, list = []){
  
  function link(from,to,type){
    Fs.unlinkSync(from);
    Fs.symlinkSync(to, from, type)
  }

  Fs.readdirSync(folder).forEach((name)=>{
    var path = Path.join(folder,name),
        stat = Fs.lstatSync(path)
    if (stat.isSymbolicLink(path)) {
        link(path,Fs.readlinkSync(path),stat.isFile() ? 'file' : 'dir')
        list.push(path);
    } else if (stat.isDirectory()) {
      CreateSymlinks(path, list);
    } 
  })
  return list;
}

const util = {
  runas:()=>{
    return new Promise((resolve,reject)=>{
      var cmd = 'net session'
      require('child_process').exec(cmd, (err, stdout, stderr) => {
        if(err){
          AwaitSpawn(`PowerShell Start-Process nodistx.cmd -ArgumentList ${process.argv.slice(2).join(',')} -Verb RunAs`,option.AwaitSpawn)
        }else{
          resolve()
        }
      })
    })
  },
  isAdmin:()=>{
    return new Promise((resolve,reject)=>{
      var cmd = 'net session'
      require('child_process').exec(cmd, (err, stdout, stderr) => {
        if(err == null){
          resolve()
        }else{
          reject()
        }
      })
    })
  }
}

const version = {
  default:{
    nodejs: '6.2.0',
    npm: '3.8.6'
  },
  get use(){
    return {
      nodejs:Semver.clean(Fs.readFileSync(`${installation}\\.node-version-global`).toString()),
      npm:Fs.readFileSync(`${installation}\\.npm-version-global`).toString()
    }
  },
  get list(){
    return {
      nodejs:Fs.readdirSync (`${installation}\\v-x64`),
      npm:Fs.readdirSync (`${installation}\\npmv`)
    }
  },
  get json(){
    return require(`${installation}\\versions.json`)
  },
  get folder(){
    return {
      nodejs:`${installation}\\v-x64`,
      npm:`${installation}\\npmv`
    }
  }
};
const option = {
  get AwaitSpawn(){
    return {
      stdio: ['inherit', 'inherit', 'inherit'],
      shell: true
    }
  }
};

((
  List,
  Nodist,
  Wafflook
)=>{

  Wafflook.init();

  // 一覧
  Commander.command('ls').alias('list')
       .description('Get a list of installed nodejs version')
            .action(none=>Wafflook.prompt(List.installed()))
  Commander.command('ds').alias('dist')
       .description('Get a list of all available nodejs versions')
            .action(none=>Wafflook.prompt(List.available()))
  Commander.command('rs').alias('rist')
       .description('Get a list of https://nodejs.org/dist/index.json')
            .action(none=>Wafflook.prompt(List.nodejsorg()))
  // 確認
  Commander.command('by')
       .description('Check a nodejs of currently version using by nodist')
            .action(none=>Wafflook.prompt([List.nodejsorg(version.use.nodejs)]))
  // 操作
  Commander.command('+').alias('add')
       .description('Install a nodejs of specific version')
            .action(none=>Wafflook.prompt(List.available()).then(specific=>Nodist.add(specific.talk.version,specific.talk.npm)))
  Commander.command('-').alias('remove')
       .description('Uninstall a nodejs of specific version')
            .action(none=>Wafflook.prompt(List.installed()).then(specific=>Nodist.del(specific.prompt.version,specific.prompt.npm)))
  Commander.command('!').alias('use')
       .description('Use a nodejs of specific version after automatically install')
       .addArgument(new Commander.Argument('[from]', 'from the ls|ds|rs versions').choices(['ls', 'ds', 'rs']))
            .action(from=>Wafflook.prompt({ls:List.installed,ds:List.available,rs:List.nodejsorg}[from || 'ds'].call(List)).then(specific=>{
                Nodist.use(specific.talk.version,specific.talk.npm).then(none=>{
                  if(specific.talk.installed == false){
                    CreateSymlinks(version.folder.npm + `\\${specific.talk.npm}\\node_modules`)
                  }
                })
              })
            )

    var cmd
    if(/use|add/.test((cmd = Commander._findCommand(process.argv[2] || '')) && cmd.alias())){
        util.isAdmin().then(none=>{
          Commander.parse(process.argv)
        }).catch(none=>AwaitSpawn(`PowerShell Start-Process nodistx.cmd -ArgumentList ${process.argv.slice(2).join(',')} -Verb RunAs`,option.AwaitSpawn))
    }else{
      Commander.parse(process.argv)
    }

})({
  available:function(){
    return (this.nodejsorg()).filter(list=>list.installed == false)
  },
  installed:function(){
    return (this.nodejsorg()).filter(list=>list.installed)
  },
  nodejsorg:function(nodejs){
    const support = (version.json).map(info=>(Object.assign({},info,{version:Semver.clean(info.version)}))).filter(package=>Semver.gte(package.version,version.default.nodejs)),
        installed = version.list.nodejs.reduce((all,version)=>(Object.assign(all,{[version]:true})),{})
          support.forEach((info)=>{
            info.installed = info.version in installed ? true : false
          })
       if(nodejs){
         return support.reduce((all,info)=>(Object.assign({},all,{[info.version]:info})),{})[nodejs]
       }else{
         return support.sort((a, b) => {
           if (Semver.gt(a.version, b.version)) return -1
           if (Semver.lt(a.version, b.version)) return +1
           return 0
         })
       }
  }
},{
  use:function(node,npm) {
    return AwaitSpawn(`nodist global "${node}" && nodist npm global "${npm}"`, option.AwaitSpawn)
  },
  del:function(node,npm){
    return AwaitSpawn(`nodist remove "${node}" && nodist npm remove "${npm}"`, option.AwaitSpawn)
  },
  add:function(node,npm){
    return AwaitSpawn(`nodist add "${node}" && nodist npm add "${npm}"`, option.AwaitSpawn)
  }
},{
  init:function(){
             Commander.name(Package.name)
                   .version(Package.version)
               .description(Package.description)
    Inquirer.registerPrompt('release', InquirerRelease)
  },
  prompt:function(list){
    return Inquirer.prompt([
      {
        name: 'talk',
        type: 'release',
        rows: list
      }
    ])
  }
},{
  // ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⠀⠈⢛⡿⠀⠀⠀⠀⠀
  // ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢨⣿⠃⠠⢿⣥⠀⢩⡿⠀⠀
  // ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠁⠀⠀⠀⠀⠙⠛⠀⠀
  // ⠀⣠⡾⠃⠀⣀⣀⣀⠀⣀⠀⢀⠀⢀⠀⣠⣤⡄⠀⢷⡄⠀⠀
  // ⣰⠟⠀⠀⠀⠉⠉⠉⠐⣧⣴⠿⣤⡼⠀⠀⠀⠀⠀⠀⢻⣆⠀
  // ⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ ⠀⣿
  // ⣷⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ ⠀⣿⠃
  // ⢹⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡟⠀
  // ⠀⠙⢷⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⡶⠋⠀⠀
  // ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠀⠀⠀
})