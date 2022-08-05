      rem   mode console cols=100 lines=45
    @chcp   437
    @echo   off
     @cls
      rem   Make sure that the path is relative to the location of the batch in admin
       cd   /d "%~dp0"
      rem   allows to call variables with ! instead of % to get the expected values inside the blocks (if, for, etc.)
     
 setlocal   enableextensions 
 setlocal   enabledelayedexpansion

      rem   https://gist.github.com/freMea/0e907150d14e68f26794207fbeec8fa0
      rem   =====================================================================
      rem   --- VALID VARIABLES
      rem   =====================================================================
      rem   set                          Lists all valid variables on the PC
      rem   %__APPDIR__%                 The folder containing the executable of the command (C:\Windows\SYSTEM32\)
      rem   %ALLUSERSPROFILE%            C:\ProgramData
      rem   %APPDATA%                    C:\Users\{username}\AppData\Roaming
      rem   %CD%                         Current working folder (C:\Users\Wafflook\)
      rem   %CmdCmdLine%                 Returns the command line given to the batch
      rem   %CMDEXTVERSION%              Return a number (NT = "1", Win2000+ = "2")
      rem   %COMMONPROGRAMFILES%         C:\Program Files\Common Files
      rem   %COMMONPROGRAMFILES(x86)%    C:\Program Files (x86)\Common Files
      rem   %COMPUTERNAME%               Returns the name assigned to the computer (PC-WAFFLOOK)
      rem   %COMSPEC%                    C:\Windows\System32\cmd.exe
      rem   %DATE%                       returns the date in regional format (25/07/2022)
      rem   %ERRORLEVEL%                 Contains the error code of the last command used or the one returned by "EXIT /B 65" where %ERRORLEVEL% will be equal to 65
      rem   !ERRORLEVEL!                 Use this with "setlocal ENABLEDELAYEDEXPANSION" to be sure to have the return code of the last command in all circumstances
      rem   %FIRMWARE_TYPE%              The boot type of the system, e.g. Legacy ,UEFI, Not implemented, Unknown
      rem   %HOMEDRIVE%                  Contains the drive letter where the current user's directory is located (C:)
      rem   %HOMEPATH%                   \Users\{username} (note: no disc letter)
      rem   %LOCALAPPDATA%               C:\Users\{username}\AppData\Local
      rem   %LOGONSERVER%                \\{domain_logon_server} (\\PC-WAFFLOOK)
      rem   %NUMBER_OF_PROCESSORS%       Returns the number of processors (12)
      rem   %OS%                         Operating system version (Windows_NT)
      rem   %PATH%                       Returns the path to the main system executables
      rem   %PATHEXT%                    Returns the extensions that the system considers as executable.
      rem   %PROCESSOR_ARCHITECTURE%     Returns the architecture used by the command (AMD64/IA64/x86)
      rem   %PROCESSOR_IDENTIFIER%       Processor ID (Intel64 Family 6 Model 62 Stepping 4, GenuineIntel)
      rem   %PROCESSOR_LEVEL%            6
      rem   %PROCESSOR_REVISION%         Proc version (3e04)
      rem   %PROGRAMDATA%                C:\ProgramData
      rem   %PROGRAMFILES%               C:\Program Files
      rem   %PROGRAMFILES(X86)%          C:\Program Files (x86) (only in 64?bit version)
      rem   %PROMPT%                     Code for current command prompt format,usually $P$G (C:>)
      rem   %PSModulePath%               Paths containing PowerShell modules
      rem   %PUBLIC%                     C:\Users\Public
      rem   %RANDOM%                     Returns an integer between 0 and 32167 chosen randomly by the system
      rem   %SystemDrive%                C:
      rem   %SystemRoot%                 C:\Windows
      rem   %TEMP% et %TMP%              C:\Users\{username}\AppData\Local\Temp
      rem   %TIME%                       Returns the current time in regional format (20:49:13,11)
      rem   %USERDOMAIN%                 Contains the domain to which the current account belongs. Normally equivalent to %COMPUTERNAME% (PC-WAFFLOOK)
      rem   %USERNAME%                   WAFFLOOK
      rem   %USERPROFILE%                C:\Users\{username}
      rem   %WINDIR%                     C:\Windows

      rem   You shouldn't touch these variables
      set   system-color=color 07
      set   error-color=color  4E
      set   end-color=color    2F

      rem   self
      set   slf="%~f0"
      set   loc="%~dp0"
      set   bat="%~dpnx0"
      rem   nodist update packages
      set   src="%~dp0%\nodist\update"
      set   dst="%ProgramFiles(x86)%\Nodist\"
      rem   nodist installer and uninstaller location
      set   ust="%dst:"=%uninstall.exe"   
      set   ist="%loc:"=%nodist\nodist-0.9.1.exe"
      rem   nodist use octokit rest client for github authentication
      set   NODIST_GITHUB_TOKEN=!key!

      rem  run
     call  :debug
     call  %system-color%

