param($cmd,$ver,[Switch]$v)
if ($cmd -eq "use" -or $cmd -eq "env") {
  nodist.cmd add $ver
  $env:NODIST_VERSION = $ver
  echo $ver
}
elseif ($v){
  nodist.cmd -v
}
else {
  nodist.cmd $cmd $ver ([string]$args)
}
