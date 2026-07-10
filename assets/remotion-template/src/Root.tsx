import React from 'react';
import {Composition} from 'remotion';
import {Video} from './Video';
import {ASPECTS} from './theme';
import {allDurations} from './timing';
import config from './config.json';
import manifest from './vo_manifest.json';

export const RemotionRoot: React.FC = () => {
  const fps = config.fps || 30;
  const total = allDurations(config.scenes, manifest as Record<string, number>, fps).reduce((a, b) => a + b, 0);
  const {w, h} = ASPECTS[config.aspect || '16:9'] || ASPECTS['16:9'];
  return (
    <Composition
      id="Video"
      component={Video}
      durationInFrames={Math.max(total, 1)}
      fps={fps}
      width={w}
      height={h}
    />
  );
};
