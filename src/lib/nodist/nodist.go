package nodist

import (
  "errors"
  "os"
  "io/ioutil"
  "strings"
  "sort"
  "encoding/json"
  "github.com/marcelklehr/semver"
)

import . "github.com/computes/go-debug"

var debug = Debug("nodist:shim")
const pathSep = string(os.PathSeparator)

func GetCurrentNodeVersionSpec(currentDir string) (spec string) {
  // Determine version spec
  var v string
  clever := os.Getenv("NODIST_INSPECT_PACKAGEJSON"); 
  if v = os.Getenv("NODE_VERSION"); v != "" {
    spec = v
    debug("NODE_VERSION found:'%s'", spec)
  } else
  if v = os.Getenv("NODIST_NODE_VERSION"); v != "" {
    spec = v
    debug("NODIST_NODE_VERSION found:'%s'", spec)
  } else
  if v, err := getLocalEngineNode(currentDir); clever != "" && err == nil && strings.Trim(string(v), " \r\n") != "" {
    spec = v
    debug("Target engine found:'%s'", spec)
  } else
  if v, localFile, err := getLocalNodeVersion(currentDir); err == nil && strings.Trim(string(v), " \r\n") != "" {
    spec = string(v)
    debug("Local file found:'%s' @ %s", spec, localFile)
  } else
  if v, err := ioutil.ReadFile(os.Getenv("NODIST_PREFIX")+"\\.node-version-global"); err == nil {
    spec = string(v)
    debug("Global file found: '%s'", spec)
  }

  spec = strings.Trim(spec, "v \r\n")
  return
}

func GetCurrentNpmVersionSpec(currentDir string) (spec string) {
  // Determine version spec
  var v string
  clever := os.Getenv("NODIST_INSPECT_PACKAGEJSON"); 
  if v = os.Getenv("NODIST_NPM_VERSION"); v != "" {
    spec = v
    debug("NODIST_NPM_VERSION found:'%s'", spec)
  } else
  if v, err := getLocalEngineNpm(currentDir); clever != "" && err == nil && strings.Trim(string(v), " \r\n") != "" {
    spec = v
    debug("Target engine npm spec found:'%s'", spec)
  } else
  if v, localFile, err := getLocalNpmVersion(currentDir); err == nil && strings.Trim(string(v), " \r\n") != "" {
    spec = string(v)
    debug("Local file with npm spec found:'%s' @ %s", spec, localFile)
  } else
  if v, err := ioutil.ReadFile(os.Getenv("NODIST_PREFIX")+"\\.npm-version-global"); err == nil {
    spec = string(v)
    debug("Global file found: '%s'", spec)
  }

  spec = strings.Trim(spec, "v \r\n")
  return
}

func ResolveNodeVersion(spec string) (version string, err error){
  // Find an installed version matching the spec...

  installed, err := GetInstalledNodeVersions()

  if err != nil {
    return
  }

  version, err = resolveVersion(spec, installed)
  return
}

func GetInstalledNodeVersions() (versions []*semver.Version, err error) {
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
  versions, err = getInstalledVersions(path)
  return
}

func ResolveNpmVersion(spec string, nodeVersion string) (version string, err error){
  // Find an installed version matching the spec...

  installed, err := GetInstalledNpmVersions()

  if err != nil {
    return
  }

  if spec == "match" {
    spec, err = getMatchingNpmVersion(nodeVersion)
    if err != nil {
      return
    }
    // we feed this result to resolveVersion, too, because we need
    // to see if it is actually installed
  }

  version, err = resolveVersion(spec, installed)
  return
}

func resolveVersion(spec string, installed []*semver.Version) (version string, err error) {
  var constraint *semver.Constraints

  if spec != "latest" {
    constraint, err = semver.NewConstraint(spec)

    if err != nil {
      return
    }
  }

  if spec == "latest" {
    version = installed[len(installed)-1].String()
  }else{
    for _, v := range installed {
      debug("checking %s against %s", v.String(), spec)
      if constraint.Check(v) {
	version = v.String()
	break
      }
    }
  }

  if version == "" {
    err = errors.New("Couldn't find any matching version")
  }
  return
}

type Version struct {
  Version string
  Npm string
}

