#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""合成 KROX demo 视频音效层 (numpy 合成 -> wav -> ffmpeg mp3)。克制、干净、暖调科技感。"""
import sys, os, subprocess, pathlib
import numpy as np

sys.stdout.reconfigure(encoding="utf-8")
SR = 44100
OUT = pathlib.Path(__file__).parent / "audio" / "sfx"
OUT.mkdir(parents=True, exist_ok=True)

def env(n, a=0.005, d=0.3, curve=5.0):
    """attack-decay 指数包络"""
    t = np.linspace(0, 1, n)
    at = np.clip(t / a, 0, 1)
    de = np.exp(-curve * np.clip((t - a), 0, None) / d)
    return at * de

def tone(freq, dur, a=0.005, d=0.3, curve=5.0, harmonics=(1.0,)):
    n = int(SR * dur)
    t = np.arange(n) / SR
    w = np.zeros(n)
    for k, amp in enumerate(harmonics, 1):
        w += amp * np.sin(2 * np.pi * freq * k * t)
    return w * env(n, a, d, curve)

def noise_sweep(f0, f1, dur, a=0.02, d=0.4):
    n = int(SR * dur)
    rng = np.random.default_rng(7)
    x = rng.standard_normal(n)
    # 简易一阶低通,截止频率线性扫
    cut = np.linspace(f0, f1, n)
    y = np.zeros(n); prev = 0.0
    for i in range(n):
        alpha = cut[i] / (cut[i] + SR / (2 * np.pi))
        prev = prev + alpha * (x[i] - prev)
        y[i] = prev
    y /= (np.max(np.abs(y)) + 1e-9)
    return y * env(n, a, d, 4.0)

def mix(*sigs):
    n = max(len(s) for s in sigs)
    out = np.zeros(n)
    for s in sigs:
        out[:len(s)] += s
    return out

def save(name, sig, gain=0.9):
    sig = sig / (np.max(np.abs(sig)) + 1e-9) * gain
    pcm = (sig * 32767).astype(np.int16)
    wav = OUT / f"{name}.wav"
    import wave
    with wave.open(str(wav), "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes(pcm.tobytes())
    mp3 = OUT / f"{name}.mp3"
    subprocess.run(["ffmpeg", "-y", "-i", str(wav), "-b:a", "128k", str(mp3)],
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    wav.unlink()
    print("OK", mp3.name)

# 1. ping — 节点点亮,清脆短钟(比原来更亮更短)
save("ping", mix(tone(1180, 0.26, a=0.001, d=0.18, harmonics=(1.0, 0.3, 0.1)),
                 0.4 * tone(1760, 0.22, a=0.001, d=0.14)))

# 2. whoosh — 元素进入,清脆短击(不用噪音扫,改高频短钟 tick,干净利落)
save("whoosh", mix(tone(2100, 0.14, a=0.001, d=0.10, curve=6, harmonics=(1.0, 0.28)),
                   0.5 * tone(3150, 0.12, a=0.001, d=0.08, curve=6)), gain=0.55)

# 3. stamp — 盖章,低沉一击
save("stamp", mix(tone(120, 0.28, a=0.001, d=0.18, curve=7, harmonics=(1.0, 0.5)),
                  0.6 * noise_sweep(800, 200, 0.06, a=0.001, d=0.05)))

# 4. ding — 裁决/小收束
save("ding", mix(tone(660, 0.5, d=0.45, harmonics=(1.0, 0.4)),
                 0.5 * tone(990, 0.45, d=0.4)))

# 5. rise — 数字跳动/结果上扬
n = int(SR * 0.9); t = np.arange(n) / SR
sweep = np.sin(2 * np.pi * (300 + 450 * t / 0.9) * t) * env(n, 0.05, 0.9, 2.5)
shimmer = 0.3 * np.sin(2 * np.pi * 1200 * t) * env(n, 0.4, 0.9, 3)
save("rise", sweep + shimmer, gain=0.7)

# 6. chord — 落板暖和弦 (A3 C#4 E4 大三和弦)
freqs = [220.0, 277.18, 329.63]
n = int(SR * 1.6); t = np.arange(n) / SR
pad = sum(np.sin(2 * np.pi * f * t) for f in freqs)
pad *= env(n, 0.12, 1.6, 2.0)
save("chord", pad, gain=0.8)

print("done ->", OUT)
