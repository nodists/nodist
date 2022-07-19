@echo off
@chcp 65001
@cls

goto description

  最新にした
  バージョン古すぎてエラーと挙動おかしかったので
  バージョン新しくしすぎてもエラーなるので一覧化

  Package   インストールした版   元々版  最新版
  @octokit/rest      18.12.0  18.12.0  19.0.3 参照エラー（globalThis）
  mkdirp               0.5.1    0.5.6   1.0.4 引数エラー（invalid options argument.）
  semver               7.3.7    6.3.0   7.3.7 解析エラー（TAR.GZ 内にバージョン以外が含まれると例外吐いてた）
  tar                 6.1.11   4.4.19  6.1.11 展開エラー（https://codeload.github.com/npm/tar.gz/v8.12.1）
  アップデート問題無
  rimraf               3.0.2    2.7.1   3.0.2
  アップデート必要無（最初から最新版）
  bluebird             3.7.2    3.7.2   3.7.2
  debug                4.3.4    4.3.4   4.3.4
  ncp                  2.0.0    2.0.0   2.0.0
  progress             2.0.3    2.0.3   2.0.3
  promisepipe          3.0.0    3.0.0   3.0.0
  recursive-readdir    2.2.2    2.2.2   2.2.2
  request             2.88.2   2.88.2  2.88.2

:description

@REM 設定

  set src=install
  set dst=%PROGRAMFILES(X86)%\Nodist\
  set key=

@REM 初期

  if "%1" == "init" (

@REM インストールとアップデート
    cd "%dst%"
    npm install

@REM NODE 11.13.0とNPM 6.9.0は古すぎ
    nodist global 18.4.0
    nodist npm global 8.12.1
    
@REM 動作に必要なパッケージ足りない（node_modules）
    nodist npm global 6.9.0
    nodist global 11.13.0

@REM NODE 11.13.0とNPM 6.9.0に切り替えて追加分インストール
    cd "%dst%npmv\8.12.1" 
    npm install

@REM NODE 18.4.0とNPM 8.12.1に切り替えます（これでようやく動作します
    nodist global 18.4.0
    nodist npm global 8.12.1

@REM バージョン確認
    node -v
    npm -v
 
@REM 終了
    pause
  )

@REM 起動（wait-proessのため
  openfiles >nul 2>&1 
  if %errorlevel% == 1 (
    Powershell Start-Process -FilePath "%0" -Verb RunAs -ArgumentList %~dp0
    exit
  ) else (
@REM 変更（C:\Windows\System32がデフォ
    cd %1 && if exist "%dst%uninstall.exe" ( call:uninstall )
@REM 導入（NODIST本体とNODE 18.4.0とNPM 8.12.1
    call:install && start /wait install.bat init
    exit
  )

:uninstall
@REM 削除（start /waitしてもNSISはUn_aって別プロセスにアンインストールを引き継ぐから監視できず待機不可能
   start "" "%dst%uninstall.exe"
@REM 待機（https://stackoverflow.com/questions/31684620/wait-for-uninstaller-to-finish-using-batch
   powershell while (! (get-process Un_a -ea 0)) { sleep 1 }; wait-process Un_a
@REM 削除（アンインストールしても残存するフォルダがたくさん
   rmdir /s /q "%dst%" 2>nul
 exit /b 0

:install
@REM 起動
   start /wait "" nodist-0.9.1.exe
@REM 邪魔（挙動が変わってエラー吐くので
   del /q "%dst%package-lock.json"
@REM 入力（個人アクセストークンはレート制限回避のため
:loop
   start https://github.com/settings/tokens
   set /p "key=NODIST_GITHUB_TOKEN="=%*
   if "%key%" == "" (
     goto loop
   )
@REM 設定（しないとすぐレート制限ひっかかってダウンロードできず
   setx NODIST_GITHUB_TOKEN "%key: =%"
@REM 更新（https://github.com/fealebenpae/nodist/tree/use-octokit
   xcopy /e /y "%src%" "%dst%"
 exit /b 0