package main

import (
  "fmt"
  "os"
  "path/filepath"
  "os/exec"
  "os/signal"
  "syscall"
  "./lib/nodist"
)

import . "github.com/computes/go-debug"

var debug = Debug("nodist:shim-node")

func main() {
  if "" == os.Getenv("NODIST_PREFIX") {
    fmt.Println("Please set the path to the nodist directory in the NODIST_PREFIX environment variable.")
    os.Exit(40)
  }

  dir, err := getTargetDirectory()

  if err != nil {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't determine the target directory. Please report this.")
    os.Exit(46)
  }

  debug("current target directory: %s", dir)

  // Determine version spec
  spec := nodist.GetCurrentNodeVersionSpec(dir)

  if spec == "" {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't decide which node version to use. Please set a version.")
    os.Exit(41)
  }

  debug("Current version spec: %s", spec)

  version, err := nodist.ResolveNodeVersion(spec)

  if err != nil {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't resolve version spec %s: %s", spec, err.Error())
    os.Exit(44)
  }

  debug("found matching version: %s", version)

  // Determine architecture

  x64 := false

  if wantX64 := os.Getenv("NODIST_X64"); wantX64 != "" {
    x64 = (wantX64 == "1")
  }
  debug("Determined architecture: x64:%s", x64)

  // Set up binary path

  var path string
  var nodebin string

  path = os.Getenv("NODIST_PREFIX")+"/v"

  if x64 {
    path += "-x64"
  }

  path = path+"/"+version
  nodebin = path+"/node.exe"
  debug("Going to execute the following binary: %s", nodebin)

  // Run node!

  cmd := exec.Command(nodebin, os.Args[1:]...)

  // Proxy stdio
  cmd.Stdout = os.Stdout
  cmd.Stderr = os.Stderr
  cmd.Stdin = os.Stdin
  // Set npm prefix correctly. Can't do this in installer, since npm doesn't know where to look (it looks at /v/x.x.x/ by default, so we'd have to put an npmrc in every version folder, which is overkill)
  cmd.Env = append(os.Environ(), "npm_config_prefix="+os.Getenv("NODIST_PREFIX")+"/bin")

  // Proxy signals
  sigc := make(chan os.Signal, 1)
  signal.Notify(sigc)
  go func() {
    for s := range sigc {
      cmd.Process.Signal(s)
    }
  }()

  err = cmd.Run()
  signal.Stop(sigc)

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

func getTargetDirectory() (dir string, err error) {
  if len(os.Args) < 2 {
    dir, err = os.Getwd()
    if err != nil {
      return
    }
    return
  }else{
    targetFile := os.Args[1]
    dir = filepath.Dir(targetFile)

    if filepath.IsAbs(dir) {
      return
    }

    var cwd string
    cwd, err = os.Getwd()
    if err != nil {
      return
    }
    dir = filepath.Join(cwd, dir)
    return
  }
}
