@echo off

:: hook `nodist use <version>`
if "%1"=="use" goto env
if "%1"=="env" goto env
goto next1

:env
  call %0 + %2
  if ERRORLEVEL 0 (
    :: get version and set NODIST_VERSION
    FOR /F "tokens=1 delims=" %%A in ('"%0" add %2') do @set "NODIST_VERSION=%%A"
  )
  :: goto end
  GOTO end

:next1
:: hook `nodist update`
if "%1"=="update" goto selfupdate
if "%1"=="selfupdate" goto selfupdate
goto next2

:selfupdate
  :: rescue our hacked npm.cmd from `npm update`'s fangs
  copy /Y "%~dp0\npm.cmd" "%~dp0\npm.copy.cmd"
  cmd /C npm update npm -g
  del /F "%~dp0\npm.cmd"
  move /Y "%~dp0\npm.copy.cmd" "%~dp0\npm.cmd"

  echo Install dependencies...
  pushd .
  cd /D "%~dp0"
  cd ..
  cmd /C npm update
  popd

  echo Installing latest stable version...
  nodist stable
  ::goto end
   GOTO end

:next2
:main
"%~dp0..\node.exe" "%~dp0..\cli" %*
goto end

:end
