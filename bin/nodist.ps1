param($cmd,$ver)
if ($cmd -eq "use") {
  $env:path = (nodist.cmd path $ver)+";"+$env:path
  nodist.cmd + $ver
}
else {
  nodist.cmd $cmd $ver ([string]$args)
}