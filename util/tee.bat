@if(0)==(0) echo off
CScript.exe //NoLogo //E:JScript "%~f0"
goto:eof
@end
while(!WScript.StdIn.atEndOfStream){
  var c=WScript.StdIn.Read(1);
  WScript.StdOut.Write(c);
  WScript.StdErr.Write(c);
}