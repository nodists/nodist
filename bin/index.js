#!/usr/bin/env node

const Fs = require('fs');
const Path = require('path');

const _ = require('lodash');
const Inquirer = require('inquirer');
const Commander = require('commander');
const InquirerRelease = require('./inquirer.js');

const Util = require('./nodist/util.js');
const Package = require('../package.json');
const { Spawn } = require('./nodist/process.js');

((
  List,
  Nodist,
  Wafflook
)=>{

  Wafflook.init()
  
  // 操作
  Commander.command('by').alias('@')
       .description('Check a nodejs of currently version')
            .action(none=>Wafflook.table([List.nodejsorg(Util.use.nodejs)]))
  Commander.command('add').alias('+')
       .description('Install a nodejs of specific version')
            .action(none=>Wafflook.table(List.available()).then(specific=>Nodist.add(specific.talk.version,specific.talk.npm)))
  Commander.command('remove').alias('-')
       .description('Uninstall a nodejs of specific version')
            .action(none=>{
              var list = List.installed()
              _.remove(list,{version:Util.use.nodejs})
              Wafflook.table(list).then(specific=>{
                if(Util.can.remove.npm(specific.talk.npm).dependencies){
                  Nodist.del(specific.talk.version,specific.talk.npm)
                }else{
                  Wafflook.confirm('npm is used by other installed nodejs, do you want to remove nodejs only?').then(yes=>{
                    Nodist.del(specific.talk.version,yes ? undefined : specific.talk.npm)
                  })
                }
              })
            })
  Commander.command('use').alias(';')
       .description('Use a nodejs of specific version after automatically install')
       .addArgument(new Commander.Argument('[from]', 'from the ls|ds|rs versions').choices(['ls', 'ds', 'rs']))
            .action(from=>{
              Wafflook.table({ls:List.installed,ds:List.available,rs:List.nodejsorg}[from || 'rs'].call(List)).then(specific=>{
                Nodist.use(specific.talk.version,specific.talk.npm).then(none=>{
                  Nodist.lnk(specific.talk.npm)
                })
              })
            })
  // 一覧
  Commander.command('list').alias('ls')
       .description('Get a list of installed nodejs version')
            .action(none=>Wafflook.table(List.installed()))
  Commander.command('dist').alias('ds')
       .description('Get a list of all available nodejs versions')
            .action(none=>Wafflook.table(List.available()))
  Commander.command('rist').alias('rs')
       .description('Get a list of https://nodejs.org/dist/index.json')
            .action(none=>Wafflook.table(List.nodejsorg()))
  // 実行
  Wafflook.runas(['use','add']).then((must)=>{
    if(must){
      Commander.parse(process.argv)
    }
  })

})({
  /**
   * 新しいバージョンをインストールする時に使う
   * @returns 未インストールのバージョンの一覧
   */
  available:function(){
    return (this.nodejsorg()).filter(list=>list.installed == false)
  },
  /**
   * インストール済バージョンを利用する時に使う
   * @returns インストール済のバージョンの一覧
   */
  installed:function(){
    return (this.nodejsorg()).filter(list=>list.installed)
  },
  /**
   * このコマンドが一発
   * インストール済から利用設定
   * 未インストールから利用設定（自動インストール）
   * 両方どちらからでもインストールされてなければ自動でインストールされバージョンが切り替わる
   * @param {String} nodejs 特定のバージョンの情報だけ欲しいなら
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
  /**
   * バージョンを切り替える
   * バージョンが未インストールなら自動インストール後に切り替える
   */
  use:function(node,npm) {
    return Spawn([
      `nodist global ${node}`,
      `nodist npm global "${npm}"`
    ].join(' && '))
  },
  /**
   * バージョンをインストールする
   */
  add:function(node,npm){
    return Spawn([
      `nodist add ${node}`,
      `nodist npm add "${npm}"`
    ].join(' && '))
  },
  /**
   * バージョンをアンインストールする
   */
   del:function(node,npm){
    return Spawn([
      node && `nodist remove ${node}`,
      npm && `nodist npm remove ${npm}`
    ].filter(Boolean).join(' && '))
  },
  /**
   * 要注意
   * バージョン18系NPMはシンボリックリンクを含む
   * https://codeload.github.com/npm/cli/tar.gz/v8.13.2（例）
   * ファイルの種類は.symlinkで0byte解凍ソフトを変えても同じ（7Zip）
   * 以前までnpm intallして手動で追加していたがリンクを張り直すよう修正
   * 抽出リンク
   * 　 dir /AL /S
   * 対応ファイル
   * node_modules
   * │  libnpmaccess
   * │  libnpmdiff
   * │  libnpmexec
   * │  libnpmfund
   * │  libnpmhook
   * │  libnpmorg
   * │  libnpmpack
   * │  libnpmpublish
   * │  libnpmsearch
   * │  libnpmteam
   * │  libnpmversion
   * │
   * └─@npmcli
   *         arborist
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
   * コマンドプロンプト再起動（管理者として）
   * シンボリックリンクを解凍するのと張り直す処理（作り直しのため
   * @param {Array<String>} arr 管理者権限が必要なコマンドを配列で渡します
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
  init:function(){    
    Commander.name(Package.name)
          .version(Package.version)
      .description(Package.description)
      Inquirer.registerPrompt('table', InquirerRelease)
  },
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