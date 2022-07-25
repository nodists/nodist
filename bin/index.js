#!/usr/bin/env node

const Http = require('https');
const Semver = require('semver');
const FileSystem = require('fs');
const Spawn = require('await-spawn');
const Inquirer = require('inquirer');
const Commander = require('commander');
const InquirerRelease = require('./inquirer.js');
const installation = 'C:\\Program Files (x86)\\Nodist\\'
const version = {
  default:{
    nodejs: '11.13.0',
    npm: '6.7.0'
  },
  get use(){
    return {
      nodejs:FileSystem.readFileSync(`${installation}.node-version-global`).toString().substr(1),
      npm:FileSystem.readFileSync(`${installation}.npm-version-global`).toString()
    }
  },
  get list(){
    return {
      nodejs:FileSystem.readdirSync (`${installation}\\v-x64`),
      npm:FileSystem.readdirSync (`${installation}\\npmv`)
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
  get spawn(){
    return {
      stdio: ['inherit', 'inherit', 'inherit'],
      shell: true
    }
  }
};

(async(
  List,
  Nodist,
  Wafflook
)=>{
  Wafflook.init();
  // インストール済
  Commander.command('list').alias('ls')
       .description('list all installed node versions')
            .action(async()=>{Wafflook.talk((await List.installed()))})
  // インストール未
  Commander.command('dist').alias('ds')
       .description('list all available node versions')
            .action(async()=>{Wafflook.talk((await List.available()))})
  // バージョン追加
  Commander.command('add')
       .description('download the selected version')
            .action(async()=>{Wafflook.talk((await List.published())).then(async(selected)=>{
                  await Nodist.add(selected.talk.version,selected.talk.npm)
                })
            })
  // バージョン削除
  Commander.command('del')
       .description('remove the selected version')
            .action(async()=>{Wafflook.talk((await List.published())).then(async(selected)=>{
                  await Nodist.del(selected.talk.version,selected.talk.npm)
                })
            })
  // バージョン確認
  Commander.command('chk')
       .description('check the using version')
            .action(async()=>{Wafflook.talk(
              [(await List.published(version.use.nodejs))])
            })
  // バージョン指定
  Commander.command('use')
       .description('use the version')
            .action(async()=>{Wafflook.talk((await List.installed())).then(async(selected)=>{
                  await Nodist.use(selected.talk.version,selected.talk.npm)
                })
            })
  // インストール
  Commander.command('install',{isDefault:true})
       .description('install the selected version')
            .action(async ()=>{
                Wafflook.talk((await List.published())).then(async (selected)=>{
                  if(selected.installed){
                    Nodist.use(selected.talk.version,selected.talk.npm)
                  }else{
                    // インストール前に戻す
                    await Nodist.use(version.default.nodejs,version.default.npm)
                    // ダウンロード並びに展開する
                    await Nodist.add(selected.talk.version,selected.talk.npm)
                    // 足りないパッケージをインストール（node_mdoules）
                    await Nodist.fil(selected.talk.npm)
                    // 足りないパッケージをインストール後にグローバルに設定する
                    await Nodist.use(selected.talk.version,selected.talk.npm)
                  }
                })
            })
  // アンインストール
  Commander.command('uninstall')
       .description('uninstall the selected version')
            .action(async ()=>{
                Wafflook.talk((await List.installed())).then(async (selected)=>{
                  if (selected.talk.version == version.default.nodejs || selected.talk.npm == version.default.npm) {
                    console.log('this version is do not uninstall because default use')
                  }
                  if (selected.talk.version == version.use.nodejs || selected.talk.npm == version.use.npm) {
                    console.log('this version is currently in use')
                  }
                  await Nodist.del(selected.talk.version,selected.talk.npm)
                })
            })
  // コマンドの実行
  Commander.command('raw')
          .argument('<string>')
            .action((aruguments)=>{
               Nodist.exe(aruguments)
            })
  Commander.parse(
    process.argv
  )
})({
  available:async function(){
    return (await this.published()).filter(release=>release.installed == false)
  },
  installed:async function(){
    return (await this.published()).filter(release=>release.installed)
  },
  published:async function(nodejs){
    const release = (version.json).map(info=>({...info,version:Semver.clean(info.version)})),
        installed = version.list.nodejs.reduce((all,version)=>({...all,[version]:true}),{})
          release.forEach((info)=>{
            info.installed = info.version in installed ? true : false
          })
       if(nodejs){
         return release.reduce((all,info)=>({...all,[info.version]:info}),{})[nodejs]
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
    return Spawn(`cd "${version.folder.npm}\\${npm}" && npm install "${version.folder.npm}\\${npm}"`, option.spawn)
  },
  use:function(node,npm) {
    return Spawn(`nodist global "${node}" && nodist npm global "${npm}"`, option.spawn)
  },
  del:function(node,npm){
    return Spawn(`nodist remove "${node}" && nodist npm remove "${npm}"`, option.spawn)
  },
  add:function(node,npm){
    return Spawn(`nodist add "${node}" && nodist npm add "${npm}"`, option.spawn)
  },
  exe:function(arg){
    return Spawn(`nodist ${arg}`, option.spawn)
  },
},{
  init:function(){
    Commander.name('nodistx')
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
}).catch(
  console.error
)
