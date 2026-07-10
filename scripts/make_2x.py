#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从成片生成加速版(快进 teaser),音画同步、音调不变。
用法: python make_2x.py <in.mp4> <out.mp4> [factor=2.0]
factor=2.0 即 2 倍速(83s -> ~41s)。atempo 保持音调,>2.0 会自动链式。
"""
import sys, subprocess

def atempo_chain(f):
    parts = []
    while f > 2.0:
        parts.append("atempo=2.0"); f /= 2.0
    while f < 0.5:
        parts.append("atempo=0.5"); f /= 0.5
    parts.append(f"atempo={f:.4f}")
    return ",".join(parts)

def main(inp, outp, factor=2.0):
    factor = float(factor)
    vf = f"setpts={1.0/factor:.4f}*PTS"
    af = atempo_chain(factor)
    cmd = ["ffmpeg", "-y", "-i", inp, "-filter_complex",
           f"[0:v]{vf}[v];[0:a]{af}[a]", "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-preset", "medium", "-crf", "20", "-c:a", "aac", outp]
    subprocess.run(cmd, check=True)
    print("OK ->", outp)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("用法: python make_2x.py <in.mp4> <out.mp4> [factor=2.0]"); sys.exit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else 2.0)
