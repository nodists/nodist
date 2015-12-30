package main

import (
  "fmt"
  "os"
  "os/exec"
  "syscall"
  "io/ioutil"
  "path/filepath"
  "strings"
  "sort"
  "encoding/json"
  "github.com/Masterminds/semver"
)

const pathSep = string(os.PathSeparator)

func main() {
  // Prerequisites

  if "" == os.Getenv("NODIST_PREFIX") {
    fmt.Println("Please set the path to the nodist directory in the NODIST_PREFIX environment variable.")
    os.Exit(40)
  }


  // Determine version spec

  var spec string = ""
  if v, err := getTargetEngine(); err == nil && strings.Trim(string(v), " \r\n") != "" {
    spec = v
    //fmt.Println("Target engine found:'", spec, "'")
  } else
  if v := os.Getenv("NODE_VERSION"); v != "" {
    spec = v
    //fmt.Println("NODE_VERSION found:'", spec, "'")
  } else
  if v = os.Getenv("NODIST_VERSION"); v != "" {
    spec = v
    //fmt.Println("NODIST_VERSION found:'", spec, "'")
  } else
  if v, _, err := getLocalVersion(); err == nil && strings.Trim(string(v), " \r\n") != "" {
    spec = string(v)
    //fmt.Println("Local file found:'", spec, "' @ ", localFile)
  } else
  if v, err := ioutil.ReadFile(os.Getenv("NODIST_PREFIX")+"\\.node-version"); err == nil {
    spec = string(v)
    //fmt.Println("Global file found:'", spec, "'")
  }

  spec = strings.Trim(spec, "v \r\n")

  if spec == "" {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't decide which node version to use. Please set a version.")
    os.Exit(41)
  }

  constraint, err := semver.NewConstraint(spec)

  if err != nil {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't decide which node version to use. Malformatted version spec ", spec, " . Please set a new version.")
    os.Exit(43)
  }

  // Find an installed version matching the spec...

  installed, err := getInstalledVersions()

  if err != nil {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't list installed versions.")
    os.Exit(44)
  }

  version := ""

  for _, v := range installed {
    if constraint.Check(v) {
      version = "v"+v.String()
      break
    }
  }

  if version == "" {
    fmt.Println("Sorry, there's a problem with nodist. Couldn't find an installed version that matches version spec ", spec)
    os.Exit(45)
  }

  // Determine architecture

  x64 := false

  if wantX64 := os.Getenv("NODIST_X64"); wantX64 != "" {
    x64 = (wantX64 == "1")
  }


  // Set up binary path

  var path string
  var nodebin string

  path = os.Getenv("NODIST_PREFIX")+"/v"

  if x64 {
    path += "-x64"
  }
  
  path = path+"/"+version
  nodebin = path+"/node.exe"

  // Run node!
  
  cmd := exec.Command(nodebin, os.Args[1:]...)
  cmd.Stdout = os.Stdout
  cmd.Stderr = os.Stderr
  cmd.Stdin = os.Stdin
  err = cmd.Run()
  
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

func getLocalVersion() (version string, file string, error error) {
  dir, err := os.Getwd()

  if err != nil {
    error = err
    return
  }

  dirSlice := strings.Split(dir, pathSep) // D:\Programme\nodist => [D:, Programme, nodist]

  for len(dirSlice) != 1 {
    dir = strings.Join(dirSlice, pathSep)
    file = dir+"\\.node-version"
    v, err := ioutil.ReadFile(file);

    if err == nil {
      version = string(v)
      return
    }

    if !os.IsNotExist(err) {
      error = err // some other error.. bad luck.
      return
    }

    // `$ cd ..`
    dirSlice = dirSlice[:len(dirSlice)-1] // pop the last dir
  }

  version = ""
  return
}

func getInstalledVersions() (versions []*semver.Version, error error) {
  // Determine architecture
  x64 := false
  if wantX64 := os.Getenv("NODIST_X64"); wantX64 != "" {
    x64 = (wantX64 == "1")
  }
  // construct path to version dir
  path := os.Getenv("NODIST_PREFIX")+"/v"
  if x64 {
    path += "-x64"
  }

  dirs, err := ioutil.ReadDir(path)
  if err != nil {
    error = err
    return
  }

  versions = make([]*semver.Version, len(dirs))
  for i, dir := range dirs {
    v, err := semver.NewVersion(dir.Name())
    if err == nil {
      versions[i] = v
    }
  }

  sort.Sort(semver.Collection(versions))

  return
}

func getTargetEngine() (spec string, error error) {
  targetFile := os.Args[1]
  dir := filepath.Dir(targetFile)
  if !filepath.IsAbs(dir) {
    cwd, err := os.Getwd()
    if err != nil {
      error = err
      return
    }
    dir = filepath.Join(cwd, dir)
  }

  //fmt.Println("getTargetEngine: targetDir:", dir)

  dirSlice := strings.Split(dir, pathSep) // D:\Programme\nodist => [D:, Programme, nodist]

  spec = ""

  for len(dirSlice) != 1 {
    dir = strings.Join(dirSlice, pathSep)
    file := dir+"\\package.json"
    rawPackageJSON, err := ioutil.ReadFile(file);
    //fmt.Println("getTargetEngine: ReadFile ", file)
    if err == nil {
      // no error handling for parsing, cause we don't want to use a different package.json if we've already found one
      spec, error = getVerSpecFromPackageJSON(rawPackageJSON)
      return
    }

    if !os.IsNotExist(err) {
      error = err // some other error.. bad luck.
      return
    }

    // `$ cd ..`
    dirSlice = dirSlice[:len(dirSlice)-1] // pop the last dir
  }
  
  return
}

func getVerSpecFromPackageJSON(rawPackageJSON []byte) (spec string, err error) {
  type PackageJSON struct {
    Engines struct {
      Node string
    }
  }
  var packageJSON PackageJSON
  err = json.Unmarshal(rawPackageJSON, &packageJSON)

  if err == nil {
    spec = packageJSON.Engines.Node
    //fmt.Println("getVerSpecFromPackageJSON: %+v", packageJSON)
    return
  }

  //fmt.Println("getVerSpecFromPackageJSON: error:", err.Error())

  // incorrect JSON -- bad luck
  return
}