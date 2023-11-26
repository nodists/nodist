package main

import (
	"os"
	"os/exec"

	nodist "github.com/nodists/nodist/internal"
)

func main() {
	err, nodebin, dir, nodeVersion := nodist.DetermineNodeExecutable("node")

	path, _ := nodist.DetermineNpmPath(dir, nodeVersion)

	npmbin := path + "/bin/npm-cli.js"

	args := []string{npmbin}
	args = append(args, os.Args[1:]...)

	// Run npm!
	cmd := exec.Command(nodebin, args...)
	nodist.ExecuteCommand(cmd, err)
}
