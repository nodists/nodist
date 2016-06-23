#!/bin/sh

nodist() {
    local NODIST_BIN_DIR__
    local ret
    local res
    NODIST_BIN_DIR__=$(echo "$NODIST_PREFIX" | sed -e 's,\\,/,g')/bin
    if [ "$1" = "env" -o "$1" = "use" ]; then
        if [ "$2" = "" ]; then
            echo "Please specify a version to use."
            ret=1
        else
            res=`"$NODIST_BIN_DIR__/nodist" + "$2"`
            ret=$?
            if [ $ret -eq 0 ]; then
                export NODIST_NODE_VERSION=$res
            fi
            echo $res
        fi
    elif [ "$1" = "npm" -a "$2" = "env" ]; then
        if [ "$3" = "" ]; then
            echo "Please specify a version to use."
            ret=1
        else
            res=`"$NODIST_BIN_DIR__/nodist" npm + "$2"`
            ret=$?
            if [ $ret -eq 0 ]; then
                export NODIST_NPM_VERSION=$res
            fi
            echo $res
        fi
    else
        "$NODIST_BIN_DIR__/nodist" "$@"
        ret=$?
    fi
    return $ret
}
