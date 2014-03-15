param($cmd,$ver,[Switch]$v)
if ($cmd -eq "use") {
  $env:path = (nodist.cmd path $ver)+";"+$env:path
  nodist.cmd + $ver
}
elseif ($v){
  nodist.cmd -v
}
else {
  nodist.cmd $cmd $ver ([string]$args)
}