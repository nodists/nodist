@echo off

:: Set up nodist command
copy "%~dp0\bin.cmd" "%npm_config_prefix%\nodist.cmd"

:: copy my node.exe to .nodist\
mkdir "%~dp0\..\..\..\.nodist"
if not exist "%~dp0\..\..\..\.nodist\node.exe" copy "%~dp0\..\..\..\node.exe" "%~dp0\..\..\..\.nodist\node.exe"