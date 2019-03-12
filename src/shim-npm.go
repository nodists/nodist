package main

import (
  "fmt"
  "os"
  "os/exec"
  "os/signal"
  "syscall"
  "./lib/nodist"
)

import . "github.com/computes/go-debug"

var debug = Debug("nodist:shim-npm")

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

  // Determine node version first

  spec := nodist.GetCurrentNodeVersionSpec(dir)

  if spec == "" {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't decide which node version to use. Please set a version.")
    os.Exit(41)
  }

  version, err := nodist.ResolveNodeVersion(spec)

  if err != nil {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't resolve node version spec %s: %s", spec, err.Error())
    os.Exit(44)
  }

  if version == "" {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't find an installed node version that matches version spec ", spec)
    os.Exit(45)
  }

  debug("determined node version: %s", version)

  // Determine npm version

  npmSpec := nodist.GetCurrentNpmVersionSpec(dir)
  debug("current npm version spec: %s", npmSpec)

  if npmSpec == "" {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't decide which npm version to use. Please set a version.")
    os.Exit(41)
  }

  npmVersion, err := nodist.ResolveNpmVersion(npmSpec, version)

  if err != nil {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't resolve npm version spec", npmSpec, ":", err.Error())
    os.Exit(44)
  }

  debug("determined npm version: %s", npmVersion)

  // Set up binary path

  path := os.Getenv("NODIST_PREFIX")+"/npmv"

  path = path+"/"+npmVersion
  npmbin := path+"/bin/npm-cli.js"

  args := []string{npmbin}
  args = append(args, os.Args[1:]...)

  // Run npm!

  cmd := exec.Command("node", args...)
  cmd.Stdout = os.Stdout
  cmd.Stderr = os.Stderr
  cmd.Stdin = os.Stdin
  cmd.Env = os.Environ()
  cmd.Env = append(cmd.Env, "NODIST_NODE_VERSION="+version)// Lock the node version for all child processes
  // Set npm prefix correctly. Can't do this in installer, since npm doesn't know where to look (it looks at /v/x.x.x/ by default, so we'd have to put an npmrc in every version folder, which is overkill)
  cmd.Env = append(cmd.Env, "npm_config_prefix="+os.Getenv("NODIST_PREFIX")+"/bin")


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

func getTargetDirectory() (dir string, returnedError error) {
  dir, returnedError = os.Getwd()
  return
}
