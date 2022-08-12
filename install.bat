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
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί run this batch as admin for wait for uninstall nodist     Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
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
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί stop process all node.exe that is running                 Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
            for /f "usebackq delims=" %%i in (`powershell "(get-process node -ea 0).Count"`) do set count=%%i
            if !count! gtr 0 ( powershell "stop-process -Name node" )
            if errorlevel 1 (
              pause
              exit
            )
call:next
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί uninstall already exist nodist                            Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
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
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί install nodist                                            Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
            start /wait "" %ist%
            where npm
            if errorlevel 1 (
              pause
              exit
            )
call:next
call:self
)
if %process% equ 2 (
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί remove package-lock.json and replace package.json and lib Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
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
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί et an alternative url to fetch io.js exectuables          Ί
     echo   ΊΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΊ
     echo   Ί e.g. https://iojs.org/dist                                Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
call:scan   NODIST_IOJS_MIRROR
     setx   NODIST_IOJS_MIRROR "!NODIST_IOJS_MIRROR: =!" >nul
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί set an alternative URL to fetch the node executables      Ί
     echo   ΊΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΊ
     echo   Ί e.g. https://nodejs.org/dist                              Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
call:scan   NODIST_NODE_MIRROR
     setx   NODIST_NODE_MIRROR "!NODIST_NODE_MIRROR: =!" >nul
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί set access token to bypass github api rate limit          Ί
     echo   ΊΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΊ
     echo   Ί e.g. ghp_16C7e42F292c6912E7710c838347Ae178B4a             Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
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
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί udpate nodist dependencies                                Ί
     echo   ΊΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΊ
     echo   Ί Package             Noidst  Nodistx  Latest               Ί
     echo   Ί @octokit/rest            -  18.12.0  19.0.3               Ί
     echo   Ί bluebird             3.5.2    3.7.2   3.7.2               Ί
     echo   Ί debug                4.1.1    4.3.4   4.3.4               Ί
     echo   Ί mkdirp                ~0.5    0.5.6   1.0.4               Ί
     echo   Ί ncp                  2.0.0    2.0.0   2.0.0               Ί
     echo   Ί progress               2.x    2.0.3   2.0.3               Ί
     echo   Ί promisepipe          3.0.0    3.0.0   3.0.0               Ί
     echo   Ί recursive-readdir    2.2.2    2.2.2   2.2.2               Ί
     echo   Ί request             2.88.0   2.88.2  2.88.2               Ί
     echo   Ί rimraf                  ~2    3.0.2   3.0.2               Ί
     echo   Ί semver               6.0.0    7.3.7   7.3.7               Ί
     echo   Ί tar                    4.x   6.1.11  6.1.11               Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
            cd %dst%
            npm install
            npm install 2>&1 | %tee% | findstr "ERR" ^
            && pause && exit
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί Install nodistx from npm pack this will install globally  Ί
     echo   Ί so that it may be run from the console anywhere           Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
            cd %loc%
            npm pack . >nul
            npm install "nodistx-1.0.0.tgz" --global --force
call:next
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί Update for support all nodejs version starting from 6.2.0 Ί
     echo   Ί Earlier versions do not does not work key input inquirer  Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
            cd %cmd% > nul
            echo %cmd%
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
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί Replace v6.9.0 to 6.7.0 of nodist bundled nodejs version  Ί
     echo   ΊΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΊ
     echo   Ί for match nodejs.org/en/download/releases/                Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
            call nodist.cmd npm 6.7.0
            call nodist.cmd npm remove 6.9.0
call:next
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί Install nodejs v6.2.0 and npm 3.8.9 release on 2016-05-17 Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
            call nodist.cmd global 6.2.0
            call nodist.cmd npm 3.8.9
call:next
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί Download versions.json to get all release nodejs versions Ί 
     echo   ΊΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΊ
     echo   Ί from nodejs.org/dist/index.json                           Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.
            call nodist.cmd dist >nul 2>&1
call:next
call:self
)
if %process% equ 5 (
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί Welcome to nodistx                                        Ί 
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
     echo.    
            start /wait /b "" nodistx.cmd --help
)
:debug
      rem   call:debug
     echo.
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo   Ί Debug                                                     Ί
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
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
     echo   ΙΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝ»
     echo     %~1
     echo   ΘΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΝΌ
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