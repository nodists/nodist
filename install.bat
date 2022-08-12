    @chcp   437
    @echo   off
     @cls
     
 setlocal   enableextensions 
 setlocal   enabledelayedexpansion

      rem   self
      set   bat="%~f0"
      set   loc="%~dp0"
      rem   util command
      set   tee="%loc:"=%\util\tee.bat" 
      rem   update github client
      set   src="%loc:"=%\nodist\update"
      set   dst="%ProgramFiles(x86)%\Nodist"
      rem   uninstall nodist and then install
      set   ust="%dst:"=%\uninstall.exe"   
      set   ist="%loc:"=%\nodist\nodist-0.9.1.exe"
      rem   installed nodistx command location
      set   cmd="%dst:"=%\bin\node_modules\nodistx"

if not defined process (
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ run this batch as admin for wait for uninstall nodist     บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            openfiles >nul 2>&1
            if errorlevel 1 (
              powershell start-process -filepath %bat% -verb runas
              exit
            )
      
      set  "NODIST_PREFIX=%dst:"=%"
      set  "PATH=%PATH%;%dst:"=%\bin"
      set  "NODE_PATH=%dst:"=%\bin\node_modules"
      set  "NODIST_IOJS_MIRROR=https://iojs.org/dist"
      set  "NODIST_NODE_MIRROR=https://nodejs.org/dist"
      set  "NODIST_GITHUB_TOKEN=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2"
      set   process=1
call:next
)
if %process% equ 1 (
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ stop process all node.exe that is running                 บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            for /f "usebackq delims=" %%i in (`powershell "(get-process node -ea 0).Count"`) do set count=%%i
            if !count! gtr 0 ( powershell "stop-process -Name node" )
            if errorlevel 1 (
              pause
              exit
            )
call:next
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ uninstall already exist nodist                            บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            if exist %ust% (
              start /wait "" %ust%
              powershell "while (^!($proc = (get-process Un_A -ea SilentlyContinue))){ sleep 1 };"^
                         "$handle = $proc.handle; wait-process Un_A;"^
                         "exit $proc.exitcode;"
              if errorlevel 1 (
                pause
                exit
              )
    :00001
              if exist %dst% (
                rmdir /s /q %dst% 2>&1 1>nul | findstr "^" ^
                && pause && goto:00001
              )
            )
call:next
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ install nodist                                            บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            start /wait "" %ist%
call:next
call:self
)
if %process% equ 2 (
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ remove package-lock.json and replace package.json and lib บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            del /q "%dst:"=%\package-lock.json" 2>&1 1>nul | findstr "^" ^
            && pause && exit
            xcopy /e /y %src% %dst%
            if errorlevel 1 (
              pause
              exit
            )
call:next
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ et an alternative url to fetch io.js exectuables          บ
     echo   บอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออบ
     echo   บ e.g. https://iojs.org/dist                                บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
call:scan   NODIST_IOJS_MIRROR
     setx   NODIST_IOJS_MIRROR "!NODIST_IOJS_MIRROR: =!" >nul
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ set an alternative URL to fetch the node executables      บ
     echo   บอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออบ
     echo   บ e.g. https://nodejs.org/dist                              บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
call:scan   NODIST_NODE_MIRROR
     setx   NODIST_NODE_MIRROR "!NODIST_NODE_MIRROR: =!" >nul
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ set access token to bypass github api rate limit          บ
     echo   บอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออบ
     echo   บ e.g. ghp_16C7e42F292c6912E7710c838347Ae178B4a             บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            start "" "https://github.com/settings/tokens"
            start "" rundll32.exe sysdm.cpl,EditEnvironmentVariables
call:scan   NODIST_GITHUB_TOKEN
     setx   NODIST_GITHUB_TOKEN "!NODIST_GITHUB_TOKEN: =!" >nul
call:next
call:self
)
if %process% equ 3 (
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ udpate nodist dependencies                                บ
     echo   บอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออบ
     echo   บ Package             Noidst  Nodistx  Latest               บ
     echo   บ @octokit/rest            -  18.12.0  19.0.3               บ
     echo   บ bluebird             3.5.2    3.7.2   3.7.2               บ
     echo   บ debug                4.1.1    4.3.4   4.3.4               บ
     echo   บ mkdirp                ~0.5    0.5.6   1.0.4               บ
     echo   บ ncp                  2.0.0    2.0.0   2.0.0               บ
     echo   บ progress               2.x    2.0.3   2.0.3               บ
     echo   บ promisepipe          3.0.0    3.0.0   3.0.0               บ
     echo   บ recursive-readdir    2.2.2    2.2.2   2.2.2               บ
     echo   บ request             2.88.0   2.88.2  2.88.2               บ
     echo   บ rimraf                  ~2    3.0.2   3.0.2               บ
     echo   บ semver               6.0.0    7.3.7   7.3.7               บ
     echo   บ tar                    4.x   6.1.11  6.1.11               บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            cd %dst%
            npm install
            npm install 2>&1 | %tee% | findstr "ERR" ^
            && pause && exit
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Install nodistx from npm pack this will install globally  บ
     echo   บ so that it may be run from the console anywhere           บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            cd %loc%
            npm pack . >nul
            npm install "nodistx-1.0.0.tgz" --global --force
call:next
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Update for support all nodejs version starting from 6.2.0 บ
     echo   บ Earlier versions do not does not work key input inquirer  บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            cd %cmd%
            (
              npm install "package\ansi-styles-4.3.0.tgz"
              npm install "package\chalk-4.1.2.tgz"
              npm install "package\commander-9.4.0.tgz"
              npm install "package\inquirer-8.2.4.tgz"
              npm install "package\ora-5.4.1.tgz"
              npm install "package\wrap-ansi-7.0.0.tgz"
            ) 2>&1 | %tee% | findstr "ERR" ^
            && pause && exit
call:next
call:self
)
if %process% equ 4 (
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Replace v6.9.0 to 6.7.0 of nodist bundled nodejs version  บ
     echo   บอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออบ
     echo   บ for match nodejs.org/en/download/releases/                บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            call nodist.cmd npm 6.7.0
            call nodist.cmd npm remove 6.9.0
call:next
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Install nodejs v6.2.0 and npm 3.8.9 release on 2016-05-17 บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            call nodist.cmd global 6.2.0
            call nodist.cmd npm 3.8.9
call:next
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Download versions.json to get all release nodejs versions บ 
     echo   บอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออบ
     echo   บ from nodejs.org/dist/index.json                           บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            call nodist.cmd dist >nul 2>&1
call:next
call:self
)
if %process% equ 5 (
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Welcome to nodistx                                        บ 
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.    
            start /wait /b "" nodistx.cmd --help
)
:debug
      rem   call:debug
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Debug                                                     บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
     echo    bat=%bat$
     echo    loc=%loc%
     echo    tee=%tee%
     echo    src=%src%
     echo    dst=%dst%
     echo    ust=%ust%
     echo    ist=%ist%
     echo    cmd=%cmd%
exit /b 0
:sleep
      rem   call:sleep 5 (second)
  timeout   /t %~1 /nobreak >nul 2>&1
exit /b 0
:confirm
      rem   call:confirm "Do you want to process ?"
      cls
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo     %~1
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
     echo   Press any key to continue or close this window
    pause   >nul
exit /b 0
:next
      rem   call:next
     echo     OK
exit /b 0
:self
      rem   call:self
             set /a process+=1
             start /wait /b /d %loc% "" %bat%
             exit
exit /b 0
:scan
      rem   call:scan
:continue
            for /f %%a in ('"prompt $H&for %%b in (1) do rem"') do set "BS=%%a"
            set /p "%1=X!BS!   %1="
            if "%1" == "" (
              goto continue
            ) 
exit /b 0