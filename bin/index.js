#!/usr/bin/env node

const Fs = require('fs');
const Path = require('path');

const _ = require('lodash');
const SemVer = require('semver');
const Inquirer = require('inquirer');
const Commander = require('commander');
const AwaitSpawn = require('await-Spawn');
const InquirerRelease = require('./inquirer.js');

const Util = require('./nodist/util.js');
const Package = require('../package.json');

((
  List,
  Nodist,
  Wafflook
)=>{

  Wafflook.init()

 /*
  * 基本
  *   nodist dist
  *   https://iojs.org/dist/index.json
  *   https://nodejs.org/dist/index.json
  *   C:\Program Files (x86)\Nodist\versions.json
  *   [
  *     {
  *       "version":"v18.5.0",
  *       "date":"2022-07-06",
  *       "files":[
  *         "aix-ppc64",
  *         "headers",
  *         "linux-arm64",
  *         "linux-armv7l",
  *         "linux-ppc64le",
  *         "linux-s390x",
  *         "linux-x64",
  *         "osx-arm64-tar",
  *         "osx-x64-pkg",
  *         "osx-x64-tar",
  *         "src",
  *         "win-x64-7z",
  *         "win-x64-exe",
  *         "win-x64-msi",
  *         "win-x64-zip",
  *         "win-x86-7z",
  *         "win-x86-exe",
  *         "win-x86-msi",
  *         "win-x86-zip"
  *       ],
  *       "npm":"8.12.1",
  *       "v8":"10.2.154.4",
  *       "uv":"1.43.0",
  *       "zlib":"1.2.11",
  *       "openssl":"3.0.5+quic",
  *       "modules":"108",
  *       "lts":false,
  *       "security":true
  *     }
  *   ]
  */
  Commander.command('list',{isDefault:true}).alias('ls')
       .description('Get a list of installed nodejs version')
            .action(none=>Wafflook.table(List.installed()))
  Commander.command('dist').alias('ds')
       .description('Get a list of all available nodejs versions')
            .action(none=>Wafflook.table(List.available()))
  Commander.command('rist').alias('rs')
       .description('Get a list of https://nodejs.org/dist/index.json')
            .action(none=>Wafflook.table(List.nodejsorg()))
 /*
  * 関係
  *   ┌────┐   ┌───┐
  *   │NODE├───│NPM| ＮＰＭは複数のＮＯＤＥに依存します
  *   └────┘1 n└───┘ 
  * 
  *     8.12.1/npm
  *      ├─v18.4.0
  *      └─v18.5.0
  * 操作
  *   ┌────┐ 
  *   │RIST│ all list
  *   └─┬──┘
  *     ├────────────────────┐
  *   ┌─┴──┐               ┌─┴──┐
  *   │DIST│ not installed │LIST│ installed list
  *   └──┬─┘               └──┬─┘
  *      │       ┌───┐        │ ┌──────┐
  *      └───────│ADD|        └─│REMOVE| 現在使用中のバージョンは非表示です
  *              └───┘          └──────┘
  * 
  */
  Commander.command('add').alias('+')
       .description('Install a nodejs of specific version')
            .action(none=>{
              Wafflook.table(List.available()).then(specific=>{
                Nodist.add(specific.talk.version,specific.talk.npm).then(none=>{
                  Nodist.lnk(specific.talk.npm)
                })
              })
            })
  Commander.command('remove').alias('-')
       .description('Uninstall a nodejs of specific version')
            .action(none=>{
              var list = List.installed()
              // 使用中のバージョンは隠す消されたら困る
              _.remove(list,{version:Util.use.nodejs})
              Wafflook.table(list).then(specific=>{
                // ＮＯＤＥ１個に依存するだけならそのまま削除
                if(Util.can.remove.npm(specific.talk.npm).one){
                  Nodist.del(specific.talk.version,specific.talk.npm)
                }else{
                  // ＮＯＤＥ複数に依存してたらＮＯＤＥだけ消すか確認
                  Wafflook.confirm('npm is used by other installed nodejs, do you want to remove nodejs only?').then(yes=>{
                    Nodist.del(specific.talk.version,yes ? undefined : specific.talk.npm)
                  })
                }
              })
            })
  /*
   * 使用
   *   ┌──────────────┐
   *   │LIST/DIST/RIST│
   *   └──────┬───────┘
   *          │       ┌────────────────┐
   *          └───────│ENV/LOCAL/GLOBAL│ 1>2>3>4の順で選択されます
   *                  └────────────────┘
   * 　　               1.環境変数（ENV）
   *                       PROCESS.ENVからNODIST_(NODE and NPM)_VERSION
   * 　　               2.作業フォルダ（LOCAL）
   *                       フォルダ内または親フォルダから.(node and npm)-version
   *                    3.PACKAGE.ENGINES
   *                       フォルダ内のpackage.jsonから{engines:{node:'', npm:'' }}
   *                    4.NODISTの設定ファイル（GLOBAL）
   * 　                    C:\Program Files (x86)\Nodist\.(node and npm)-version-global
   */
   Commander.command('env')
        .description('Use a nodejs of specific version for the current console only (process.env)')
        .addArgument(new Commander.Argument('[from]', 'from the ls|ds|rs versions').choices(['ls', 'ds', 'rs']))
             .action(from=>{
               Wafflook.table({ls:List.installed,ds:List.available,rs:List.nodejsorg}[from || 'rs'].call(List)).then(specific=>{
                 Nodist.env(specific.talk.version,specific.talk.npm).then(none=>{
                   if(specific.installed == false){
                     Nodist.lnk(specific.talk.npm)
                   }
                 })
               })
             })
   Commander.command('local')
        .description('Use a nodejs of specific version for the current working working only (.(node or npm)version)')
        .addArgument(new Commander.Argument('[from]', 'from the ls|ds|rs versions').choices(['ls', 'ds', 'rs']))
             .action(from=>{
               Wafflook.table({ls:List.installed,ds:List.available,rs:List.nodejsorg}[from || 'rs'].call(List)).then(specific=>{
                 Nodist.local(specific.talk.version,specific.talk.npm).then(none=>{
                   if(specific.installed == false){
                     Nodist.lnk(specific.talk.npm)
                   }
                 })
               })
             })
   Commander.command('global').alias('use')
        .description('Use a nodejs of specific version for the global (C:\Program Files (x86)\Nodist\.(node or npm)-version-global)')
        .addArgument(new Commander.Argument('[from]', 'from the ls|ds|rs versions').choices(['ls', 'ds', 'rs']))
             .action(from=>{
               Wafflook.table({ls:List.installed,ds:List.available,rs:List.nodejsorg}[from || 'rs'].call(List)).then(specific=>{
                 Nodist.global(specific.talk.version,specific.talk.npm).then(none=>{
                   if(specific.installed == false){
                     Nodist.lnk(specific.talk.npm)
                   }
                 })
               })
             })
 /*
  * 確認
  *   バージョンは1>2>3>4で選択されます
  */
  Commander.command('version')
       .description('Check a current nodejs version')
            .action(none=>{
              Nodist.ver().then((version)=>{
                Wafflook.table([
                  List.nodejsorg(SemVer.clean(version.toString()))
                ])
              })
            })
 /*
  * 実行
  */
  Commander.command('run').alias('r')
       .description('Run <args> with a version matching the provided requirement')
            .action(none=>{
              Nodist.run(process.argv.slice(3))
            })
  /*
   * 権限
   *   ＮＰＭは圧縮ファイル内にシンボリックリンクを含みます
   *   https://codeload.github.com/npm/cli/tar.gz/v8.13.2（例）
   *   ファイルの種類は.symlinkで0byte解凍ソフトを変えても同じ（7Zip）
   *   シンボリックファイルを展開する処理のあるコマンドは全てRUNASします
   *
   *     抽出リンク
   *       dir /AL /S
   *     シンボリックファイル
   *       node_modules
   *         │  libnpmaccess
   *         │  libnpmdiff
   *         │  libnpmexec
   *         │  libnpmfund
   *         │  libnpmhook
   *         │  libnpmorg
   *         │  libnpmpack
   *         │  libnpmpublish
   *         │  libnpmsearch
   *         │  libnpmteam
   *         │  libnpmversion
   *　       │
   *         └─@npmcli
   *             arborist
   */
   Wafflook.runas(['add','env','local','global']).then((must)=>{
     if(must){
       Commander.parse(process.argv)
     }
   })
})({
  /**
   * 未インストールのバージョンの一覧を取得
   * @returns Array<Object>
   */
  available:function(){
    return (this.nodejsorg()).filter(list=>list.installed == false)
  },
  /**
   * インストール済のバージョンの一覧を取得
   * @returns Array<Object>
   */
  installed:function(){
    return (this.nodejsorg()).filter(list=>list.installed)
  },
  /**
   * 全てのリリースのバージョンの一覧を取得
   * @param {String} nodejs 特定のバージョンのみ抽出
   * @returns Array<Object>
   */
  nodejsorg:function(nodejs){
    var list = Util.nodejsorg.json
     if(nodejs){
       return list.reduce((all,info)=>(Object.assign({},all,{[info.version]:info})),{})[nodejs]
     }else{
       return list
     }
    }
},{
  add:function(node,npm){
    return AwaitSpawn([
      `nodist add ${node}`,
      `nodist npm add ${npm}`
    ].join(' && '),[],{
      shell: true,
      stdio: ['inherit', 'inherit', 'inherit']
    })
  },
  del:function(node,npm){
    return AwaitSpawn([
      node && `nodist remove ${node}`,
      npm && `nodist npm remove ${npm}`
    ].filter(Boolean).join(' && '),[],{
      shell: true,
      stdio: ['inherit', 'inherit', 'inherit']
    })
  },
  env:function(node,npm) {
    return AwaitSpawn([
      `nodist env ${node}`,
      `nodist npm env ${npm}`
    ].join(' && '),[],{
      shell: true,
      stdio: ['inherit', 'inherit', 'inherit']
    })
  },
  local:function(node,npm) {
    return AwaitSpawn([
      `nodist local ${node}`,
      `nodist npm local ${npm}`
    ].join(' && '),[],{
      shell: true,
      stdio: ['inherit', 'inherit', 'inherit']
    })
  },
  global:function(node,npm) {
    return AwaitSpawn([
      `nodist global ${node}`,
      `nodist npm ${npm}`
    ].join(' && '),[],{
      shell: true,
      stdio: ['inherit', 'inherit', 'inherit']
    })
  },
  ver:function() {
    return AwaitSpawn('node -v',[],{
      shell: true,
      stdio: ['inherit', 'pipe', 'inherit']
    })
  },
  run:function(){
    return AwaitSpawn(`nodist run`,arguments,{
      shell: true,
      stdio: ['inherit', 'inherit', 'inherit']
    })
  },
  /**
   * シンボリックリンクの張替
   * @param {String} version 張り替えたいＮＰＭのバージョン
   */
  lnk(version){

    (symbolic=>{
      var files = symbolic(Util.installed.npm[version].node_modules),
         linked = files.length > 0
         if (linked){
           console.log('\ncreated symbolic links')
           console.dir(files)
         }
    })(
      recursive = (folder, list = []) => {
  
        function link(from,to,type){
          Fs.unlinkSync(from);
          Fs.symlinkSync(to, from, type)
        }
      
        Fs.readdirSync(folder).forEach((name)=>{
          var path = Path.join(folder,name),
              stat = Fs.lstatSync(path)
          if (stat.isSymbolicLink(path)) {
              link(path,Fs.readlinkSync(path),stat.isFile() ? 'file' : 'dir')
              list.push(path)
          } else if (stat.isDirectory()) {
            recursive(path, list)
          } 
        })

        return list
      }
    )
    
  }
},{
  /**
   * 再起動
   * @param {Array<String>} 管理者権限が必要なコマンドの一覧
   * @returns {Promise}
   */
  runas:(arr)=>{
    var cmd = ''
    if(new RegExp(arr.join('|')).test((cmd = Commander._findCommand(process.argv[2] || '')) && cmd.name())){
      return new Promise((resolve,reject)=>{
        var argv = process.argv.slice(2).join(',')
        require('child_process').exec('net session', (err, stdout, stderr) => {
          if(err){
            Spawn(`PowerShell Start-Process -FilePath nodistx.cmd -ArgumentList ${argv} -Verb RunAs >nul`)
            .catch(none=>{
              console.log('Requires permissions to re-create symbolic links in npm.tar.gz/node_modules/workspaces')
            })
          }else{
            resolve(true)
          }
        })
      })
    }else{
      return new Promise((resolve,reject)=>{
        resolve(true)
      })
    }
  },
  /**
   * 初期化
   */
  init:function(){    
    Commander.name(Package.name)
          .version(Package.version)
      .description(Package.description)
      Inquirer.registerPrompt('table', InquirerRelease)
  },
  /**
   * 確認
   * @param {String} メッセージ
   * @returns {Promise}
   */
  confirm:function(message){
    return Inquirer.prompt([
      {
        message: message,
        type: 'confirm',
        default: true,
        name: 'qus'
      }
    ])
  },
  /**
   * バージョンの一覧を表示
   * @param {Array<Object>} 一覧の配列
   * @returns {Promise} 
   */
  table:function(list){
    return Inquirer.prompt([
      {
        type: 'table',
        name: 'talk',
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