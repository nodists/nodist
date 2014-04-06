package main

import (
  "fmt"
  "os"
  "os/exec"
  "syscall"
  "io/ioutil"
  "strings"
)

func main() {
  var (
    version string = ""
    x64 = false
    path string
    nodebin string
  )
  
  // Determine version
  
  if v := os.Getenv("NODE_VERSION"); v != "" {
    version = v
  } else
  if v = os.Getenv("NODIST_VERSION"); v != "" {
    version = v
  } else 
  if v, err := ioutil.ReadFile("./.node-version"); err == nil {
    version = string(v)
  } else
  if v, err := ioutil.ReadFile(os.Getenv("NODIST_PREFIX")+"/.node-version"); err == nil {
    version = string(v)
  }
  
  
  // Determine architecture
  
  // XXX: coud also use this: http://msdn.microsoft.com/en-us/library/windows/desktop/ms724958%28v=vs.85%29.aspx
  if arch := os.Getenv("PROCESSOR_ARCHITECTURE"); arch != "" {
    x64 = (arch == "x64")
  }
  if wantX64 := os.Getenv("NODIST_X64"); wantX64 != "" {
    x64 = (wantX64 == "1")
  }
  
  
  // Set up binary path
  
  if "" == os.Getenv("NODIST_PREFIX") {
    fmt.Println("Please set the path to the nodist directory in the NODIST_PREFIX environment variable.")
    os.Exit(40)
  }
  
  if x64 {
    path = os.Getenv("NODIST_PREFIX")+"/v-x64"
  } else {
    path = os.Getenv("NODIST_PREFIX")+"/v"
  }
  
  version = strings.Trim(version, " \r\n")
  
  if version != "" {
    nodebin = path+"/"+version+"/node.exe"
  }else {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't decide which node version to use. Please set a version.")
    os.Exit(41)
  }
  
  cmd := exec.Command(nodebin, os.Args[1:]...)
  cmd.Stdout = os.Stdout
  cmd.Stderr = os.Stderr
  cmd.Stdin = os.Stdin
  err := cmd.Run()
  
  if err != nil {
    exitError, isExitError := err.(*(exec.ExitError))
    if isExitError {
      // You know it. Black Magic...
      os.Exit(exitError.Sys().(syscall.WaitStatus).ExitStatus())
    } else {
      fmt.Println("Sorry, there's a problem with nodist.")
      fmt.Println("Error: ", err)
      os.Exit(42)
    }
  }
}