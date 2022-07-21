@echo off
@chcp 437
@cls

title Welcome to nodistx!

set dst="%ProgramFiles(x86)%\Nodist\"

@REM TWO ARGS
if "%~3%" == "" (

echo.
echo      ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
echo      บ          Revert to node 11.13.0 and npm 6.9.0             บ
echo      ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
echo.

           nodist global 11.13.0
           nodist npm global 6.9.0

echo.
echo      ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
echo      บ          Download new node and npm                        บ
echo      ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
echo.

           nodist global "%1"
           nodist npm global "%2"

echo.
echo      ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
echo      บ          Revert to node 11.13.0 and npm 6.9.0             บ
echo      ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ
echo.

           nodist global 11.13.0
           nodist npm global 6.9.0

echo.
echo      ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
echo      บ          Install missing packages for new npm             บ
echo      ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ          
echo.

           cd "%dst:"=%npmv\%2"
           npm install

echo.
echo      ษอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออป
echo      บ          Switch to new version                            บ
echo      ศอออออออออออออออออออออออออออออออออออออออออออออออออออออออออออผ   
echo.

           nodist global %1
           nodist npm global %2

)