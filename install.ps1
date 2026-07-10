# demo-video-maker · 一键安装器 (Windows PowerShell)
# 用法:
#   irm https://raw.githubusercontent.com/stoneyang0213/demo-video-maker/main/install.ps1 | iex
#   或 clone 后:  .\install.ps1 [-Dir <skills目录>]
# 默认装到 Claude Code 的 $HOME\.claude\skills\;其它框架(OpenClaw/Hermes)用 -Dir 指定其 skills 目录。
param([string]$Dir = "$HOME\.claude\skills")

$ErrorActionPreference = "Stop"
$Repo = "https://github.com/stoneyang0213/demo-video-maker.git"
$Name = "demo-video-maker"
$Target = Join-Path $Dir $Name

Write-Host "== 安装 $Name 到: $Target =="
New-Item -ItemType Directory -Force -Path $Dir | Out-Null

if ((Test-Path ".\SKILL.md") -and (Test-Path ".\assets")) {
  $src = (Get-Location).Path
  $tgt = if (Test-Path $Target) { (Resolve-Path $Target).Path } else { $Target }
  if ($tgt -eq $src) {
    Write-Host "→ 已在目标位置,无需复制"
  } else {
    Write-Host "→ 从当前目录复制"
    if (Test-Path $Target) { Remove-Item -Recurse -Force $Target }
    Copy-Item -Recurse -Force -Path $src -Destination $Target
  }
} else {
  Write-Host "→ git clone"
  if (Test-Path $Target) { Remove-Item -Recurse -Force $Target }
  git clone --depth 1 $Repo $Target
}
Write-Host "✓ 已安装文件"

Write-Host "== 依赖自检 =="
function Have($c) { $null -ne (Get-Command $c -ErrorAction SilentlyContinue) }
if (Have node)   { Write-Host "  ✓ node $(node -v)" } else { Write-Host "  ✗ node 缺失(Remotion 需 Node 18+)" }
if (Have ffmpeg) { Write-Host "  ✓ ffmpeg" } else { Write-Host "  ✗ ffmpeg 缺失" }
$py = if (Have python) { "python" } elseif (Have python3) { "python3" } else { $null }
if ($py) {
  Write-Host "  ✓ $(& $py --version)"
  & $py -c "import requests,numpy" 2>$null
  if ($LASTEXITCODE -eq 0) { Write-Host "  ✓ python: requests, numpy" }
  else { Write-Host "  ! python 缺 requests/numpy — 运行: $py -m pip install requests numpy" }
} else { Write-Host "  ✗ python 缺失(脚本需 Python 3)" }

Write-Host ""
Write-Host "== 完成 =="
Write-Host "下一步:"
Write-Host "  1. 配置配音 key:  `$env:SILICONFLOW_API_KEY='sk-...'  (或在 $Target\.env 写一行)"
Write-Host "  2. Claude Code 里说「帮我做个产品演示视频」即触发;或手动:"
Write-Host "       python `"$Target\scripts\new_project.py`" <你的项目目录>"
Write-Host "  说明见 $Target\README.md 与 $Target\INSTALL.md"
