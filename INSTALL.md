# 安装 · Installation

`demo-video-maker` 是一个**标准 Agent Skill**——一个包含 `SKILL.md` 的文件夹。
安装 = 把这个文件夹放进你 agent 的 **skills 目录**。各主流 agent 框架机制相同,只是 skills 目录不同。

先决条件(所有框架通用):**Node.js 18+**、**ffmpeg**、**Python 3**(`pip install requests numpy`)、一个 **SiliconFlow API key**(配音用)。安装脚本会自检这些并提示缺什么。

---

## 一键安装

### macOS / Linux
```sh
# 默认装到 Claude Code (~/.claude/skills/)
curl -fsSL https://raw.githubusercontent.com/stoneyang0213/demo-video-maker/main/install.sh | sh

# 装到其它框架:指定该框架的 skills 目录
curl -fsSL https://raw.githubusercontent.com/stoneyang0213/demo-video-maker/main/install.sh | sh -s -- --dir <你的skills目录>
```

### Windows (PowerShell)
```powershell
# 默认 Claude Code
irm https://raw.githubusercontent.com/stoneyang0213/demo-video-maker/main/install.ps1 | iex

# 指定目录
.\install.ps1 -Dir "<你的skills目录>"
```

### 或者:手动 clone(最透明,任何框架都行)
```sh
git clone https://github.com/stoneyang0213/demo-video-maker <你的skills目录>/demo-video-maker
```

---

## 各框架的 skills 目录

| 框架 | skills 目录 | 一键命令 |
|---|---|---|
| **Claude Code** | `~/.claude/skills/` | `sh install.sh`(默认) |
| **OpenClaw** | 该框架的 skills 目录(见其文档 / 配置;OpenClaw 用与 Claude 相同的 Agent-Skills 格式) | `sh install.sh --dir <OpenClaw skills 目录>` |
| **Hermes** | Hermes 主机上的 skills 目录 | 在 Hermes 主机 `sh install.sh --dir <Hermes skills 目录>` |
| **其它 Agent-Skills 兼容框架**(Amp / Copilot CLI 等) | 各自的 skills 目录 | `sh install.sh --dir <skills 目录>` |

> 说明:本 skill 遵循通用 Agent Skills 规范(`SKILL.md` + frontmatter),因此**任何支持 Agent Skills 的框架都能用**——只要把文件夹放进它的 skills 目录即可。若不确定某框架的 skills 目录,查它的文档或问 `where does <framework> load skills from`。

---

## 装完之后

1. **配置配音 key**(二选一):
   ```sh
   export SILICONFLOW_API_KEY=sk-...            # 环境变量
   # 或在 skill 根目录建 .env,写一行:SILICONFLOW_API_KEY=sk-...
   ```
   没有 key 就去 https://siliconflow.cn 免费注册领,起步额度够用。

2. **触发**:在支持 skill 的 agent 里说「帮我做个产品演示视频 / 把这个案例做成视频」,它会自动走完脚本→配音→渲染→质检。
   手动用:`python <skill>/scripts/new_project.py <你的项目目录>`,再按 `README.md` 的 5 步走。

3. **首次渲染**要在项目目录 `npm install`(装 Remotion 依赖),或用 `new_project.py --node-modules-from <已有Remotion工程>` 复用依赖。

遇到问题看 `README.md`、`SKILL.md`,或提 issue。
