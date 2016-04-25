param($cmd,$ver,[Switch]$v)
if ($cmd -eq "use" -or $cmd -eq "env") {
  nodist.cmd add $ver
  $env:NODIST_NODE_VERSION = $ver
  echo $ver
}
elseif ($cmd -eq "npm" -and $ver -eq "env") {
  nodist.cmd npm add $args[0]
  $env:NODIST_NPM_VERSION = $args[0]
  echo $args[0]
}
elseif ($v){
  nodist.cmd -v
}
else {
  nodist.cmd $cmd $ver ([string]$args)
}
