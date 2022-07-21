@echo off
@chcp 437
@cls

title Welcome to nodistx!

set dst="%ProgramFiles(x86)%\Nodist\"

@REM TWO ARGS
if "%~3%" == "" (

echo.
echo      �����������������������������������������������������������ͻ
echo      �          Revert to node 11.13.0 and npm 6.9.0             �
echo      �����������������������������������������������������������ͼ
echo.

           nodist global 11.13.0
           nodist npm global 6.9.0

echo.
echo      �����������������������������������������������������������ͻ
echo      �          Download new node and npm                        �
echo      �����������������������������������������������������������ͼ
echo.

           nodist global "%1"
           nodist npm global "%2"

echo.
echo      �����������������������������������������������������������ͻ
echo      �          Revert to node 11.13.0 and npm 6.9.0             �
echo      �����������������������������������������������������������ͼ
echo.

           nodist global 11.13.0
           nodist npm global 6.9.0

echo.
echo      �����������������������������������������������������������ͻ
echo      �          Install missing packages for new npm             �
echo      �����������������������������������������������������������ͼ          
echo.

           cd "%dst:"=%npmv\%2"
           npm install

echo.
echo      �����������������������������������������������������������ͻ
echo      �          Switch to new version                            �
echo      �����������������������������������������������������������ͼ   
echo.

           nodist global %1
           nodist npm global %2

)