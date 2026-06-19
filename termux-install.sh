#!/data/data/com.termux/files/usr/bin/bash
set -e

REPO_URL="https://github.com/qishiwan16-hub/floatweixinbot.git"
REPO_DIR="floatweixinbot"
START_DIR="$(pwd -P)"

printf '\n[AI Phone] Termux 一键安装/启动开始\n'

if ! command -v pkg >/dev/null 2>&1; then
  echo "[AI Phone] 未检测到 Termux pkg 命令，请确认在 Termux 中运行。"
  exit 1
fi

echo "[AI Phone] 正在安装必要依赖：git、bash、Node.js..."
pkg update -y
pkg install -y git bash nodejs

if command -v termux-setup-storage >/dev/null 2>&1; then
  termux-setup-storage || true
fi

is_project_dir() {
  [ -f "./termux-start.sh" ] && [ -f "./assistant.mjs" ] && [ -f "./termux-config-server.mjs" ]
}

get_script_dir() {
  local source_path
  source_path="${BASH_SOURCE[0]:-}"

  case "$source_path" in
    ""|"-"|"bash")
      return 1
      ;;
  esac

  if [ -f "$source_path" ]; then
    (cd "$(dirname "$source_path")" 2>/dev/null && pwd -P)
    return 0
  fi

  return 1
}

enter_project_dir() {
  local script_path_dir

  if is_project_dir; then
    echo "[AI Phone] 已在项目目录中运行安装脚本。"
    return 0
  fi

  script_path_dir="$(get_script_dir 2>/dev/null || true)"
  if [ -n "$script_path_dir" ] && [ -d "$script_path_dir" ]; then
    cd "$script_path_dir"
    if is_project_dir; then
      echo "[AI Phone] 已切换到安装脚本所在的项目目录。"
      return 0
    fi
    cd "$START_DIR"
  fi

  echo "[AI Phone] 当前不在项目目录，将自动下载或更新项目。"

  if [ -d "./$REPO_DIR/.git" ]; then
    echo "[AI Phone] 检测到已有 $REPO_DIR 仓库，正在更新..."
    git -C "./$REPO_DIR" remote set-url origin "$REPO_URL" >/dev/null 2>&1 || true
    if ! git -C "./$REPO_DIR" pull --ff-only; then
      echo "[AI Phone] 自动更新失败。请检查网络或本地改动后重试。"
      exit 1
    fi
  elif [ -e "./$REPO_DIR" ]; then
    echo "[AI Phone] 当前目录已存在 $REPO_DIR，但它不是可自动更新的 Git 仓库。"
    echo "[AI Phone] 请手动备份需要的文件后删除该目录，或换到其他目录重新执行一键命令。"
    exit 1
  else
    echo "[AI Phone] 正在从 GitHub 下载项目..."
    git clone "$REPO_URL" "$REPO_DIR"
  fi

  cd "./$REPO_DIR"

  if ! is_project_dir; then
    echo "[AI Phone] 项目文件不完整，未找到启动所需文件。"
    exit 1
  fi
}

enter_project_dir

chmod +x ./termux-start.sh ./termux-install.sh 2>/dev/null || true

printf '\n[AI Phone] 安装完成，即将进入启动流程。\n'
echo "[AI Phone] 接下来会进入 termux-start.sh。"
echo "[AI Phone] 启动前会提醒先去小手机提交远程备份/上传最新微信运行包。"
echo "[AI Phone] 随后可输入 y 打开本地配置页，或输入 n 跳过配置页直接启动助手。"
exec bash ./termux-start.sh
