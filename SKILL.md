---
name: demo-video-maker
description: >
  用配置驱动的 Remotion 引擎,产出一支有旁白配音、背景音乐、音效、动效的产品/演示视频(MP4)。
  适用于任意短视频:融资演示、产品发布、功能讲解、案例复盘、宣传片、teaser。风格(配色主题)、
  配音音色+语速、背景音乐、音效、画幅(横/竖/方)全部可配。**当用户想做 demo 视频 / 产品视频 /
  演示视频 / 融资演示 / 宣传片 / explainer,或说"把这个案例(产品/agent)做成视频""做个演示片"
  "product video""pitch video",甚至只是要一支带旁白和动画的短视频时,都用这个 skill**——哪怕没点名。
  NOT:剪辑真人实拍素材、做 PPT(用 ppt-master)、写公众号(用 stoneyang-writing)。
---

# demo-video-maker

把一个产品/案例,变成一支专业的演示视频。核心是**一份 config.json 驱动一个可复用的 Remotion 引擎**:你(或用户)描述内容 + 选风格,引擎产出带配音/BGM/音效/动效的 MP4。

## 它怎么工作(心智模型)

像"填一张表就出片"。视频 = 若干**幕(scene)**串起来,每一幕从**幕类型库**里选一种(标题/引用/要点/拆解/打分/对抗/卡片/派单/数据/规模…),填内容;全局配**主题配色、配音音色语速、背景音乐、画幅**。引擎负责动效、配音对齐、音乐起伏、音效卡点、渲染。

三层资产:①**配音**(硅基流动 TTS,逐幕生成)②**BGM**(自带 2 条 + 可下载,音量随情节起伏)③**SFX 音效**(自带 6 个,按幕类型自动卡点)。

## 触发后的工作流

### 第 1 步 · 写脚本(照 `references/script-gen-prompt.md` 产出)
这是唯一靠创作判断、不自动化的一步。**先读 `references/script-gen-prompt.md`**,按它的「生成程序」把源材料写成 `scenes`:定位 → 选叙事弧 → 排幕 → 填内容 → 写旁白 → 自检。
- 内容**只用源材料里的真实事实/数字**,没有的标 `[待确认]` 不臆造。
- 叙事弧只是骨架起点,服从源材料,该增删就增删。
- 命名/核心主张/归类先给候选让用户拍板,不替他定调(见用户全局规则)。
- 重要片子可先产出一份独立分镜脚本 md 让用户审,再落 config;内容已清楚可直接写 config。

### 第 2 步 · 脚手工程
```bash
python <skill>/scripts/new_project.py <项目目录> --node-modules-from <已有Remotion工程>
```
`--node-modules-from` 复用另一个已装好依赖的 Remotion 工程的 node_modules(快,免 npm 网络/代理坑);首次没有可复用的就 `cd <项目目录> && npm install`。

### 第 3 步 · 写 config.json
编辑 `<项目>/src/config.json`。顶层字段见下方"配置速查";每种幕的字段见 `references/scene-types.md`;主题/音色/画幅见 `references/style-and-assets.md`。
起始可参考 `src/config.example.json`(虚构产品 AutoClip · 完整 7 幕范例)。

### 第 4 步 · 生成资产
```bash
python <skill>/scripts/tts.py <项目目录>          # 逐幕配音 + 写 vo_manifest.json(读 config 的 voice/speed)
python <skill>/scripts/synth_sfx.py               # (可选)重生成音效,模板已自带 6 个
python <skill>/scripts/fetch_bgm.py <项目> <name> # (可选)下载更多 BGM,自带 inspired/the_complex
```
配音依赖 `SILICONFLOW_API_KEY`(设环境变量,或在 skill 根建 `.env`)。TTS 是国内端点,脚本已 `trust_env=False` 绕 Clash 代理。

