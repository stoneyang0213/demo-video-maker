#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""按 config.json 逐幕生成配音 + 写 vo_manifest.json。
硅基流动 CosyVoice2,音色/语速取自 config。key 从环境变量或 wce .env 读,不硬编码。

用法: python tts.py <project_dir>
  读 <project_dir>/src/config.json
  写 <project_dir>/public/vo/vo{sceneIndex}.mp3  (仅对有 "vo" 字段的幕)
  写 <project_dir>/src/vo_manifest.json  = { "sceneIndex": voFrames, ... }
"""
import sys, os, re, json, math, pathlib, subprocess
import requests

sys.stdout.reconfigure(encoding="utf-8")
MODEL = "FunAudioLLM/CosyVoice2-0.5B"
ASR_MODEL = "FunAudioLLM/SenseVoiceSmall"

def _strip(s):
    return re.sub(r"[^\w一-鿿]", "", s or "")

def asr(path):
    """转写(SenseVoice),用于自检尾字是否被截断。"""
    key = load_key(); sess = requests.Session(); sess.trust_env = False
    with open(path, "rb") as f:
        r = sess.post("https://api.siliconflow.cn/v1/audio/transcriptions",
            headers={"Authorization": f"Bearer {key}"},
            files={"file": (pathlib.Path(path).name, f, "audio/mpeg")},
            data={"model": ASR_MODEL}, timeout=120)
    if r.status_code != 200:
        return None  # ASR 不可用则跳过校验
    return _strip(re.sub(r"<\|.*?\|>", "", r.json().get("text", "")))

def tts_verified(text, voice, speed, out_path, tries=3):
    """生成 + ASR 验尾字(CosyVoice2 会随机吞尾字),截断则重试。"""
    tail = _strip(text)[-2:]
    for k in range(tries):
        tts(text, voice, speed, out_path)
        got = asr(out_path)
        if got is None or not tail or tail in got[-12:]:
            return True
        print(f"    ⚠ 尾字截断(尾部='...{got[-8:]}',缺'{tail}'),重试 {k+1}/{tries-1}")
    print(f"    ⚠ {tries} 次仍疑似截断,保留最后一版(质检会再标)")
    return False

def load_key():
    # 优先环境变量;否则读 skill 根目录的 .env(不进 git,见 .gitignore)
    if os.environ.get("SILICONFLOW_API_KEY"):
        return os.environ["SILICONFLOW_API_KEY"].strip()
    env = pathlib.Path(__file__).resolve().parent.parent / ".env"
    if env.exists():
        for line in env.read_text(encoding="utf-8").splitlines():
            if line.strip().startswith("SILICONFLOW_API_KEY="):
                return line.split("=", 1)[1].strip()
    raise SystemExit("未找到 SILICONFLOW_API_KEY:请设环境变量,或在 skill 根建 .env 写 SILICONFLOW_API_KEY=sk-...")

def tts(text, voice, speed, out_path):
    key = load_key()
    sess = requests.Session(); sess.trust_env = False  # 国内端点绕开 Clash 代理
    r = sess.post("https://api.siliconflow.cn/v1/audio/speech",
        headers={"Authorization": f"Bearer {key}", "Content-Type": "application/json"},
        data=json.dumps({"model": MODEL, "input": text, "voice": f"{MODEL}:{voice}",
                         "response_format": "mp3", "speed": speed}), timeout=120)
    if r.status_code != 200:
        raise SystemExit(f"TTS 失败 {r.status_code}: {r.text[:300]}")
    pathlib.Path(out_path).write_bytes(r.content)

def dur(path):
    out = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries",
        "format=duration", "-of", "csv=p=0", str(path)]).decode().strip()
    return float(out)

def main(project):
    project = pathlib.Path(project)
    cfg = json.loads((project / "src" / "config.json").read_text(encoding="utf-8"))
    fps = cfg.get("fps", 30)
    voice = cfg.get("voice", "alex")
    speed = cfg.get("speed", 1.0)
    vodir = project / "public" / "vo"; vodir.mkdir(parents=True, exist_ok=True)
    manifest = {}
    for i, sc in enumerate(cfg["scenes"]):
        text = sc.get("vo")
        if not text:
            continue
        out = vodir / f"vo{i}.mp3"
        print(f"[{i}] {voice}/{speed}x  {text[:24]}...")
        tts_verified(text, voice, speed, str(out))
        manifest[str(i)] = int(math.ceil(dur(out) * fps))
    (project / "src" / "vo_manifest.json").write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2), encoding="utf-8")
    print("manifest:", manifest)

if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else ".")