func getMatchingNpmVersion(nodeVersion string) (version string, err error) {
  file := os.Getenv("NODIST_PREFIX")+pathSep+"versions.json"
  rawJSON, err := ioutil.ReadFile(file)
  if err != nil {
    return
  }
  var versions []Version
  err = json.Unmarshal(rawJSON, &versions)
  if err != nil {
    return
  }
  for i:=0; i < len(versions); i++ {
    if versions[i].Version[1:] != nodeVersion {
      continue
    }
    version = versions[i].Npm
    return
  }
  err = errors.New("No npm version found that matches node version "+nodeVersion)
  return
}

func GetInstalledNpmVersions() (versions []*semver.Version, err error) {
  // construct path to version dir
  path := os.Getenv("NODIST_PREFIX")+"/npmv"
  versions, err = getInstalledVersions(path)
  return
}

func getInstalledVersions(path string) (versions []*semver.Version, err error) {
  entries, err := ioutil.ReadDir(path)
  if err != nil {
    return
  }

  versions = make([]*semver.Version, 0)
  for _, entry := range entries {
    if !entry.IsDir() {
      continue
    }
    v, err := semver.NewVersion(entry.Name())
    if err == nil {
      versions = append(versions, v)
    }
  }

  sort.Sort(sort.Reverse(semver.Collection(versions)))

  return
}

func getLocalNodeVersion(dir string) (version string, file string, err error) {
  version, file, err = getLocalVersion(dir, ".node-version")
  return
}

func getLocalNpmVersion(dir string) (version string, file string, err error) {
  version, file, err = getLocalVersion(dir, ".npm-version")
  return
}

func getLocalVersion(dir string, filename string) (version string, file string, returnedError error) {
  dirSlice := strings.Split(dir, pathSep) // D:\Programme\nodist => [D:, Programme, nodist]

  for len(dirSlice) != 1 {
    dir = strings.Join(dirSlice, pathSep)
    file = dir+pathSep+filename
    v, err := ioutil.ReadFile(file);

    if err == nil {
      version = string(v)
      return
    }

    if !os.IsNotExist(err) {
      returnedError = err // some other error.. bad luck.
      return
    }

    // `$ cd ..`
    dirSlice = dirSlice[:len(dirSlice)-1] // pop the last dir
  }

  version = ""
  return
}

func getLocalEngineNode(dir string) (spec string, err error) {
  packageJSON, err := getLocalPackageJSON(dir)
  if err != nil {
    return
  }
  spec = packageJSON.Engines.Node
  return
}

func getLocalEngineNpm(dir string) (spec string, err error) {
  packageJSON, err := getLocalPackageJSON(dir)
  if err != nil {
    return
  }
  spec = packageJSON.Engines.Npm
  return
}

func getLocalPackageJSON(dir string) (packageJSON PackageJSON, returnedError error) {
  debug("getTargetEngine: targetDir: %s", dir)

  dirSlice := strings.Split(dir, pathSep) // D:\Programme\nodist => [D:, Programme, nodist]

  for len(dirSlice) != 1 {
    dir = strings.Join(dirSlice, pathSep)
    file := dir+"\\package.json"
    rawPackageJSON, err := ioutil.ReadFile(file);
    debug("getTargetEngine: ReadFile %s", file)
    if err == nil {
      // no error handling for parsing, cause we don't want to use a different package.json if we've already found one
      packageJSON, returnedError = parsePackageJSON(rawPackageJSON)
      return
    }

    if !os.IsNotExist(err) {
      returnedError = err // some other error.. bad luck.
      return
    }

    // `$ cd ..`
    dirSlice = dirSlice[:len(dirSlice)-1] // pop the last dir
  }

  return
}

type PackageJSON struct {
  Engines struct {
    Npm string
    Node string
  }
}

func parsePackageJSON(rawPackageJSON []byte) (packageJSON PackageJSON, err error) {
  err = json.Unmarshal(rawPackageJSON, &packageJSON)

  if err == nil {
    debug("parsePackageJSON: %+v", packageJSON)
    return
  }

  debug("parsePackageJSON: error: %s", err.Error())

  // incorrect JSON -- bad luck
  return
}
