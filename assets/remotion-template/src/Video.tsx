import React from 'react';
import {AbsoluteFill, Series, Sequence, Audio, staticFile, interpolate} from 'remotion';
import {resolveTheme} from './theme';
import {FontLoader} from './fonts';
import {Ctx} from './scenes/common';
import {REGISTRY} from './scenes';
import {allDurations} from './timing';
import config from './config.json';
import manifest from './vo_manifest.json';

export const Video: React.FC = () => {
  const fps = config.fps || 30;
  const t = resolveTheme(config.theme, config.themeOverrides);
  const durs = allDurations(config.scenes, manifest as Record<string, number>, fps);
  const total = durs.reduce((a, b) => a + b, 0);
  const base = config.bgmVolume ?? 0.10;
  const bgm = config.bgm && config.bgm !== 'none' ? config.bgm : null;

  return (
    <Ctx.Provider value={{t, W: 0, Hh: 0, sfx: config.sfx !== false, brand: config.brand || '', watermark: config.watermark}}>
      <AbsoluteFill style={{background: t.bg}}>
        <FontLoader />
        {bgm && (
          <Audio
            src={staticFile(`bgm/${bgm}.mp3`)}
            volume={(f) =>
              // 恒定垫音:淡入后一直保持 base(连续托住旁白停顿,不忽高忽低致"断掉感"),结尾淡出
              interpolate(
                f,
                [0, 45, total - 40, total],
                [0, base, base, 0],
                {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}
              )
            }
          />
        )}
        <Series>
          {config.scenes.map((s: any, i: number) => {
            const Comp = REGISTRY[s.type];
            const hasVo = (manifest as any)[String(i)] > 0;
            return (
              <Series.Sequence key={i} durationInFrames={durs[i]}>
                {Comp ? <Comp data={s} /> : <AbsoluteFill style={{background: t.bg, color: t.danger, fontSize: 30, alignItems: 'center', justifyContent: 'center'}}>未知幕类型: {s.type}</AbsoluteFill>}
                {hasVo && (
                  <Sequence from={10}>
                    <Audio src={staticFile(`vo/vo${i}.mp3`)} volume={config.voVolume ?? 1} />
                  </Sequence>
                )}
              </Series.Sequence>
            );
          })}
        </Series>
      </AbsoluteFill>
    </Ctx.Provider>
  );
};

export {allDurations};
