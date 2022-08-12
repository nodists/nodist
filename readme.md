## 🐿️ Nodistx
NODEJS/NPMをセットでインストールできる最速のマネージャだ。バージョンを選択するだけ。後は何をするのも自由だ。カップ麺やコーヒーを淹れている間に、必要なパッケージをインストールして動作する状態にしてくれる

![usage](https://user-images.githubusercontent.com/98066622/182986552-9a5a82ed-65e9-4066-a1e4-21d18acc382c.gif)

## 📡 Installing
install.batを走らせるだけ。このインストーラはGITHUB CLIENTを最新にして本家ISSUEのいくつかの問題を解決するこのバッチファイルはNODISTのインストールを行うが、依存パッケージを最新にして既存のNODISTが存在すれば削除する（C:\Program Files (x86)\Nodist）更に、レート制限にひっかからないようGITHUBのAPI KEY の設定を促す

| 解決 | https://github.com/nullivex/nodist/pulls              |
|:--:|:--------------------------------------------------------|
| 〇 | Use the Octokit client for GitHub                       |

| 解決 | https://github.com/nullivex/nodist/issues/            |
|:--:|:--------------------------------------------------------|
|	〇 | 无法安装 npm                                             |
|	〇 | Invalid Version: libnpmversion-v3.0.1.                  |
|	〇 | npm 8.6, authorization header missing & symlink problem |
## 💻 Support latest >= nodejs/npm

これ未満のバージョンをインストールしたいならNODIST本体のコマンドを走らせてほしい。こうする理由は入力を受け付けなくなるからだ。v6.1.0からカーソルキーが反応しなくなって一覧を操作できない。原因わかる方々いる？

```bat
C:>nodist global 6.1.0 && nodist npm global 3.8.6
```
 <table>
   <thead>
     <tr>
       <th>解決</th>
       <th>C:\Program Files (x86)\Nodist\package.json</th>
    </tr>
  </thead>
   <tbody>
     <tr>
       <td>ansi-styles-4.3.0.tgz</td>
       <td rowspan='6'>
         <p>v6.2.0で走らせるために依存パッケージにポリフィルを適用した。</p>
         <p>v6.2.0で動作するかテストしてコミットする必要あり</p>
         <ul>
           <li>nodejs v6.2.0</li>
           <li>npm 3.8.9</li>
        </ul>
      </td>
    </tr>
     <tr>
       <td>chalk-4.1.2.tgz</td>
    </tr>
     <tr>
       <td>commander-9.4.0.tgz</td>
    </tr>
     <tr>
       <td>inquirer-8.2.4.tgz</td>
    </tr>
     <tr>
       <td>ora-5.4.1.tgz</td>
    </tr>
     <tr>
       <td>wrap-ansi-7.0.0.tgz</td>
    </tr>
  </tbody>
</table>

## 📦 Example

`nodistx use`を走らせるとバージョンが切り替わる。node_modules/シンボリックリンクが張り直されるから正しく動く。このシンボリックリンクを作るのに管理者権限がいるから、add/useコマンドは自動的にRUNASで起動を促す

```bat
C:>nodistx use ls インストールしたバージョンを選択できます
C:>nodistx use ds インストールしてないバージョンを選択できます（自動インストールされます）
C:>nodistx use rs インストールしてないしたを一覧化して全バージョンを選択できます（https://nodejs.org/dist/index.json）
```

```bat
C:>nodistx
Usage: nodistx [options] [command]

A node.js and npm version manager（Nodist will not die. It will revive）

Options:
  -V, --version   output the version number
  -h, --help      display help for command

Commands:
  by|@            Check a nodejs of currently version
  add|+           Install a nodejs of specific version
  remove|-        Uninstall a nodejs of specific version
  use|; [from]    Use a nodejs of specific version after automatically install
  list|ls         Get a list of installed nodejs version
  dist|ds         Get a list of all available nodejs versions
  rist|rs         Get a list of https://nodejs.org/dist/index.json
  help [command]  display help for command
```
## 💙 Special Thanks

これを作る機会をくれた私の愛する村山に感謝します。結婚しよう。君の近くにいられて幸せなことを全員の前で誓いたい。話そう。１２月２６日をやり直したいんだ。村山さん。君に愛されたい。心から

## 😊 Thanks
* ウィンドウズスクリプトプログラマ/[unix tee擬似バッチファイル(その２): Windows Script Programming](http://scripting.cocolog-nifty.com/blog/2007/03/unix_tee_11d0.html)
* madumal7/[npm ERR! Cannot read property 'startsWith' of null · Issue #19719 · npm/npm](https://github.com/npm/npm/issues/19719)
* dbenham/[windows - Using a custom Tee command for .bat file - Stack Overflow](https://stackoverflow.com/questions/10711839/using-a-custom-tee-command-for-bat-file/10719322#10719322)
* dbenham/[How to catch DEL errors? It's possible? - DosTips.com](https://www.dostips.com/forum/viewtopic.php?t=7054)
* fealebenpae/[Use the Octokit client for GitHub](https://github.com/nullivex/nodist/pull/246)
* eduardoboucas/[inquirer-table-prompt](https://github.com/eduardoboucas/inquirer-table-prompt)
* freMea/[Template.bat](https://gist.github.com/freMea/0e907150d14e68f26794207fbeec8fa0)
* SBoudrias/[Inquirer.js](https://github.com/SBoudrias/Inquirer.js/)
* nullivex/[Nodist](https://github.com/nullivex/nodist)

実装済
```
nodist                          List all installed node versions.
nodist list
nodist ls

nodist dist                     List all available (not installed) node versions.
nodist ds

nodist add <version>            Install the latest published version matching <version>;
nodist + <version>              if any set requirement matches this version, this will get referenced in the future.

nodist rm <version>             Uninstall the latest installed version matching <version>;
nodist - <version>              if any set requirement matches this <version>, it will try to reference another installed version.

nodist <ver-req>                Set the global version requirement;
nodist global <ver-req>         installs the specified node version if it hasn't been installed.

nodist local <ver-req>          Set the local requirement for this directory and its subdirectories;
                                adds or updates the ./node-version file.

nodist env <ver-req>            Set the requirement for the current environment only
                                (usually the current terminal window).

nodist run <ver-req> -- <args>  Run <args> with a version matching the provided requirement
nodist r <ver-req> -- <args>    (will abort if no matching version is installed).
```
追加済
```
nodist rist                     List all from https://nodejs.org/dist/index.json
nodist rs
```