### 第 5 步 · 渲染
```bash
cd <项目目录>
npx remotion render Video out/video.mp4 --concurrency=2
```
`--concurrency=2` 规避 Windows 上偶发的临时文件 ENOENT(exit 2 就重试一次)。**渲染前先渲 1~2 帧静帧自检**(`npx remotion still Video out/chk.png --frame=N`),用 Read 看图确认排版,再跑全片。

### 第 5.5 步 · 自动质检(必跑,别靠人工审低级 bug)
```bash
python <skill>/scripts/qc.py <项目目录> <项目>/out/video.mp4
```
渲完**必须跑 qc.py**,它自动查 6 类低级 bug(任一 FAIL 退出码 1,必须修完再交):
1. config 合法 + 幕类型有效 + **无 emoji 图标**(反 AI 味)
2. vo 文件与 manifest 齐全
3. **旁白无尾字截断**(ASR 验每条 vo 尾字——CosyVoice2 会随机吞尾字,tts.py 已带验尾重试,qc 再兜底)
4. 时长匹配:每幕留够尾白,**末句在片尾前收完**(防"最后一句被切")
5. **音频中段无掉音**(防"声音突然断掉";BGM 恒定垫音≥0.09)
6. 成片含视频+音频流、分辨率符画幅、总时长≈预期
FAIL 就按提示修(截断→重跑 tts;掉音→提高 bgmVolume;末句被切→加末幕 endPad),再重渲重检。

### 第 6 步 · 交付 + 可选加速版
```bash
python <skill>/scripts/make_2x.py out/video.mp4 out/video_2x.mp4 2.0   # 快进 teaser,音调不变
```
把成片给用户看,按反馈迭代 config(改文案/换主题/调 BGM 音量/加删音效)。

## 配置速查(config.json 顶层)

| 字段 | 说明 | 例 |
|---|---|---|
| `brand` | 左上角顶标(留空则不显) | `"KROX AI"` |
| `watermark` | 右下角角标(合规/概念演示标注) | `"产品概念演示"` |
| `aspect` | 画幅 | `"16:9"` / `"9:16"` / `"1:1"` |
| `fps` | 帧率 | `30` |
| `theme` | 主题预设 | `"warm-dark"` / `"midnight"` / `"clean-light"` |
| `themeOverrides` | 覆盖任意主题色 | `{"accent":"#FF6A00"}` |
| `voice` | 配音音色(CosyVoice2) | `"alex"`(男沉稳)见 style-and-assets |
| `speed` | 语速 | `0.9`(沉稳)~ `1.1` |
| `bgm` | 背景音乐文件名(public/bgm/,不含.mp3)或 `"none"` | `"inspired"` |
| `bgmVolume` | BGM 恒定垫音音量(0~1,常用 0.09~0.12,别<0.09 否则停顿处像掉音) | `0.10` |
| `sfx` | 音效层开关 | `true` |
| `scenes` | 幕数组,每项一个幕对象 | 见 scene-types.md |

每个幕对象:`{"type": "...", ...该类型字段..., "vo": "旁白文本(可选)", "dur": 秒(无旁白时用)}`。
有 `vo` 的幕:时长自动跟配音;无 `vo`:用 `dur`(秒)或默认 5 秒。

## 视觉负面准则 · 反 AI 味(硬规定,每次写 config 都过这几条)

"AI 味太重"是这类视频最容易翻的车,根子是**满屏 emoji 图标 + 每个元素都上色**。以下是硬规定(源自 warm-editorial 设计原则 + 实战反馈),**用反面范例记,别记抽象规则**:

**① 图标:emoji 是 AI 味头号信号 —— 默认不用。**
- ❌ 差:`{"icon":"🧠","label":"只问该问的",...}`、依据卡 `"icon":"📎"`、卡片 `🔍🛡️💰🎯` 一排 emoji。
- ✅ 好:**不给 icon**(卡片靠 `label`+`text` 就够干净);真要视觉锚点,用**序号**(①②③)或让 `label` 本身当锚。emoji 一律不用,除非用户明确要。

