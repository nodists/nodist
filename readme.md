## 🐿️ Nodistx
NODEJS/NPMをセットでインストールできる最速のマネージャだ。バージョンを選択するだけ。後は何をするのも自由だ。カップ麺やコーヒーを淹れている間に、必要なパッケージをインストールして動作する状態にしてくれる

![usage](https://user-images.githubusercontent.com/98066622/182986552-9a5a82ed-65e9-4066-a1e4-21d18acc382c.gif)

## 📡 Installing
install.batを走らせるだけ。自由が手に入る。コマンドを打つ手間から解放されV8やセキュリティリリースだったか調べる手間いらず。足りない機能を追加して修正した。

| 解決 | https://github.com/nullivex/nodist/pulls              |
|:--:|:--------------------------------------------------------|
| 〇 | Use the Octokit client for GitHub                       |

| 解決 | https://github.com/nullivex/nodist/issues/            |
|:--:|:--------------------------------------------------------|
|	〇 | 无法安装 npm                                             |
|	〇 | Invalid Version: libnpmversion-v3.0.1.                  |
|	〇 | npm 8.6, authorization header missing & symlink problem |

このバッチファイルはNODISTのインストールを行うが、依存パッケージを最新にして既存のNODISTが存在すれば削除する（C:\Program Files (x86)\Nodist）更に、レート制限にひっかからないようGITHUBのAPI KEY の設定を促す

## 💻 Support latest >= nodejs/npm

これ未満のバージョンをインストールしたいならNODIST以下のコマンドを走らせてほしい。こうする理由は入力を受け付けなくなるからだ。v6.1.0からカーソルキーが反応しなくなって一覧を操作できない。原因わかる方々いる？

```bat
C:>nodist global 6.1.0 && nodist npm global 3.8.6
```

* nodejs v6.2.0
* npm 3.8.9

## 📦 Example

`nodistx use`を走らせるとバージョンが切り替わる

```bat
C:>nodistx use ls インストールしたバージョンを選択できます
C:>nodistx use ds インストールしてないバージョンを選択できます（自動インストールされます）
C:>nodistx use rs インストールしてないしたに関わらず全バージョンを選択できます（https://nodejs.org/dist/index.json）
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

これを作る機会をくれた私の愛する村山に感謝します。結婚しよう。

## 😊 Thanks
* fealebenpae/[Use the Octokit client for GitHub](https://github.com/nullivex/nodist/pull/246)
* eduardoboucas/[inquirer-table-prompt](https://github.com/eduardoboucas/inquirer-table-prompt)
* freMea/[Template.bat](https://gist.github.com/freMea/0e907150d14e68f26794207fbeec8fa0)
* SBoudrias/[Inquirer.js](https://github.com/SBoudrias/Inquirer.js/)
* nullivex/[Nodist](https://github.com/nullivex/nodist)
