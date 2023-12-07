package main

import (
	"os"
	"os/exec"

	nodist "github.com/nodists/nodist/internal"
)

func main() {
	err, nodebin, _, _ := nodist.DetermineNodeExecutable("node")

	// Run node!
	cmd := exec.Command(nodebin, os.Args[1:]...)
	nodist.ExecuteCommand(cmd, err)
}
