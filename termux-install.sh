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

printf '\n[AI Phone] 安装完成，即将进入启动流程。\n'
echo "[AI Phone] 接下来会进入 termux-start.sh。"
echo "[AI Phone] 启动前会提醒先去小手机提交远程备份/上传最新微信运行包。"
echo "[AI Phone] 随后可输入 y 打开本地配置页，或输入 n 跳过配置页直接启动助手。"
exec ./termux-start.sh
