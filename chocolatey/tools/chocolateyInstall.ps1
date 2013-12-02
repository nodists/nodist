$packageName = 'nodist'
$url = 'https://github.com/marcelklehr/nodist/archive/master.zip'
$unzipPath = $(Split-Path -parent $MyInvocation.MyCommand.Definition)

try {

  Install-ChocolateyZipPackage $packageName $url $unzipPath
  $binPath = (resolve-path (join-path $unzipPath "nodist-master\bin")).ToString()

  "Installing nodist at $binPath" | write-host -fore green

  Install-ChocolateyPath $binPath 'Machine'

  "Running nodist update"
  $validExitCodes = @(0)
  Start-ChocolateyProcessAsAdmin "$(join-path $binPath "nodist.cmd") update" -validExitCodes $validExitCodes

  Write-ChocolateySuccess "$packageName"
} catch {
  Write-ChocolateyFailure "$packageName" "$($_.Exception.Message)"
  throw
}