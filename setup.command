#!/bin/bash
cd "$(dirname "$0")" || exit 1
setup_status=1
if ! command -v node >/dev/null 2>&1; then
  echo "Install Node.js 22+ from https://nodejs.org/ / 请先安装 Node.js 22 或更高版本。"
else
  node setup.mjs "$@"
  setup_status=$?
fi
read -r -p "Press Enter to close / 按回车关闭" _
exit "$setup_status"
