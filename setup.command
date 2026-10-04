#!/bin/bash
cd "$(dirname "$0")" || exit 1
bash scripts/bootstrap.sh "$@"
setup_status=$?
if [ -t 0 ]; then read -r -p "Press Enter to close / 按回车关闭" _; fi
exit "$setup_status"
