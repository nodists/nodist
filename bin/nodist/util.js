const Fs = require('fs');
const Path = require('path');

const _ = require('lodash');
const Semver = require('semver');

(()=>{
  /**
   * 設定値を纏めます
   * バージョン名やインストール先を返します
   */
  Object.defineProperty(global,'nodist',{
    /**
     * 本来インストール先はアーキテクチャ毎に異なります
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
       * nodist.use().nodejsと書くよりnodist.use.nodejsとしたほうが綺麗なので
       */
      return {
        get can(){
          return{
            get remove(){
              return{
                npm(version){
                  return{
                    get one(){
                      return _(nodist.nodejsorg.json).filter('installed').groupBy('npm').get(version).length == 1
                    }
                  }
                }
              }
            }
          }
        },
        /**
         * 現在使用中のグローバルのバージョンを返します
         * バージョンの生値から'v'を消します（nodejsのバージョン名にはv接頭辞があります）
         * nodistはダウンロードとインストール前にバージョンファイルを更新するため注意が必要です
         * @returns {String}
         */
        get use(){
          return{
            nodejs:Semver.clean(Fs.readFileSync(`${path}\\.node-version-global`).toString()),
            npm:Fs.readFileSync(`${path}\\.npm-version-global`).toString()
          }
        },
        /**
         * インストール済のＮＯＤＥの一覧を返します
         * @returns {Array<Object>} x.x.x:{}
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
             * インストール済のＮＰＭの一覧を返します
             * シンボリック張り替えるためnode_modulesを含みます
             * @returns {Array<Object>} x.x.x:{node_modules:path}
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
         * リリースの一覧を返します
         *   データ元
         *     https://iojs.org/dist/index.json
         *     https://nodejs.org/dist/index.json
         *   参照場所
         *     C:\Program Files (x86)\Nodist\versions.json
         * @returns {Array<Object>} 
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