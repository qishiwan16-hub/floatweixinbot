#!/data/data/com.termux/files/usr/bin/bash

set -u

printf '\n[AI Phone] Termux 单次测试/连接排查\n\n'

if [ ! -f "./assistant.mjs" ]; then
  echo "[AI Phone] 当前目录没有 assistant.mjs。"
  echo "[AI Phone] 请先进入项目目录，例如：cd floatweixinbot"
  echo "[AI Phone] 然后再运行：bash termux-test-once.sh"
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "[AI Phone] 未检测到 Node.js。"
  echo "[AI Phone] 请先在项目目录运行：bash termux-install.sh"
  echo "[AI Phone] 或手动安装 Node.js：pkg install -y nodejs"
  exit 1
fi

NODE_VERSION="$(node -v 2>/dev/null || true)"
echo "[AI Phone] 已检测到 Node.js：${NODE_VERSION:-unknown}"

if [ ! -s "./config.txt" ]; then
  echo "[AI Phone] 未检测到可用的 config.txt。"
  echo "[AI Phone] 请先运行：bash termux-start.sh"
  echo "[AI Phone] 当脚本询问是否打开本地配置页时，输入 y。"
  echo "[AI Phone] 在网页里填写自己的 Supabase URL 和 service_role key，然后保存配置。"
  exit 1
fi

printf '\n[AI Phone] 开始测试前，请先去小手机提交远程备份/上传最新微信运行包。\n'
echo "[AI Phone] 这样才能检查远端 weixin-cloud/index.json、运行包、微信 token 是否是最新状态。"
if [ -t 0 ]; then
  printf "[AI Phone] 完成远程备份/上传后，按回车开始单次测试："
  read -r _
fi

printf '\n[AI Phone] 正在执行：node assistant.mjs --once\n'
echo "[AI Phone] 这个测试只运行一次，用来观察 Supabase、远程包和微信连接日志。"
printf '\n'

node ./assistant.mjs --once
STATUS=$?

printf '\n'
if [ "$STATUS" -eq 0 ]; then
  echo "[AI Phone] 单次测试命令已结束，退出码：0。"
else
  echo "[AI Phone] 单次测试命令已结束，退出码：$STATUS。"
fi

cat <<'EOF'
[AI Phone] 看日志时重点排查：
1. 如果提示缺少配置/配置格式不正确：重新运行 bash termux-start.sh，输入 y 打开配置页并保存配置。
2. 如果提示 Supabase GET/LIST/PUT 失败：检查 Supabase URL、service_role key、默认 Bucket ai-phone-backup 是否正确。
3. 如果提示 object_not_found:weixin-cloud/index.json 或轮询 0 个 Bot：先让小手机提交远程备份/上传最新微信运行包。
4. 如果提示 Token 已过期或微信接口失败：回小手机重新扫码/刷新 token，再重新远程备份。
5. 如果运行包缺少提示词/API 配置：在小手机确认角色、预设、API 配置后，重新同步运行包。
EOF

exit "$STATUS"
