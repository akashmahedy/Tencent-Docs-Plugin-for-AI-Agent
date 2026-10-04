#!/bin/bash
set -euo pipefail
root=$(cd "$(dirname "$0")/.." && pwd)
usable_node() { "$1" -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)' >/dev/null 2>&1; }
if [ "${TENCENT_DOCS_FORCE_PORTABLE_NODE:-0}" != 1 ] && command -v node >/dev/null 2>&1 && usable_node "$(command -v node)"; then
  exec "$(command -v node)" "$root/setup.mjs" "$@"
fi
case "$(uname -s)" in
  Darwin) platform=darwin; runtime_base="${HOME}/Library/Application Support/akashmahedy/tencent-docs/runtime" ;;
  Linux) platform=linux; runtime_base="${XDG_DATA_HOME:-${HOME}/.local/share}/akashmahedy/tencent-docs/runtime" ;;
  *) echo 'Unsupported OS / 不支持此系统' >&2; exit 1 ;;
esac
case "$(uname -m)" in
  arm64|aarch64) arch=arm64 ;;
  x86_64|amd64) arch=x64 ;;
  *) echo 'A 64-bit Intel/AMD or ARM computer is required / 需要 64 位 Intel/AMD 或 ARM 电脑' >&2; exit 1 ;;
esac
IFS= read -r version < "$root/scripts/node-runtime.txt"
asset="node-${version}-${platform}-${arch}.tar.gz"
expected=$(awk -v file="$asset" '$2 == file {print $1}' "$root/scripts/node-runtime.txt")
[ "${#expected}" = 64 ] || { echo 'Missing Node checksum / 缺少 Node 校验值' >&2; exit 1; }
runtime_base="${TENCENT_DOCS_RUNTIME_DIR:-$runtime_base}"
runtime="$runtime_base/node-${version}-${platform}-${arch}"
node_binary="$runtime/bin/node"
if [ ! -x "$node_binary" ] || ! usable_node "$node_binary"; then
  echo 'Preparing Node.js automatically / 正在自动准备 Node.js…' >&2
  umask 077
  mkdir -p "$runtime_base"
  stage=$(mktemp -d "$runtime_base/.download.XXXXXX")
  trap 'rm -rf "$stage"' EXIT
  curl --fail --location --silent --show-error --proto '=https' --proto-redir '=https' --connect-timeout 20 --max-time 300 "https://nodejs.org/download/release/$version/$asset" -o "$stage/node.tar.gz"
  if command -v shasum >/dev/null 2>&1; then actual=$(shasum -a 256 "$stage/node.tar.gz" | awk '{print $1}');
  else actual=$(sha256sum "$stage/node.tar.gz" | awk '{print $1}'); fi
  [ "$actual" = "$expected" ] || { echo 'Node checksum failed; nothing was run / Node 校验失败，未运行下载内容' >&2; exit 1; }
  tar -xzf "$stage/node.tar.gz" -C "$stage"
  usable_node "$stage/node-${version}-${platform}-${arch}/bin/node" || { echo 'Downloaded Node cannot run on this OS / 下载的 Node 无法在此系统运行' >&2; exit 1; }
  # Rename only this version's runtime; unrelated runtimes and user files stay in place.
  if [ -e "$runtime" ]; then mv "$runtime" "$stage/previous-runtime"; fi
  mv "$stage/node-${version}-${platform}-${arch}" "$runtime"
  rm -rf "$stage"
  trap - EXIT
fi
exec "$node_binary" "$root/setup.mjs" "$@"
