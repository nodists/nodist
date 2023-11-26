package main

import (
	"errors"
	"fmt"
	"os"
	"os/exec"

	nodist "github.com/nodists/nodist/internal"
)

func main() {
	err, nodebin, dir, nodeVersion := nodist.DetermineNodeExecutable("node")

	path, npmVersion := nodist.DetermineNpmPath(dir, nodeVersion)

	npxbin := path + "/bin/npx-cli.js"

	if _, err := os.Stat(npxbin); errors.Is(err, os.ErrNotExist) {
		fmt.Println("Npx not found for selected npm version:", npmVersion)
		os.Exit(47)
	}

	args := []string{npxbin}
	args = append(args, os.Args[1:]...)

	// Run npx!
	cmd := exec.Command(nodebin, args...)
	nodist.ExecuteCommand(cmd, err)
}
