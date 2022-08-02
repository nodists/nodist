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
const installation = 'C:\\Program Files (x86)\\Nodist\\'

function GetSymlinks (folder, list = []){
  
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
        GetSymlinks(path, list);
    } 
  })
  return list;
}

const util = {
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
      nodejs:Fs.readFileSync(`${installation}.node-version-global`).toString().substr(1),
      npm:Fs.readFileSync(`${installation}.npm-version-global`).toString()
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
  // リセット
  Commander.command('reset')
       .description('list all available versions')
            .action(()=>{Nodist.use(version.default.nodejs,version.default.npm)})
  // インストール未
  Commander.command('dist').alias('ds')
       .description('list all available versions')
            .action(()=>{Wafflook.talk((List.available()))})
  // インストール済
  Commander.command('list').alias('ls')
       .description('list all installed versions')
            .action(()=>{Wafflook.talk((List.installed()))})
  // バージョン追加
  Commander.command('add').alias('+')
       .description('donwload a specific version')
            .action(()=>{Wafflook.talk((List.published())).then((selected)=>{
                  Nodist.add(selected.talk.version,selected.talk.npm)
                })
            })
  // バージョン削除
  Commander.command('remmove').alias('-')
       .description('remove a specific version')
            .action(()=>{Wafflook.talk((List.published())).then((selected)=>{
                  Nodist.del(selected.talk.version,selected.talk.npm)
                })
            })
  // バージョン指定
  Commander.command('use').alias('*')
       .description('use the specified version')
            .action(()=>{Wafflook.talk((List.installed())).then((selected)=>{
                  Nodist.use(selected.talk.version,selected.talk.npm)
                })
            })
  // バージョン確認
  Commander.command('check').alias('c')
       .description('check the version currently using')
            .action(()=>{Wafflook.talk(
              [(List.published(version.use.nodejs))])
            })


            

  // インストール
  Commander.command('install',{isDefault:true}).alias('i')
       .description('install specified version becomes the default use')
            .action(()=>{
              util.isAdmin().then(()=>{
              Wafflook.talk((List.published())).then((selected)=>{
                  if(selected.installed){
                    Nodist.use(selected.talk.version,selected.talk.npm)
                  }else{
                    if(Semver.lt(selected.talk.npm,version.default.npm)){
                      console.log('oops...nodistx supports node 6.0.0 and above')
                      console.log('if you want to install less than node 6.0.0, please use nodist')
                    }else{
                      console.dir(selected)
                        // 足りないパッケージをインストール後にグローバルに設定する
                        Nodist.use(selected.talk.version,selected.talk.npm).then(()=>{
                          // ワークスペースにリンクされたシンボリックファイルを修復する
                          GetSymlinks(version.folder.npm + `\\${selected.talk.npm}\\node_modules`)
                        })
                    }
                  }
                })
              }).catch(()=>{
                AwaitSpawn(`PowerShell Start-Process nodistx.cmd -Verb RunAs`,option.AwaitSpawn)
              })


            })


  // アンインストール
  Commander.command('uninstall')
       .description('uninstall selected version')
            .action(()=>{
              Wafflook.talk((List.installed())).then((selected)=>{
                if (selected.talk.version == version.default.nodejs || selected.talk.npm == version.default.npm) {
                  console.log('this version is do not uninstall because nodistx use')
                }
                if (selected.talk.version == version.use.nodejs || selected.talk.npm == version.use.npm) {
                  console.log('this version is currently in use')
                }
                Nodist.del(selected.talk.version,selected.talk.npm)
              })
           })
  // コマンドの実行
  Commander.command('raw').alias('r')
          .argument('<string>')
       .description('Run <string> on nodist')
            .action((aruguments)=>{
               Nodist.exe(aruguments)
            })

  Commander.parse(
    process.argv
  )

})({
  available:function(){
    return (this.published()).filter(release=>release.installed == false)
  },
  installed:function(){
    return (this.published()).filter(release=>release.installed)
  },
  published: function(nodejs){
    const release = (version.json).map(info=>(Object.assign({},info,{version:Semver.clean(info.version)}))),
        installed = version.list.nodejs.reduce((all,version)=>(Object.assign(all,{[version]:true})),{})
          release.forEach((info)=>{
            info.installed = info.version in installed ? true : false
          })
       if(nodejs){
         return release.reduce((all,info)=>(Object.assign({},all,{[info.version]:info})),{})[nodejs]
       }else{
         return release.sort((a, b) => {
           if (Semver.gt(a.version, b.version)) return -1
           if (Semver.lt(a.version, b.version)) return +1
           return 0
         })
       }
  }
},{
  fil:function(npm){
    return AwaitSpawn(`cd "${version.folder.npm}\\${npm}" && npm install "${version.folder.npm}\\${npm}"`, option.AwaitSpawn)
  },
  use:function(node,npm) {
    return AwaitSpawn(`nodist global "${node}" && nodist npm global "${npm}"`, option.AwaitSpawn)
  },
  del:function(node,npm){
    return AwaitSpawn(`nodist remove "${node}" && nodist npm remove "${npm}"`, option.AwaitSpawn)
  },
  add:function(node,npm){
    return AwaitSpawn(`nodist add "${node}" && nodist npm add "${npm}"`, option.AwaitSpawn)
  },
  exe:function(arg){
    return AwaitSpawn(`nodist ${arg}`, option.AwaitSpawn)
  },
},{
  init:function(){
             Commander.name(Package.name)
                   .version(Package.version)
               .description(Package.description)
    Inquirer.registerPrompt('release', InquirerRelease)
  },
  talk:function(list){
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