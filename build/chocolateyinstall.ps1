
$ErrorActionPreference = 'Stop';


$packageName= 'nodist'
$toolsDir   = "$(Split-Path -parent $MyInvocation.MyCommand.Definition)"
$fileLocation = Join-Path $toolsDir 'Installer.exe'

$packageArgs = @{
  packageName   = $packageName
  fileType      = 'exe'
  file         = $fileLocation

  silentArgs   = '/S'

  softwareName  = 'nodist*'
}

Install-ChocolateyInstallPackage @packageArgs


















