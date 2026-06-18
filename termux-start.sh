#!/data/data/com.termux/files/usr/bin/bash
set -e

cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "[AI Phone] 未检测到 Node.js，正在尝试安装..."
  if command -v pkg >/dev/null 2>&1; then
    pkg update -y
    pkg install -y nodejs
  else
    echo "[AI Phone] 无法自动安装 Node.js，请先安装 Node.js 20+。"
    exit 1
  fi
fi

cleanup() {
  if [ -n "${CONFIG_PID:-}" ]; then
    kill "$CONFIG_PID" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT INT TERM

node ./termux-config-server.mjs &
CONFIG_PID=$!

sleep 1
printf '\n[AI Phone] 配置页已启动：http://127.0.0.1:8787\n'
echo "[AI Phone] 请用手机浏览器打开上面的地址，输入 Supabase URL 和 service_role key。"

if [ ! -s ./config.txt ]; then
  printf '\n[AI Phone] 尚未检测到 config.txt。请先在网页保存配置。\n'
  echo "[AI Phone] 保存后回到这里按回车继续启动助手。"
  read -r _
fi

if [ ! -s ./config.txt ]; then
  echo "[AI Phone] 仍未检测到 config.txt，已停止。"
  exit 1
fi

printf '\n[AI Phone] 正在启动微信本地助手...\n'
node ./assistant.mjs