if "%1" == "nodistx" (
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Create package.tgz                                        บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.  
      rem   https://docs.npmjs.com/cli/v6/commands/npm-pack
            npm pack . >nul
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Install nodistx command                                   บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
      rem   C:\Program Files (x86)\Nodist\bin\nodistx.cmd
            npm install "nodistx-0.0.1.tgz" --force --global >nul
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Update nodist dependencies for support nodejs v6.2.0      บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
      rem   Always move the package to the command folder where you need it before installing it.
      rem   don't run npm install "%loc:"=%package\inquirer-8.2.4.tgz"
      rem   --prefix "%dst:"=%bin\node_modules\nodistx"
      rem   because duplicate node_modules
            cd "%dst:"=%bin\node_modules\nodistx"
            npm install "package\ansi-styles-4.3.0.tgz"
            npm install "package\chalk-4.1.2.tgz"
            npm install "package\commander-9.4.0.tgz"
            npm install "package\inquirer-8.2.4.tgz"
            npm install "package\ora-5.4.1.tgz"
            npm install "package\wrap-ansi-7.0.0.tgz"
            cd %loc%
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Default nodejs 11.13.0 npm 6.7.0                          บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
      rem   reinstall the match version consistently in versions.json
            nodist npm global 6.7.0
            nodist npm remove 6.9.0
     echo.
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Supported nodejs a more than 6.2.0 npm 3.8.6              บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
       rem  Because the console won't accept cursor key input.
            nodist global 6.2.0
            nodist npm global 3.8.9
     echo.
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Run nodistx                                               บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
      rem   https://stackoverflow.com/questions/8261156/start-new-cmd-exe-and-not-inherit-environment
      rem   download list of nodejs and npm versions.json && nodistx
            nodist dist >nul 2>&1
            nodistx
) else (
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Run this batch as admin because wait for uninstall nodist บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
      rem   https://superuser.com/questions/1233937/how-do-you-pass-program-files-x86-to-powershell
            openfiles >nul 2>&1
            if !ErrorLevel! == 1 (
              cd !~dp0
              PowerShell Start-Process -FilePath !slf! -Verb RunAs
              exit
          ) else (
     echo    OK
          )
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Uninstall the already exists nodist                       บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
      rem   stackoverflow.com/questions/31684620/wait-for-ust-to-finish-using-batch
      rem   /wait uninstall.exe, NSIS takes over the uninstallation to Un_a process,
      rem   so it cannot be monitored and cannot wait, just for this one code wait-process
      rem   escaping special characters '!' using the caret character (enabledelayedexpansion)
    :cntd
            if exist !ust! (
              set wait=`powershell "(get-process Un_* -ea 0).Count"`
              for /f "usebackq delims=" %%i in (!wait!) do set count=%%i
              if !count! gtr 0 (
     echo    Plaese exit !count! uninstaller's, Press key to continue
                pause >nul
goto cntd
              ) else (      
                start /wait "" !ust!
                powershell "while (^!($proc = (get-process Un_A -ea SilentlyContinue))){ sleep 1 };"^
                           "$handle = $proc.handle; wait-process Un_A;"^
                           "exit $proc.exitcode;"
                if !ErrorLevel! == 0 (
                  rmdir /s /q !dst!
                if not !ErrorLevel! == 0 (
     echo    FAIL
                  pause
                )
     echo    OK
              ) else (
     echo    FAIL
              )
              )
          ) else (
     echo    Nodist not installed yet
             where npm
                if !ErrorLevel! == 0 (
     echo   if node is already installed on your machine, uninstall it first.
            pause
            exit
                )
          )
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Install Nodist                                            บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
      rem   The tgz needs to be updated to decompress correctly and parse
      rem   the version without exception.
      rem   Package             Noidst  Nodistx  Latest
      rem   @octokit/rest            -  18.12.0  19.0.3
      rem   bluebird             3.5.2    3.7.2   3.7.2
      rem   debug                4.1.1    4.3.4   4.3.4
      rem   mkdirp                ~0.5    0.5.6   1.0.4
      rem   ncp                  2.0.0    2.0.0   2.0.0
      rem   progress               2.x    2.0.3   2.0.3
      rem   promisepipe          3.0.0    3.0.0   3.0.0
      rem   recursive-readdir    2.2.2    2.2.2   2.2.2
      rem   request             2.88.0   2.88.2  2.88.2
      rem   rimraf                  ~2    3.0.2   3.0.2
      rem   semver               6.0.0    7.3.7   7.3.7
      rem   tar                    4.x   6.1.11  6.1.11
            start /wait "" !ist!
            if !ErrorLevel! == 0 (
              del /q "!dst:"=!package-lock.json"
              xcopy /e /y /q !src! !dst!
              if not !ErrorLevel! == 0 (
     echo       FAIL
                pause && exit
              )
     echo    OK
            ) else (
     echo    FAIL
            )
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Set GitHub API Token                                      บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
      rem   Set access token to bypass github api rate limit (remove whitespace)
      rem   https://stackoverflow.com/questions/51180725/batch-file-choice-indent-prompt
            start "" "https://github.com/settings/tokens"
            start "" rundll32.exe sysdm.cpl,EditEnvironmentVariables
    :loop
            for /f %%a in ('"prompt $H&for %%b in (1) do rem"') do set "BS=%%a"
            set /p "key=X!BS!   NODIST_GITHUB_TOKEN="
            if "!key!" == "" (
              echo no input
goto loop
            )
            setx NODIST_GITHUB_TOKEN "!key: =!"
     echo    OK
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Update nodist dependencies {octocat...etc}                บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
            cd !dst!
            npm install
     echo.
            if !ErrorLevel! == 0 (
     echo    OK
            ) else (
     echo    FAIL
            )
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Setup noistx                                              บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
      rem   install nodistx
            start /wait /b /d %loc% "" %bat% nodistx
            if !ErrorLevel! == 0 (
     echo    OK
            ) else (
     echo    FAIL
    pause   >nul
            )
)

:debug
      rem   call:debug
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo   บ Debug                                                     บ
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
     echo    LOC=!loc!
     echo    BAT=!bat!
     echo    SLF=!slf!
     echo    SRC=!src!
     echo    DST=!dst!
     echo    IST=!ist!
     echo    UST=!ust!
exit /b
:sleep
      rem   call:sleep 5 (second)
  timeout   /t %~1 /nobreak >nul 2>&1
exit /b
      rem   call:confirm "Do you want to process ?"
:confirm
      cls
     echo.
     echo   ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
     echo     %~1
     echo   ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
     echo.
     echo   Press any key to continue or close this window
    pause   >nul
exit /b 0