const Fs = require('fs');
const Path = require('path');

const _ = require('lodash');
const Semver = require('semver');

(()=>{
  /**
   * 設定値の取得を纏めたかった
   * あらゆる場所にバージョン名とかインストール先ちりばめたらやばい
   */
  Object.defineProperty(global,'nodist',{
    /**
     * アーキテクチャによってインストール先が変わるから将来的に対応する予定
     * @param {Number} bit 64 or 32
     */
    set(bit){
      this.architecture = bit
    },
    get(){
      /**
       * 基本はここ
       */
      var path = 'C:\\Program Files (x86)\\Nodist'
      /**
       * ゲッターの定義
       * nodist.use().nodejsと書くよりnodist.use.nodejsとしたほうが綺麗
       */
      return {
        get can(){
          return{
            get remove(){
              return{
                npm(version){
                  return{
                    get dependencies(){

                      return _(nodist.nodejsorg.json).filter('installed').groupBy('npm').get(version).length == 1
                    }
                  }
                }
              }
            }
          }
        },
        /**
         * 現在使用中のバージョンを返す
         * バージョンの生値から'v'を消して返す（nodejsのバージョンにはv接頭辞がある）
         * nodistはダウンロードとインストール終わってなくてもバージョンを保存するから注意
         */
        get use(){
          return{
            nodejs:Semver.clean(Fs.readFileSync(`${path}\\.node-version-global`).toString()),
            npm:Fs.readFileSync(`${path}\\.npm-version-global`).toString()
          }
        },
        /**
         * インストール済のバージョンを返す
         */
        get installed(){
          return{
            get nodejs(){
              return Fs.readdirSync(`${path}\\v-x64`).reduce((list,version)=>{
                return Object.assign(list,{
                  [version]:{

                  }
                })
              },{})
            },
            /**
             * Array<Object>で返す
             * x.x.x:{node_modules:path}として返す
             * 選択されたバージョンがインストール済か確かめたりする
             * シンボリックリンクを張り直すのにnode_mdoulesのパスが必要だった
             */
            get npm(){
              return Fs.readdirSync(`${path}\\npmv`).reduce((list,version)=>{
                return Object.assign(list,{
                  [version]:{
                    node_modules:`${path}\\npmv\\${version}\\node_modules`
                  }
                })
              },{})
            }
          }
        },
        /**
         * nodist distの実行結果を読み取る
         * https://iojs.org/dist/index.json
         * https://nodejs.org/dist/index.json
         * C:\Program Files (x86)\Nodist\versions.json
         */
        get nodejsorg(){
          return{
            get json(){
              // Remove the "v" from the package version name to filter to pacakge >= 6.2.0 and add flag of installed and sort
              return require(Path.join(path,'versions.json')).filter(package=>Semver.gte(package.version,'6.2.0'))
              .map(package=>(Object.assign({},package,{version:Semver.clean(package.version)})))
              .map(package=>(Object.assign({},package,{installed:package.version in nodist.installed.nodejs})))
              .sort((a, b) => {
                if (Semver.gt(a.version, b.version)) return -1
                if (Semver.lt(a.version, b.version)) return +1
                return 0
              })
            }
          }
        }
      }
    }
  })

  module.exports = nodist

})(

)