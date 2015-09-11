#!/bin/bash

unixPathToDosPath() {
    # http://stackoverflow.com/a/13701495/245966
    echo "$@" | sed 's/^\///' | sed 's/\//\\/g' | sed 's/^./\0:/'
}

echo -e "\nWelcome to nodist.\n"

echo "This script will:"
echo "- update dependencies of nodist,"
echo "- install recent version of node,"
echo "- install recent version of npm,"
echo "- and update environment settings."

echo -e "\nDepending on your internet speed, it will take 1-3 minutes to complete.\n"

echo "************************************************************************************"

# updating env variables

_CURRENT_DIRECTORY=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
echo -e "\n==> Updating environment variable: NODIST_PREFIX\n"
if [ -z "${NODIST_PREFIX}" ] ; then
	# update temporarily in the local env
	NODIST_PREFIX="${_CURRENT_DIRECTORY}"

	which setx >/dev/null
	if [ "$?" == "0" ] ; then
		# since setx available, update permanently
		setx NODIST_PREFIX "${NODIST_PREFIX}"
	else
		_NODIST_PREFIX_DOS=$(unixPathToDosPath "${NODIST_PREFIX}")
		echo "It seems you use an old version of Windows (no SETX)."
		echo "Please set the following env variable"
		echo
		echo "    set NODIST_PREFIX=${_NODIST_PREFIX_DOS}"
		echo
		echo "Then restart the shell and re-run this installation script."
		exit
	fi
else
    echo "Already set to ${NODIST_PREFIX}"
fi

# We need NODIST_PREFIX and PATH exported in the current shell to continue
# We update PATH temporarily, we'll ask user at the end to do it permanently
export NODIST_PREFIX="${_CURRENT_DIRECTORY}"
_NODIST_BIN_PATH="${NODIST_PREFIX}/bin"
export PATH="${_NODIST_BIN_PATH}:$PATH"
	
# copy pre-committed node_modules and and npm to make them available
echo -e "\n==> Copying temporary dependencies and npm to get started..."

# remove the file with current node version from previous installations
rm -f .node-version

# idempotent copy of a folder; see http://unix.stackexchange.com/q/228597/
shopt -s dotglob
mkdir -p node_modules
cp -R .node_modules/* node_modules
mkdir -p bin/node_modules
cp -R bin/.node_modules/* bin/node_modules

# update dependencies
echo -e "\n==> Installing node 0.12...\n"
nodist 0.12

echo -e "\n==> Updating dependencies...\n"
cmd //C nodist selfupdate

echo -e "\n==> Updating environment: npm prefix"
npm config set prefix "${_NODIST_BIN_PATH}"

# update npm; it's more reliable when we launch it via `cmd`
echo -e "\n==> Updating npm\n"
echo 'If you abort or something breaks here, do "git reset --hard" and restart the installation'
cmd //C npm install -g npm

# Appending to PATH is troublesome, let the user do it
echo -e "\n==> Finishing the installation"

echo -e "\nInstalled node version:"
(cd ~ && node -v) # trick needed since there's an old node.exe in nodist dir itself!

echo -e "\nInstalled npm version:"
npm -v

echo -e "\n******************************************************************************"

echo -e "\nTo finish the installation, please add the following to your PATH and restart the console:"
echo $(unixPathToDosPath "${_NODIST_BIN_PATH}")
echo -e '\nThis is needed for Windows to see "node", "npm" and "nodist" commands.'
