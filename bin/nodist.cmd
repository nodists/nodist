@echo off

:: hook `nodist use <version>`
if "%1"=="use" goto nodeenv
if "%1"=="env" goto nodeenv
if "%1"=="npm" if "%2"=="env" goto npmenv
goto main

:nodeenv
  call %0 + %2
  @set "NODIST_NODE_VERSION=%2"
  :: goto end
  GOTO end

:npmenv
  call %0 npm + %3
  @set "NODIST_NPM_VERSION=%3"
  GOTO end

:main
"%~dp0..\node.exe" "%~dp0..\cli" %*
goto end

:end
