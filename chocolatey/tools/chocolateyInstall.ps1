$packageName = 'nodist'
$url = 'https://github.com/marcelklehr/nodist/archive/master.zip'
$unzipPath = $(Split-Path -parent $MyInvocation.MyCommand.Definition)

try {

  Install-ChocolateyZipPackage $packageName $url $unzipPath
  $binPath = (resolve-path (join-path $unzipPath "nodist-master\bin")).ToString()

  "Installing nodist at $binPath" | write-host -fore green

  $currentPathVar = [Environment]::GetEnvironmentVariable("Path", [System.EnvironmentVariableTarget]::Machine);
  $newPathVar = "$binPath;$currentPathVar"

  "Setting machine path to $newPathVar" | write-host -fore green
  [Environment]::SetEnvironmentVariable( "Path", $newPathVar, [System.EnvironmentVariableTarget]::Machine )

  "Running nodist update"
  $validExitCodes = @(0)
  Start-ChocolateyProcessAsAdmin  "$(join-path $binPath "nodist.cmd") update" -validExitCodes $validExitCodes

  Write-ChocolateySuccess "$packageName"
} catch {
  Write-ChocolateyFailure "$packageName" "$($_.Exception.Message)"
  throw 
}