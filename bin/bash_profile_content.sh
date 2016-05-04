NODIST_BIN_DIR__=$(echo "$NODIST_PREFIX" | sed -e 's,\\,/,g')/bin; if [ -f "$NODIST_BIN_DIR__/nodist.sh" ]; then . "$NODIST_BIN_DIR__/nodist.sh"; fi; unset NODIST_BIN_DIR__;
