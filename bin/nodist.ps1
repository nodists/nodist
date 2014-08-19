param($cmd,$ver,[Switch]$v)
if ($cmd -eq "use" -or $cmd -eq "env") {
  $version = (nodist.cmd add $ver)
  if($LastExitCode -eq 0) {
    $env:NODIST_VERSION = $version
    echo $env:NODIST_VERSION
  }
}
elseif ($v){
  nodist.cmd -v
}
else {
  nodist.cmd $cmd $ver ([string]$args)
}