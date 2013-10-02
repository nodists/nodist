@echo off

:: hook `nodist use <version>`
if "%1"=="use" (
  call %0 + %2
  if ERRORLEVEL 0 (
    :: get path to version and add it to PATH
    FOR /F "tokens=1 delims=" %%A in ('"%0" path %2') do @set "Path=%%A;%Path%"
  )
  goto end
)

:: hook `nodist update`
if "%1"=="update" (
  :: rescue our hacked npm.cmd from `npm update`'s fangs
  copy /Y "%~dp0\npm.cmd" "%~dp0\npm.copy.cmd"
  cmd /C npm update npm -g
  del /F "%~dp0\npm.cmd"
  move /Y "%~dp0\npm.copy.cmd" "%~dp0\npm.cmd"

  pushd .
  cd /D "%~dp0"
  cd ..
  cmd /C npm update
  popd
)

:main
"%~dp0..\node.exe" "%~dp0..\cli" %*
goto end

:end