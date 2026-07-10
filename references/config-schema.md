# config.json 结构 + 校验要点

config.json 在 `<项目>/src/config.json`。它被 Root.tsx / Video.tsx 直接 import,改完重新 render 即生效。

## 顶层

```jsonc
{
  "brand": "KROX AI",          // 左上顶标,留空不显
  "watermark": "产品概念演示",   // 右下角标,留空不显
  "aspect": "16:9",            // "16:9" | "9:16" | "1:1"
  "fps": 30,
  "theme": "warm-dark",        // 预设名(见 style-and-assets)
  "themeOverrides": {},        // 可选,覆盖任意主题色
  "voice": "alex",             // CosyVoice2 音色
  "speed": 0.9,                // 语速
  "bgm": "inspired",           // public/bgm/ 下文件名,或 "none"
  "bgmVolume": 0.06,           // 0~1,峰值
  "voVolume": 1,               // 可选,旁白音量
  "sfx": true,                 // 音效层开关
  "scenes": [ /* 幕数组 */ ]
}
```

## 幕通用字段
每幕都可带:
- `type`(必填)— 见 scene-types.md 的 10 种
- `vo`(可选)— 旁白文本;有则该幕时长跟配音,且 tts.py 会生成 `vo<幕序号>.mp3`
- `dur`(可选)— 无 vo 时的秒数(默认 5)
- `w`(可选)— 内容列宽 px,覆盖该幕默认
- `endPad`(可选)— 尾部留白帧(默认 42)
- `minFrames`(可选)— 无 vo 无 dur 时的兜底帧(默认 150)

## 校验要点(写完自检)
1. **每个 scene.type 都在库里**(title/quote/bullets/breakdown/score/debate/cards/dispatch/stats/scale),否则渲出红字"未知幕类型"。
2. **JSON 合法**:中文引号 `"` 要转义 `\"`;逗号别多别少。改完 `python -c "import json;json.load(open('src/config.json',encoding='utf-8'))"` 验一下。
3. **vo 与幕序号绑定**:tts.py 按幕在数组里的**索引**命名 vo 文件;插入/删除幕后要**重跑 tts.py**(否则 manifest 对不上,配音错位)。
4. **颜色名**只认 accent/danger/blue/redd/ok/soft/accent2… 或直接 hex;拼错会 fallback 到 accent。
5. **节点/条目别太多**:breakdown 节点 4-6 个、cards 3-4 张、bullets 3-5 条最佳,多了挤。
6. **真实性**:数字/案例要真;概念演示类务必设 `watermark`(如"产品概念演示"),并在旁白里不夸兑现。

## 增删幕后的最短重跑
```bash
python <skill>/scripts/tts.py <项目>              # 重生成配音+manifest(改了 vo/voice/speed 必跑)
cd <项目> && npx remotion render Video out/x.mp4 --concurrency=2
```
只改了纯视觉字段(不动 vo/voice/speed)可跳过 tts,直接 render。

## 一个最小可跑 config(3 幕)
```json
{
  "brand": "ACME", "watermark": "", "aspect": "16:9", "theme": "midnight",
  "voice": "alex", "speed": 1.0, "bgm": "the_complex", "bgmVolume": 0.06, "sfx": true,
  "scenes": [
    {"type": "title", "kicker": "INTRODUCING", "title": "ACME 智能仪表盘", "subtitle": "10 秒看懂你的业务", "vo": "认识一下 ACME,让你十秒看懂业务。"},
    {"type": "cards", "label": "三个核心能力", "cards": [
      {"icon": "⚡", "label": "实时", "text": "秒级刷新的关键指标"},
      {"icon": "🔗", "label": "打通", "text": "一处接入,全端同步"},
      {"icon": "🧭", "label": "洞察", "text": "自动标出异常与机会"}
    ], "vo": "实时刷新、一处打通、自动洞察。"},
    {"type": "stats", "kicker": "效果", "title": "上线一个月", "trend": true, "stats": [
      {"big": "-40%", "cap": "看数时间"}, {"big": "×3", "cap": "决策速度"}
    ], "vo": "上线一个月,看数时间降四成,决策快三倍。"}
  ]
}
```
