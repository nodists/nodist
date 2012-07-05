@echo off

:: hook `nodist use <version>`
if "%1"=="use" (
  "%~dp0\nodist.cmd" + %2
  if ERRORLEVEL 0 (
    FOR /F "tokens=1 delims=" %%A in ('"%~dp0\nodist.cmd" path %2') do @set Path=%%A;%Path%
  )
  goto end
)

:main
"%~dp0\.nodist\node.exe" "%~dp0\.\node_modules\nodist\cli" %*
goto end

:end