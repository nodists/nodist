@echo off

:: hook `nodist use <version>`
if "%1"=="use" (
  %0 + %2
  if ERRORLEVEL 0 (
    :: get path to version and add it to PATH
    FOR /F "tokens=1 delims=" %%A in ('"%0" path %2') do @set Path=%%A;%Path%
  )
  goto end
)

:: hook `nodist update`
if "%1"=="update" (
  pushd .
  cd /D "%~dp0\.."
  npm update
  popd
)

:main
"%~dp0\..\node.exe" "%~dp0\..\cli" %*
goto end

:end