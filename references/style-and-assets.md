# 风格 · 音色 · 音乐 · 音效 · 画幅

## 主题预设(config.theme)
在 `assets/remotion-template/src/theme.ts`,可加新预设或用 `themeOverrides` 临时覆盖。

| 预设 | 气质 | 底/字/强调 | 适合 |
|---|---|---|---|
| `warm-dark` | 暖黑编辑感(默认) | 近黑 / 白 / 琥珀金 + 红点缀 | 融资演示、高端产品、KROX/BP 风 |
| `midnight` | 午夜蓝科技 | 深蓝 / 亮白 / 青色 | SaaS、工具、数据产品 |
| `clean-light` | 亮白简净 | 米白 / 墨黑 / 墨绿 | 消费品、明快、亲和 |

**覆盖示例**(把强调色换成橙):
```json
"theme": "warm-dark",
"themeOverrides": {"accent": "#FF6A00", "accentLine": "rgba(255,106,0,0.4)", "accentSoft": "rgba(255,106,0,0.16)"}
```
主题字段全集见 theme.ts 的 `Theme` 类型:bg/bg2/ink/soft/faint/accent/accentSoft/accentLine/danger/blue/redd/ok/card/cardLine/sans/mono。

## 字体(高级/编辑感)
大标题(`Hd`)默认用**思源宋体 Noto Serif SC**(模板自带 `public/fonts/`,`src/fonts.ts` 用 delayRender 加载)——衬线宋体给"高级/编辑感",尤其配 warm-editorial 暖底像杂志。kicker/数字用 mono 做技术对比,正文小字用系统 sans(小字宋体不清晰)。换字体:换 `public/fonts/` 里的 woff2 + 改 `theme.ts` 的 `DISPLAY` 常量。**别退回系统雅黑当大标题**(那是 AI 默认字体味)。

## 配音音色(config.voice · 硅基流动 CosyVoice2)
8 个预设:`alex` `anna` `bella` `benjamin` `charles` `claire` `david` `diana`。
- 男声:`alex`(沉稳标准,融资/product 默认)、`benjamin`(低沉磁性)、`charles`(成熟醇厚)、`david`。
- 女声:`anna` `bella` `claire` `diana`。
- **语速** `speed`:`0.9` 沉稳留白(旁白推荐)/ `1.0` 正常 / `1.1`+ 明快。
- 想听样音:改 config 的 voice/speed 后 `python scripts/tts.py <项目>` 只跑一幕试听,或先拿一句短文本试。

## 背景音乐(config.bgm)
放在 `<项目>/public/bgm/<name>.mp3`,config 写不含后缀的名。模板自带:
- `inspired` — 暖调钢琴上扬(希望/结果,默认)
- `the_complex` — 脉冲科技感(分析/推理,会 build)
下载更多:`python scripts/fetch_bgm.py <项目> <name>`(内置 ether/cipher,或传直链)。
- `bgmVolume`:**恒定垫音**音量,常用 **0.09~0.12**。引擎把 BGM 做成淡入后一直保持的连续垫音(不忽高忽低)——**太低(<0.06)会在旁白停顿处听感"突然断掉",别再往下压**;太高压旁白。0.10 是安全默认。
- **版权**:Incompetech(Kevin MacLeod)= CC-BY,**对外发布片尾需署名** `Music by Kevin MacLeod (incompetech.com), CC BY 4.0`。要零署名 → 让用户去 Pixabay 下 CC0 曲丢进 public/bgm/。
- 不要音乐:`"bgm": "none"`。

## 音效(config.sfx)
`true` 开 / `false` 关。模板自带 6 个(`public/sfx/`),各幕按类型自动卡点触发:
- `ping` 节点点亮 · `whoosh` 卡片滑出 · `stamp` 盖章 · `ding` 裁决/收束 · `rise` 上扬/数字 · `chord` 落板和弦。
重生成/调音:`python scripts/synth_sfx.py`(numpy 合成,输出到 `demo-video/audio/sfx`,再拷进 public/sfx)。单幕音量在幕组件里已设,想整体调可改 common.tsx 的 `Sfx` 默认 vol。

## 画幅(config.aspect)
- `16:9` = 1920×1080(投资人投屏/邮件,默认,各幕排版按此调优)
- `9:16` = 1080×1920(视频号/朋友圈竖屏;能出,但部分幕可能要调小 `w` 或减少每幕信息量,**先渲静帧看**)
- `1:1` = 1080×1080(社媒方图)

## 时长控制
- 有旁白的幕:时长自动 = 配音长 + 首尾留白;想收尾更快调 `endPad`。
- 无旁白的幕:用 `dur`(秒)。
- 总长建议 60~90 秒;要更短的 teaser 用 `python scripts/make_2x.py 成片 输出 2.0` 出快进版(音调不变)。
