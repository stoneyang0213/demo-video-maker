# 安装 · Installation

`demo-video-maker` 是一个**标准 Agent Skill**(一个含 `SKILL.md` 的文件夹)。**装的是你的智能体(agent),不是操作系统**——把它放进 agent 的 skills 目录即可。各主流 agent 机制相同。

先决条件(通用):**Node 18+**、**ffmpeg**、**Python 3**(`pip install requests numpy`)、一个 **SiliconFlow API key**(配音用,https://siliconflow.cn 免费领)。

---

## 方式一:一行安装(推荐,[skills.sh](https://skills.sh) / `vercel-labs/skills`)

```bash
npx skills add stoneyang0213/demo-video-maker
```

`skills` CLI 会自动把 skill 装到你当前 agent 的 skills 目录。常用参数:

| 参数 | 作用 |
|---|---|
| `-g, --global` | 装到全局用户目录(默认装当前项目) |
| `-a, --agent <name>` | 指定 agent,如 `claude-code`、`codex`(支持列表见 skills CLI 文档) |
| `--copy` | 复制而非 symlink(**Windows / 代理环境务必加**,否则 symlink 可能被存成文本) |
| `-y, --yes` | 跳过确认 |

例:
```bash
npx skills add stoneyang0213/demo-video-maker -g -a claude-code --copy
```

## 方式二:手动放进 agent 的 skills 目录(任何框架都行)

```bash
git clone https://github.com/stoneyang0213/demo-video-maker <agent的skills目录>/demo-video-maker
```

各 agent 的 skills 目录:

| Agent | skills 目录 |
|---|---|
| **Claude Code** | `~/.claude/skills/`(全局)或 项目内 `.claude/skills/` |
| **Codex / 其它 skills CLI 支持的 agent** | 用方式一的 `-a` 自动定位 |
| **OpenClaw** | 该框架的 skills 目录(见其文档;用与 Claude 相同的 Agent-Skills 格式) |
| **Hermes** | Hermes 主机上的 skills 目录 |
| **其它 Agent-Skills 兼容框架** | 各自的 skills 目录 |

> 本 skill 遵循通用 Agent Skills 规范(`SKILL.md` + frontmatter),**任何支持 Agent Skills 的框架都能用**——把文件夹放进它的 skills 目录即可。skills CLI 支持的 agent 直接用方式一;不在支持列表里的框架用方式二手动放。

---

## 装完之后

1. **配置配音 key**(二选一):
   ```bash
   export SILICONFLOW_API_KEY=sk-...          # 环境变量
   # 或在 skill 根目录建 .env,写一行:SILICONFLOW_API_KEY=sk-...
   ```

2. **触发**:在 agent 里说「帮我做个产品演示视频 / 把这个案例做成视频」,它会自动走完 脚本→配音→渲染→质检。
   手动:`python <skill>/scripts/new_project.py <你的项目目录>`,再按 `README.md` 的 5 步走。

3. **首次渲染**在项目目录 `npm install`(装 Remotion 依赖),或 `new_project.py --node-modules-from <已有Remotion工程>` 复用依赖。

遇到问题看 `README.md`、`SKILL.md`,或提 issue。
