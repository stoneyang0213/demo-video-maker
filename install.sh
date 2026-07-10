#!/usr/bin/env sh
# demo-video-maker · 一键安装器 (Claude Code / OpenClaw / Hermes / 任意 Agent-Skills 框架)
# 用法:
#   curl -fsSL https://raw.githubusercontent.com/stoneyang0213/demo-video-maker/main/install.sh | sh
#   或 clone 后:  sh install.sh [--target claude|--dir <skills目录>]
#
# 原理:本项目是标准 Agent Skill(一个含 SKILL.md 的文件夹)。安装 = 把它放进你 agent 的 skills 目录。
#       各框架机制相同,只是 skills 目录不同(见 INSTALL.md)。

set -e
REPO="https://github.com/stoneyang0213/demo-video-maker.git"
NAME="demo-video-maker"

# ---- 解析目标 skills 目录 ----
SKILLS_DIR=""
while [ $# -gt 0 ]; do
  case "$1" in
    --dir) SKILLS_DIR="$2"; shift 2 ;;
    --target)
      case "$2" in
        claude) SKILLS_DIR="$HOME/.claude/skills" ;;
        openclaw|hermes) echo "→ $2 请用 --dir 指定其 skills 目录(见 INSTALL.md);各框架机制相同。"; exit 1 ;;
        *) echo "未知 target: $2"; exit 1 ;;
      esac; shift 2 ;;
    *) echo "未知参数: $1"; exit 1 ;;
  esac
done
[ -z "$SKILLS_DIR" ] && SKILLS_DIR="$HOME/.claude/skills"   # 默认 Claude Code
TARGET="$SKILLS_DIR/$NAME"

echo "== 安装 $NAME 到: $TARGET =="
mkdir -p "$SKILLS_DIR"

# ---- 落地(优先本地副本,否则 clone)----
if [ -f "./SKILL.md" ] && [ -d "./assets" ]; then
  echo "→ 从当前目录复制"
  rm -rf "$TARGET"; mkdir -p "$TARGET"
  cp -r ./* "$TARGET"/ 2>/dev/null || true
  [ -f ./.gitignore ] && cp ./.gitignore "$TARGET"/ 2>/dev/null || true
else
  echo "→ git clone"
  rm -rf "$TARGET"
  git clone --depth 1 "$REPO" "$TARGET"
fi
echo "✓ 已安装文件"

# ---- 依赖自检(缺什么提示什么,不强装)----
echo "== 依赖自检 =="
miss=""
command -v node >/dev/null 2>&1 && echo "  ✓ node $(node -v)" || { echo "  ✗ node 缺失(Remotion 需 Node 18+)"; miss="$miss node"; }
command -v ffmpeg >/dev/null 2>&1 && echo "  ✓ ffmpeg" || { echo "  ✗ ffmpeg 缺失(音频处理需要)"; miss="$miss ffmpeg"; }
command -v python3 >/dev/null 2>&1 && PY=python3 || { command -v python >/dev/null 2>&1 && PY=python || PY=""; }
if [ -n "$PY" ]; then
  echo "  ✓ $($PY --version 2>&1)"
  $PY -c "import requests,numpy" >/dev/null 2>&1 && echo "  ✓ python: requests, numpy" \
    || { echo "  ! python 缺 requests/numpy — 运行: $PY -m pip install requests numpy"; }
else
  echo "  ✗ python 缺失(脚本需 Python 3)"; miss="$miss python"
fi

echo ""
echo "== 完成 =="
[ -n "$miss" ] && echo "⚠ 请先补齐:$miss"
cat <<EOF
下一步:
  1. 配置配音 key:  export SILICONFLOW_API_KEY=sk-...   (或在 $TARGET/.env 写一行)
  2. Claude Code 里说「帮我做个产品演示视频」即触发;或手动:
       python "$TARGET/scripts/new_project.py" <你的项目目录>
  说明见 $TARGET/README.md 与 $TARGET/INSTALL.md
EOF
