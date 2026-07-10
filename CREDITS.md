# Credits & Third-Party Licenses / 第三方素材与授权

本项目源码采用 MIT(见 `LICENSE`)。但打包内附的第三方素材各有授权,**再分发或对外发布视频时请遵守**:

## 背景音乐 Background Music
`assets/remotion-template/public/bgm/` 内的 `the_complex.mp3`、`inspired.mp3`:
- **"The Complex" / "Inspired" by Kevin MacLeod (incompetech.com)**
- 授权:**Creative Commons Attribution 4.0 (CC BY 4.0)** — https://creativecommons.org/licenses/by/4.0/
- **用这些曲子对外发布视频时,必须署名**,例如片尾加一行:
  `Music: "The Complex" by Kevin MacLeod (incompetech.com), licensed under CC BY 4.0`
- 不想署名 → 换成 CC0(如 Pixabay Music)曲子放进 `public/bgm/` 即可。

## 字体 Fonts
`assets/remotion-template/public/fonts/` 内的 `NotoSerifSC-*.woff2`:
- **Noto Serif SC**,© Google / Adobe,授权 **SIL Open Font License 1.1**
- 完整协议见 `assets/remotion-template/public/fonts/OFL.txt`
- OFL 允许打包、修改、再分发,附带协议即可。

## 音效 SFX
`public/sfx/*.mp3` 由本项目脚本 `scripts/synth_sfx.py`(numpy 合成)生成,原创,随本项目 MIT 授权。

## 渲染引擎 Remotion
本项目模板基于 **[Remotion](https://www.remotion.dev)** 渲染。**Remotion 有自己的授权条款**:个人与 ≤3 人的团队免费;4 人及以上的营利性公司使用需购买 Remotion 公司 License。**是否需要付费取决于使用者自身情况,请自行到 remotion.dev 确认。** 本项目不代为授予 Remotion 的任何权利。

## 语音合成 TTS
配音由 **SiliconFlow(硅基流动)CosyVoice2** 生成,使用者需自备 API key(见 README)。语音合成结果的可商用性以 SiliconFlow 条款为准。
