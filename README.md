# demo-video-maker

**一份 `config.json` → 一支带旁白、背景乐、音效、电影感动效的产品/演示视频(MP4)。**
A config-driven engine that turns one JSON file into a narrated, cinematic product / pitch demo video — powered by [Remotion](https://remotion.dev).

既是 [Claude Code](https://claude.com/claude-code) 的一个 **skill**(说"帮我做个产品演示视频"即触发),也能作为独立的 Remotion 工程直接用。支持 Claude Code / OpenClaw / Hermes 等主流 Agent-Skills 框架。

## 一键安装

```sh
# macOS / Linux — 默认装到 Claude Code(~/.claude/skills/)
curl -fsSL https://raw.githubusercontent.com/stoneyang0213/demo-video-maker/main/install.sh | sh
```
```powershell
# Windows PowerShell
irm https://raw.githubusercontent.com/stoneyang0213/demo-video-maker/main/install.ps1 | iex
```
其它框架(OpenClaw / Hermes / …)只是 skills 目录不同,加 `--dir <skills目录>` 即可。**完整分框架说明见 [INSTALL.md](INSTALL.md)**。先决条件:Node 18+ / ffmpeg / Python3(requests+numpy)/ SiliconFlow key,安装脚本会自检。

---

## 它能做什么

- **配置驱动**:内容(分幕 + 旁白)和风格全写在一份 `config.json` 里,不碰代码。
- **10 种幕类型**积木:标题 / 引用 / 要点+盖章 / 拆解 / 打分 / 红蓝对抗 / 卡片 / 派单 / 数据 / 规模,自由拼。
- **三层音频**:旁白(SiliconFlow TTS)+ 背景乐(随情节起伏的恒定垫音)+ 音效(按幕类型自动卡点)。
- **三套主题** + 任意覆盖:暖黑编辑 / 午夜蓝科技 / 暖纸(warm-editorial);画幅横/竖/方。
- **惊艳层**:氛围背景(渐变光晕+网格+颗粒)、电影感 blur 入场、宋体大标题——刻意避开"AI slop"。
- **自动质检**:渲完跑 `qc.py`,自动查旁白截断、音频掉音、末句被切、emoji 味等 10 项低级 bug。

## 工作流(5 步)

```bash
# 1. 脚手一个工程(复用另一个已装依赖的 Remotion 工程的 node_modules 更快)
python scripts/new_project.py <目标目录> --node-modules-from <已有Remotion工程>

# 2. 编辑 <目标目录>/src/config.json —— 写内容 + 选风格(见 references/)

# 3. 生成配音(读 config 的 voice/speed;自带 ASR 验尾字防截断)
python scripts/tts.py <目标目录>

# 4. 渲染
cd <目标目录> && npx remotion render Video out/video.mp4 --concurrency=2

# 5. 自动质检(必跑)
python scripts/qc.py <目标目录> out/video.mp4

# 可选:出 2 倍速 teaser
python scripts/make_2x.py out/video.mp4 out/video_2x.mp4 2.0
```

作为 Claude Code skill 用时,以上由 Claude 自动完成——你只要描述产品,它会**先读 `references/script-gen-prompt.md` 写脚本**,再跑完剩下的。

## 环境要求

- **Node.js 18+**(Remotion) + 系统 Chrome
- **ffmpeg**(音频处理 / 2x)
- **Python 3** + `requests`、`numpy`
- **SiliconFlow API key**(配音 + 质检 ASR):设环境变量 `SILICONFLOW_API_KEY=sk-...`,或在本目录建 `.env` 写同名行。免费额度即可起步。

## 目录

```
demo-video-maker/
├── SKILL.md                    # Claude Code skill 工作流 + 视觉/音效负面准则
├── references/
│   ├── script-gen-prompt.md    # 「写脚本」提示词(源材料→分幕脚本,可独立喂任一大模型)
│   ├── scene-types.md          # 10 种幕类型字段
│   ├── config-schema.md        # config 完整结构 + 校验
│   └── style-and-assets.md     # 主题 / 音色 / BGM / 音效 / 字体 / 画幅
├── scripts/                    # new_project / tts / synth_sfx / fetch_bgm / make_2x / qc
└── assets/remotion-template/   # 可复用 Remotion 工程(引擎 + 自带 BGM/SFX/字体 + 示例 config)
```

## 设计取向:反 "AI slop"

这个工具刻意跟"一眼 AI 生成"的观感对着干,`SKILL.md` 里有硬性视觉负面准则:默认不用 emoji 图标、主色稀缺用、禁纯白冷灰、大标题用宋体不用系统雅黑、背景要有深度、切换默认静音、BGM 恒定垫音。示例产物请自行渲染查看。

## 授权

- 源码:**MIT**(见 `LICENSE`)。
- 内附背景乐(Kevin MacLeod, CC BY 4.0)、字体(Noto Serif SC, SIL OFL 1.1)、渲染引擎(Remotion,有自己的商用授权条款)各有授权——**再分发 / 对外发布视频前请读 `CREDITS.md`**。

---

由 [stoneyang](https://github.com/stoneyang0213) 用 Claude Code 做成。欢迎 issue / PR。
