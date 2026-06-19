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

CONFIG_PID=""

printf '\n[AI Phone] 启动前提醒：请先去小手机提交远程备份/上传最新微信运行包，确认远端已是最新微信运行包后，再继续启动。\n'
printf '[AI Phone] 完成小手机远程备份/上传后，按回车继续选择启动方式：'
read -r _

while true; do
  printf '\n[AI Phone] 是否打开本地配置页？输入 y 打开配置页，输入 n 跳过配置页并直接启动助手 [y/n]: '
  read -r OPEN_CONFIG_PAGE

  case "$OPEN_CONFIG_PAGE" in
    y|Y)
      node ./termux-config-server.mjs &
      CONFIG_PID=$!

      sleep 1
      printf '\n[AI Phone] 本地配置页已启动：http://127.0.0.1:8787\n'
      echo "[AI Phone] 请在手机浏览器打开上面的地址，填写或更换 Supabase URL 和 service_role key。"
      echo "[AI Phone] 保存配置后，请回到 Termux。"
      printf '[AI Phone] 保存完成并回到 Termux 后，按回车继续启动助手：'
      read -r _

      if [ ! -s ./config.txt ]; then
        printf '\n[AI Phone] 尚未检测到 config.txt。若刚保存失败，请在配置页重新保存。\n'
        printf '[AI Phone] 确认已保存 config.txt 后按回车继续检查；如不想继续，可按 Ctrl+C 停止：'
        read -r _
      fi

      if [ ! -s ./config.txt ]; then
        echo "[AI Phone] 仍未检测到 config.txt，已停止。"
        exit 1
      fi
      break
      ;;
    n|N)
      echo "[AI Phone] 已选择不打开配置页，将直接启动助手。"
      if [ ! -s ./config.txt ]; then
        echo "[AI Phone] 提醒：当前未检测到 config.txt；如果尚未完成配置，助手可能会启动失败。"
      fi
      break
      ;;
    *)
      echo "[AI Phone] 输入无效，请输入 y 或 n。"
      ;;
  esac
done

printf '\n[AI Phone] 正在启动微信本地助手...\n'
node ./assistant.mjs
