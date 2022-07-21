:: NOTE
:: Don't use !,()...etc in echo
:: Set text editor charset to DOS (CP437)

@echo off
@chcp 437
@cls

@REM ??
set bat="%~dpnx0"
@REM ???
set src="%~dp0%install"
@REM ??????
set dst="%ProgramFiles(x86)%\Nodist\"
@REM ???????
set loc="%~dp0"
@REM ????????
set cmd="%loc:"=%nodistx"

@REM ????
set nodistx="%loc:"=%nodistx-0.0.1.tgz"
@REM ??????
set installer="%loc:"=%nodist-0.9.1.exe"
@REM ????????
set uninstaller="%dst:"=%uninstall.exe"

@REM ????????
setlocal enabledelayedexpansion
@REM ???????????
set key="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"

set system-color=color 07
set error-color=color  4E
set end-color=color    2F

if "%1" == "nodistx" (

    title ready

     echo.
     echo   �����������������������������������������������������������ͻ
     echo   � Install new nodist packages {octocat...etc}               �
     echo   �����������������������������������������������������������ͼ
     echo. 
             cd %dst%
             npm install
     echo.
             if !ErrorLevel! == 0 (
     echo    OK
             ) else (
     echo    FAIL
             )

    title Install nodistx

     echo.
     echo   �����������������������������������������������������������ͻ
     echo   � Pack the source nodistx to npm packages                   �
     echo   �����������������������������������������������������������ͼ
     echo. 

             npm pack "file:%cmd:"=%" >nul
     echo.
             if !ErrorLevel! == 0 (
     echo    OK
             ) else (
     echo    FAIL
             )
     echo.
     echo   �����������������������������������������������������������ͻ
     echo   � Install nodistx packages                                  �
     echo   �����������������������������������������������������������ͼ
     echo. 
             npm install %nodistx% --force --global >nul
             where nodistx
     echo.
             if !ErrorLevel! == 0 (
     echo    OK
             ) else (
     echo    FAIL
             )
     echo.
     echo   �����������������������������������������������������������ͻ
     echo   � Let's try                                                 �
     echo   �����������������������������������������������������������ͼ
     echo. 
             nodistx
) else (

    title Install nodist

     echo.
     echo   �����������������������������������������������������������ͻ
     echo   � Debug                                                     �
     echo   �����������������������������������������������������������ͼ
     echo. 

     echo    dst         =%dst%
     echo    loc         =%loc%
     echo    src         =%src%
     echo    bat         =%bat%
     echo    command     =%command%
     echo    installer   =%installer%
     echo    uninstaller =%uninstaller%
     echo    key         =%key%

     echo.
     echo   �����������������������������������������������������������ͻ
     echo   � Run this batch as admin because wait for uninstall        �
     echo   �����������������������������������������������������������ͼ
     echo.
            openfiles >nul 2>&1
            if !ErrorLevel! == 1 (
                @REM run this batch as admin C:\Windows?System32, so pass the working folder as an argument.
                Powershell Start-Process -FilePath "%bat%" -Verb RunAs -ArgumentList "%loc"
                exit
            ) else (
     echo    OK
            )

     echo.
     echo   �����������������������������������������������������������ͻ
     echo   � Let's uninstall the already exists Nodist                 �
     echo   �����������������������������������������������������������ͼ
     echo.
    :cntd
            if exist %uninstaller% (
              set wait=`powershell "(get-process Un_* -ea 0).Count"`
              for /f "usebackq delims=" %%i in (!wait!) do set count=%%i
              if !count! gtr 0 (
     echo    Plaese exit !count! installers, nay key to continue
                pause >nul
goto cntd
              ) else (
                @REM https://stackoverflow.com/questions/31684620/wait-for-uninstaller-to-finish-using-batch
                @REM start /wait uninstall.exe, NSIS takes over the uninstallation to Un_a process,
                @REM so it cannot be monitored and cannot wait
                start "" %uninstaller%
                @REM admin rights just for this one code (wait-process)
                @REM Escaping special characters (!) using the caret character (enabledelayedexpansion)
                powershell "while (^!($proc = (get-process Un_A -ea SilentlyContinue))){ sleep 1 };"^
                           "$handle = $proc.handle; wait-process Un_A;"^
                           "exit $proc.exitcode;"

                if !ErrorLevel! == 0 (
     echo    OK
                  @REM uninstalling doesn't completely delete it
                  @REM so delete it rmdir
                  rmdir /s /q %dst% 2>nul
                ) else (
     echo    FAIL
                )
              )
            ) else (
     echo    Nodist Not installed yet
            )

     echo.
     echo   �����������������������������������������������������������ͻ
     echo   � Let's install Nodist                                      �
     echo   �����������������������������������������������������������ͼ
     echo.
            start /wait "" %installer%

            if !ErrorLevel! == 0 (
              @REM dependencies are disturbing in 2016
              del /q "%dst:"=%package-lock.json"
              @REM update nodist
              xcopy /e /y /q %src% %dst% > nul
              @REM install

     echo    OK
     echo.
     echo   �����������������������������������������������������������ͻ
     echo   � Set GitHub Token                                          �
     echo   �����������������������������������������������������������ͼ
     echo.
              @REM bypass GitHub API rate limit
              start "" "https://github.com/settings/tokens"
              @REM https://stackoverflow.com/questions/51180725/batch-file-choice-indent-prompt
    :loop
              for /f %%a in ('"prompt $H&for %%b in (1) do rem"') do set "BS=%%a"
              set /p "key=X!BS!   NODIST_GITHUB_TOKEN="
              if "%key%" == "" (
goto loop
              )
              @REM remove whitespace of token
              setx NODIST_GITHUB_TOKEN "%key: =%" > nul 2>&1

              @REM install nodistx
              start "" %bat% nodistx
            ) else (
     echo    FAIL
            )
)

