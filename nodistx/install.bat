@echo off
@chcp 437
@cls

title Welcome to nodistx!

set dst="%ProgramFiles(x86)%\Nodist\"

@REM TWO ARGS
if "%~3%" == "" (

echo.
echo      浜様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�
echo      �          Revert to node 11.13.0 and npm 6.9.0             �
echo      藩様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�
echo.

           nodist global 11.13.0
           nodist npm global 6.9.0

echo.
echo      浜様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�
echo      �          Download new node and npm                        �
echo      藩様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�
echo.

           nodist global "%1"
           nodist npm global "%2"

echo.
echo      浜様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�
echo      �          Revert to node 11.13.0 and npm 6.9.0             �
echo      藩様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�
echo.

           nodist global 11.13.0
           nodist npm global 6.9.0

echo.
echo      浜様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�
echo      �          Install missing packages for new npm             �
echo      藩様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�          
echo.

           cd "%dst:"=%npmv\%2"
           npm install

echo.
echo      浜様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�
echo      �          Switch to new version                            �
echo      藩様様様様様様様様様様様様様様様様様様様様様様様様様様様様様�   
echo.

           nodist global %1
           nodist npm global %2

)