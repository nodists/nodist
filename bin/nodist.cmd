@echo off

:: hook `nodist use <version>`
if "%1"=="use" goto env
if "%1"=="env" goto env
goto next1

:env
  call %0 + %2
  @set "NODIST_VERSION=%2"
  :: goto end
  GOTO end

:main
"%~dp0..\node.exe" "%~dp0..\cli" %*
goto end

:end
