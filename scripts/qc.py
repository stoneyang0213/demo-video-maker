#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""渲染后自动质检(不靠人工审低级 bug)。
用法: python qc.py <project_dir> <rendered.mp4>

检查 6 类(任一 FAIL 则退出码 1):
  1. config 合法 + 幕类型有效 + 无 emoji 图标(反 AI 味)
  2. 每个有 vo 的幕都有 vo 文件,manifest 对齐
  3. 旁白未被截断(ASR 验每条 vo 尾字 —— CosyVoice2 会随机吞尾字)
  4. 时长匹配:每幕留够尾白,末幕旁白在片尾前收完(防"最后一句被切")
  5. 音频连续:除首尾淡入淡出,中间无 >1.2s 掉音(防"声音突然断掉")
  6. 成片格式:含视频+音频流,分辨率符合画幅,总时长≈预期
"""
import sys, re, json, math, pathlib, subprocess
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import tts as T  # 复用 asr / _strip

SCENE_TYPES = {"title", "quote", "bullets", "breakdown", "score", "debate", "cards", "dispatch", "stats", "scale"}
ASPECTS = {"16:9": (1920, 1080), "9:16": (1080, 1920), "1:1": (1080, 1080)}
# 只查装饰性 emoji 图标(物件/表情/符号);放行功能符号(箭头/勾叉/几何点/天平等)
EMOJI = re.compile("[\U0001F300-\U0001FAFF\U00002600-\U000026FF\U0001F1E6-\U0001F1FF]")
EMOJI_OK = set("→←↑↓✓✗×·—⚖⚔🔵🔴🟢🟡🟠🟣")  # 功能性标记,非装饰,不算 AI 味

results = []
def check(name, ok, detail=""):
    results.append((ok, name, detail))
    print(f"  [{'PASS' if ok else 'FAIL'}] {name}" + (f" — {detail}" if detail else ""))

def probe(mp4, *entries):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", *entries,
        "-of", "json", str(mp4)]).decode()
    return json.loads(out)

def scene_frames(sc, vf, fps):
    if vf and vf > 0: return 10 + vf + sc.get("endPad", 26)
    if sc.get("dur"): return round(sc["dur"] * fps)
    return sc.get("minFrames", 150)

def main(proj, mp4):
    proj = pathlib.Path(proj); mp4 = pathlib.Path(mp4)
    cfg = json.loads((proj / "src" / "config.json").read_text(encoding="utf-8"))
    man = json.loads((proj / "src" / "vo_manifest.json").read_text(encoding="utf-8"))
    fps = cfg.get("fps", 30); scenes = cfg["scenes"]

    # 1. config + 幕类型 + emoji
    bad_types = [s.get("type") for s in scenes if s.get("type") not in SCENE_TYPES]
    check("幕类型全部有效", not bad_types, f"未知类型 {bad_types}" if bad_types else "")
    emj = [c for c in EMOJI.findall(json.dumps(cfg, ensure_ascii=False)) if c not in EMOJI_OK]
    check("无 emoji 图标(反 AI 味)", not emj, f"发现 {emj[:6]}" if emj else "")

    # 2. vo 文件齐 + manifest 对齐
    miss = []
    for i, s in enumerate(scenes):
        if s.get("vo"):
            f = proj / "public" / "vo" / f"vo{i}.mp3"
            if not f.exists() or str(i) not in man: miss.append(i)
    check("vo 文件与 manifest 齐全", not miss, f"缺 {miss}" if miss else "")

    # 3. 旁白未截断(ASR 验尾)
    trunc = []
    for i, s in enumerate(scenes):
        vo = s.get("vo")
        if not vo: continue
        f = proj / "public" / "vo" / f"vo{i}.mp3"
        if not f.exists(): continue
        got = T.asr(str(f))
        if got is None: continue  # ASR 不可用,跳过
        tail = T._strip(vo)[-2:]
        if tail and tail not in got[-12:]:
            trunc.append(f"vo{i}(缺'{tail}',尾='...{got[-6:]}')")
    check("旁白无尾字截断", not trunc, "; ".join(trunc) if trunc else "")

    # 4. 时长匹配 + 末句收得完
    durs = [scene_frames(s, man.get(str(i)), fps) for i, s in enumerate(scenes)]
    total = sum(durs)
    thin = []
    for i, s in enumerate(scenes):
        vf = man.get(str(i))
        if vf and durs[i] - (10 + vf) < 12:
            thin.append(f"幕{i}(尾白{durs[i]-(10+vf)}帧<12)")
    # 末条有 vo 的幕,其旁白结束点距片尾
    last_vo_end = 0
    acc = 0
    for i, s in enumerate(scenes):
        vf = man.get(str(i))
        if vf: last_vo_end = acc + 10 + vf
        acc += durs[i]
    tail_gap = total - last_vo_end
    check("每幕留够尾白", not thin, "; ".join(thin) if thin else "")
    check("末句在片尾前收完", tail_gap >= 12, f"末旁白距片尾仅 {tail_gap} 帧" if tail_gap < 12 else f"余 {tail_gap} 帧")

    # 5. 音频连续(中间无掉音)
    dur_s = float(probe(mp4, "format=duration")["format"]["duration"])
    sil = subprocess.run(["ffmpeg", "-hide_banner", "-i", str(mp4), "-vn",
        "-af", "silencedetect=noise=-33dB:d=0.5", "-f", "null", "-"],
        capture_output=True, text=True).stderr
    gaps = []
    starts = [float(x) for x in re.findall(r"silence_start: ([\d.]+)", sil)]
    ends = [float(x) for x in re.findall(r"silence_end: ([\d.]+)", sil)]
    for st, en in zip(starts, ends):
        if st > 1.0 and en < dur_s - 1.0 and (en - st) > 1.2:  # 掐头去尾后的中段掉音
            gaps.append(f"{st:.1f}-{en:.1f}s")
    check("音频中段无掉音", not gaps, f"掉音 {gaps}" if gaps else "")

    # 6. 成片格式
    streams = probe(mp4, "stream=codec_type,width,height")["streams"]
    types = {s["codec_type"] for s in streams}
    check("含视频+音频流", {"video", "audio"} <= types, f"仅 {types}")
    vs = next((s for s in streams if s["codec_type"] == "video"), {})
    exp = ASPECTS.get(cfg.get("aspect", "16:9"), (1920, 1080))
    check("分辨率符合画幅", (vs.get("width"), vs.get("height")) == exp, f"{vs.get('width')}x{vs.get('height')} vs {exp}")
    exp_s = total / fps
    check("总时长≈预期", abs(dur_s - exp_s) < 1.0, f"{dur_s:.1f}s vs 预期 {exp_s:.1f}s")

    fails = [r for r in results if not r[0]]
    print(f"\n质检结果: {len(results)-len(fails)}/{len(results)} 通过" + (f",{len(fails)} 项 FAIL" if fails else " ✅ 全部达标"))
    sys.exit(1 if fails else 0)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python qc.py <project_dir> <rendered.mp4>"); sys.exit(2)
    main(sys.argv[1], sys.argv[2])
