@echo off

go build -o "%~dp0\bin\node.exe" "%~dp0\src\shim.go"
:: xcopy "%~dp0\src\shim.exe" "%~dp0\bin.exe" /E /Y