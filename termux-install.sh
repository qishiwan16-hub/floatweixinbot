#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$(dirname "$0")"

printf '\n[AI Phone] Termux 一键安装开始\n'

if ! command -v pkg >/dev/null 2>&1; then
  echo "[AI Phone] 未检测到 Termux pkg 命令，请确认在 Termux 中运行。"
  exit 1
fi

pkg update -y
pkg install -y nodejs

if command -v termux-setup-storage >/dev/null 2>&1; then
  termux-setup-storage || true
fi

chmod +x ./termux-start.sh ./termux-install.sh 2>/dev/null || true

printf '\n[AI Phone] 安装完成\n'
echo "[AI Phone] 下一步运行：./termux-start.sh"
echo "[AI Phone] 配置页地址：http://127.0.0.1:8787"
