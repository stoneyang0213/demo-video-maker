#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""从 skill 模板脚手一个新视频工程。
用法:
  python new_project.py <target_dir> [--node-modules-from <existing_remotion_project>]

做的事:
  1. 拷 assets/remotion-template/* -> target(含自带 bgm/sfx、package.json 等)
  2. src/config.example.json -> src/config.json(起始内容,之后编辑它)
  3. 写空 src/vo_manifest.json = {}(tts.py 会覆盖)
  4. 依赖:优先 junction 复用已有工程的 node_modules(快);否则提示 npm install
"""
import sys, os, shutil, json, pathlib, subprocess

SKILL = pathlib.Path(__file__).resolve().parent.parent
TEMPLATE = SKILL / "assets" / "remotion-template"

def main(argv):
    target = pathlib.Path(argv[0]).resolve()
    nm_from = None
    if "--node-modules-from" in argv:
        nm_from = pathlib.Path(argv[argv.index("--node-modules-from") + 1]).resolve()

    target.mkdir(parents=True, exist_ok=True)
    for item in TEMPLATE.iterdir():
        dst = target / item.name
        if item.is_dir():
            shutil.copytree(item, dst, dirs_exist_ok=True)
        else:
            shutil.copy2(item, dst)
    # 起始 config
    ex = target / "src" / "config.example.json"
    cfg = target / "src" / "config.json"
    if ex.exists() and not cfg.exists():
        shutil.copy2(ex, cfg)
    # 空 manifest
    (target / "src" / "vo_manifest.json").write_text("{}", encoding="utf-8")
    print(f"工程已建: {target}")

    nm = target / "node_modules"
    if nm.exists():
        print("node_modules 已存在,跳过")
    elif nm_from and (nm_from / "node_modules").exists():
        src = nm_from / "node_modules"
        try:
            if os.name == "nt":
                subprocess.run(["cmd", "/c", "mklink", "/J", str(nm), str(src)], check=True)
            else:
                os.symlink(src, nm)
            print(f"node_modules 已 junction 复用: {src}")
        except Exception as e:
            print(f"junction 失败({e}),请手动 cd {target} && npm install")
    else:
        print(f"下一步依赖: cd {target} && npm install  (或传 --node-modules-from 复用已有 Remotion 工程)")

if __name__ == "__main__":
    if not sys.argv[1:]:
        print("用法: python new_project.py <target_dir> [--node-modules-from <existing_remotion_project>]"); sys.exit(1)
    main(sys.argv[1:])