**② 颜色:一个主色,稀缺地用 —— 别每个 label/节点/卡片都染成主色。**
- ❌ 差:kicker、每张卡的 label、每个节点框、每条依据卡全上 accent 色 → 一屏五六处高饱和,廉价 AI 感。
- ✅ 好:accent 只留给**真正要强调的那一两处**(关键数字、结论、单个 CTA);其余用 `ink`/`soft` 灰阶。拿不准强调时**放大字号或加深主色,不堆更多颜色**。
- ❌ 禁:冷灰、冷蓝做中性色或重音(generic AI UI 最常见的味);饱和/霓虹色。

**③ 底与层次:别纯白、别硬阴影。**
- ❌ 差:`#ffffff` 纯白底/卡、黑色硬投影。
- ✅ 好:用主题自带的暖白/深底(themes 已处理);层次优先 **1px hairline 描边**,阴影只用极轻的。

**④ 克制总纲**:少即是多。一幕里"图标+多色+发光+大字"全上=AI 味。**先删到只剩内容,再考虑加一处强调。** 资深设计师看一眼会不会觉得"这是 AI 随手生成的"?会,就再删。

> 写完 config 自检:有没有 emoji 图标?有没有超过 2 处 accent 色?有没有能删的装饰?——有就删。

**⑤ 音效准则(反"每页一个大 whoosh"的 AI 幻灯片味)**:
- ❌ 差:每幕开场放一个 `rise` 上扬音当"切换声"——满片都是 whoosh,吵、廉价。
- ✅ 好:**幕切换默认静音**;音效只留给**内容动作**(节点点亮 ping、盖章 stamp、落板和弦),且音量压很低(默认 0.18,响的≤0.28)。进入声用**清脆短击**不用噪音扫。引擎已按此调好,写 config 时不用额外配,`sfx:false` 可整关。

**⑥ 视觉深度(引擎已自带,别改平)**:每幕背景有氛围层(BgFx:渐变光晕+隐约网格+暗角+颗粒),大标题走电影感 blur 入场,kicker 带 accent 短线——这些是"不平底 PPT"的关键。别把背景改回纯色平底。想换氛围强度调 `theme` 或 `BgFx`。

## 关键坑(踩过的)
- **TTS 模型名大小写**:`FunAudioLLM/CosyVoice2-0.5B`(大写 B),错了报"缺 input"。脚本已固定。
- **代理**:硅基流动/本地是国内端点要绕代理(脚本已处理);下 BGM 是国外站要走代理(fetch_bgm 已处理)。
- **字体**:大标题用自带的思源宋体(`public/fonts/`,`fonts.tsx` 组件内 delayRender 加载——顶层模块加载会崩 bundle),正文用系统 sans;别退回系统雅黑当大标题(AI 味)。
- **BGM 版权**:自带 inspired/the_complex 是 Kevin MacLeod CC-BY,**对外发布需片尾署名**;要零署名让用户下 Pixabay CC0 换进 public/bgm/。
- **staticFile 中文名**:配音/资源文件名用 ASCII(vo0.mp3),别用中文,避免编码问题(脚本已按幕序号命名)。
- **竖屏 9:16**:v0 各幕排版按 16:9 调优,竖屏能出但可能要收窄某些幕的 `w`;先渲静帧看。

## 参考
- `references/script-gen-prompt.md` — **第 1 步写脚本的提示词**:源材料→分幕脚本;含叙事弧库、节拍→幕映射、旁白规则、真实性红线、自检清单、可复制 PROMPT(任一大模型可独立跑)
- `references/scene-types.md` — 10 种幕类型的字段与用法(写 config 前必读)
- `references/style-and-assets.md` — 主题预设、音色清单、BGM 来源、音效清单、画幅
- `references/config-schema.md` — 完整 config 结构 + 校验要点
- `assets/remotion-template/src/config.example.json` — 完整范例(虚构 AutoClip 7 幕)
