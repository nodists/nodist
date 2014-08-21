@IF EXIST "%~dp0\node.exe" (
  "%~dp0\node.exe"  "%~dp0\node_modules\npm\bin\npm-cli.js" %*
) ELSE (
  node  "%~dp0\node_modules\npm\bin\npm-cli.js" %*
)