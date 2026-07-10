#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""下载免版权 BGM 到 <project>/public/bgm/。
默认源 = Incompetech(Kevin MacLeod,CC-BY 4.0,需片尾署名)。也可传直链。

用法:
  python fetch_bgm.py <project_dir> <name>          # 从内置候选下载
  python fetch_bgm.py <project_dir> <name> <url>    # 自定义直链
  python fetch_bgm.py --list                         # 看内置候选

内置候选(Incompetech,风格提示):
  the_complex  脉冲科技感(分析/推理,会 build)
  inspired     暖调钢琴上扬(希望/结果)
  ether        空灵氛围(留白/柔和)
  cipher       悬念电子(紧张/揭示)
  ※ 模板已自带 the_complex / inspired,一般无需再下。
"""
import sys, pathlib, requests

CANDIDATES = {
    "the_complex": "https://incompetech.com/music/royalty-free/mp3-royaltyfree/The%20Complex.mp3",
    "inspired": "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Inspired.mp3",
    "ether": "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Ether.mp3",
    "cipher": "https://incompetech.com/music/royalty-free/mp3-royaltyfree/Cipher2.mp3",
}
UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0 Safari/537.36"}

def main(argv):
    if argv and argv[0] == "--list":
        for k, v in CANDIDATES.items():
            print(f"{k:14} {v}")
        return
    project, name = pathlib.Path(argv[0]), argv[1]
    url = argv[2] if len(argv) > 2 else CANDIDATES.get(name)
    if not url:
        raise SystemExit(f"未知候选 {name};传直链或用 --list 查看")
    out = project / "public" / "bgm" / f"{name}.mp3"
    out.parent.mkdir(parents=True, exist_ok=True)
    # 国外站,走系统代理(trust_env 默认 True)
    r = requests.get(url, headers=UA, timeout=120)
    if r.status_code != 200:
        raise SystemExit(f"下载失败 {r.status_code}")
    out.write_bytes(r.content)
    print(f"OK {name}.mp3 ({len(r.content)//1024} KB) -> {out}")
    print("⚠️ Incompetech = CC-BY 4.0,对外发布片尾需署名:Music by Kevin MacLeod (incompetech.com), CC BY 4.0")

if __name__ == "__main__":
    main(sys.argv[1:])
