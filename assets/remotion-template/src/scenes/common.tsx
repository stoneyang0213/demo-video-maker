import React, {createContext, useContext} from 'react';
import {AbsoluteFill, Sequence, Audio, staticFile, useCurrentFrame, useVideoConfig, interpolate, spring, Easing} from 'remotion';
import type {Theme} from '../theme';

/* 主题 + 画布尺寸通过 context 传递,避免层层 props */
export const Ctx = createContext<{t: Theme; W: number; Hh: number; sfx: boolean; brand: string; watermark?: string}>(null as any);
export const useT = () => useContext(Ctx);

/* 打字机 */
export const Type: React.FC<{text: string; start?: number; cps?: number; style?: any; caret?: string}> = ({text, start = 0, cps = 18, style, caret}) => {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const {t} = useT();
  const chars = Math.max(0, Math.floor(((frame - start) / fps) * cps));
  const done = chars >= text.length; const blink = Math.floor(frame / 14) % 2 === 0;
  return <span style={style}>{text.slice(0, chars)}{!done ? <span style={{color: caret || t.accent, opacity: blink ? 1 : 0.2}}>▌</span> : null}</span>;
};

/* 数字滚动 */
export const CountUp: React.FC<{from: number; to: number; start: number; dur: number; digits?: number; style?: any}> = ({from, to, start, dur, digits = 0, style}) => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return <span style={style}>{(from + (to - from) * p).toFixed(digits)}</span>;
};

export const fadeUp = (frame: number, start: number, dist = 22, dur = 18) => {
  const p = interpolate(frame, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return {opacity: p, transform: `translateY(${(1 - p) * dist}px)`};
};

// 电影感入场:模糊消散 + 轻微上移 + 缩放,给大标题/关键元素用
export const revealCine = (frame: number, start: number, dur = 26) => {
  const p = interpolate(frame, [start, start + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return {opacity: p, filter: `blur(${(1 - p) * 9}px)`, transform: `translateY(${(1 - p) * 22}px) scale(${0.972 + 0.028 * p})`};
};

const hexA = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
};
const NOISE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

// 氛围背景层:渐变光晕 + 结构网格 + 暗角 + 颗粒纹理(治"平底 PPT 味")
export const BgFx: React.FC = () => {
  const {t} = useT();
  const frame = useCurrentFrame();
  const drift = Math.sin(frame / 90) * 2.5;
  const g1 = hexA(t.accent, t.dark ? 0.18 : 0.10);
  const g2 = hexA(t.dark ? t.accent : t.ink, t.dark ? 0.07 : 0.04);
  const grid = t.dark ? 'rgba(255,255,255,0.026)' : 'rgba(20,20,19,0.035)';
  const mask = 'radial-gradient(ellipse 75% 70% at center, black 38%, transparent 88%)';
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: t.bg}} />
      <AbsoluteFill style={{background:
        `radial-gradient(58% 54% at ${22 + drift}% 20%, ${g1} 0%, transparent 62%),` +
        `radial-gradient(52% 50% at ${80 - drift}% 84%, ${g2} 0%, transparent 60%)`}} />
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${grid} 1px, transparent 1px), linear-gradient(90deg, ${grid} 1px, transparent 1px)`,
        backgroundSize: '72px 72px', maskImage: mask, WebkitMaskImage: mask}} />
      {t.dark && <AbsoluteFill style={{background: 'radial-gradient(ellipse 80% 75% at 50% 42%, transparent 50%, rgba(0,0,0,0.55) 100%)'}} />}
      <AbsoluteFill style={{backgroundImage: `url("${NOISE}")`, opacity: t.dark ? 0.05 : 0.04, mixBlendMode: t.dark ? 'screen' : 'multiply'}} />
    </AbsoluteFill>
  );
};

/* 音效点(config.sfx 为 false 时不触发) */
export const Sfx: React.FC<{name: string; at: number; vol?: number}> = ({name, at, vol = 0.18}) => {
  const {sfx} = useT();
  if (!sfx) return null;
  return <Sequence from={at} durationInFrames={120}><Audio src={staticFile(`sfx/${name}.mp3`)} volume={vol} /></Sequence>;
};

/* 角标 + 顶标 */
export const Watermark: React.FC = () => {
  const {t, watermark} = useT();
  if (!watermark) return null;
  return <div style={{position: 'absolute', right: 34, bottom: 26, fontFamily: t.mono, fontSize: 15, letterSpacing: 2, color: t.faint, border: `1px solid ${t.cardLine}`, padding: '5px 12px', borderRadius: 4}}>{watermark}</div>;
};
export const TopBrand: React.FC = () => {
  const {t, brand} = useT();
  if (!brand) return null;
  return <div style={{position: 'absolute', left: 44, top: 34, display: 'flex', alignItems: 'center', gap: 10}}>
    <div style={{width: 9, height: 9, background: t.danger, borderRadius: 2}} />
    <div style={{fontFamily: t.mono, fontSize: 16, letterSpacing: 5, color: t.soft}}>{brand}</div>
  </div>;
};

/* 居中舞台 */
export const Stage: React.FC<{children: any; w?: number; align?: string}> = ({children, w = 1500, align = 'stretch'}) => {
  const {t} = useT();
  return <AbsoluteFill style={{fontFamily: t.sans, justifyContent: 'center', alignItems: 'center'}}>
    <BgFx />
    <div style={{width: w, maxWidth: '86%', display: 'flex', flexDirection: 'column', alignItems: align as any, position: 'relative'}}>{children}</div>
    <TopBrand /><Watermark />
  </AbsoluteFill>;
};

export const Hd: React.FC<{children: any; style?: any}> = ({children, style}) => {
  const {t} = useT();
  return <div style={{fontFamily: t.display || t.sans, fontWeight: 700, color: t.ink, ...style}}>{children}</div>;
};

/* 可选人格锚(agent 演示用;六边处理核+旋转轨道) */
export const Persona: React.FC<{scale?: number; active?: boolean; label?: string}> = ({scale = 1, active = true, label}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  const rot = (frame * 1.3) % 360; const pulse = 0.5 + Math.sin(frame / 11) * 0.5; const glow = active ? 1 : 0.35;
  const HEX = '95,65 80,91 50,91 35,65 50,39 80,39'; const a = t.accent;
  return <div style={{textAlign: 'center', transform: `scale(${scale})`}}>
    <svg width={132} height={132} viewBox="0 0 130 130" style={{margin: '0 auto', display: 'block'}}>
      <defs>
        <radialGradient id="pcore" cx="50%" cy="42%" r="65%"><stop offset="0%" stopColor={t.bg2} /><stop offset="100%" stopColor={t.bg} /></radialGradient>
        <filter id="pglow" x="-60%" y="-60%" width="220%" height="220%"><feDropShadow dx="0" dy="0" stdDeviation={7 * glow} floodColor={a} floodOpacity={0.6 * glow} /></filter>
      </defs>
      <g transform={`rotate(${rot} 65 65)`} opacity={0.55 * glow}><circle cx="65" cy="65" r="56" fill="none" stroke={a} strokeWidth="1.4" strokeDasharray="3 11" /></g>
      <g transform={`rotate(${-rot * 1.7} 65 65)`}><circle cx="65" cy="9" r="3.6" fill={a} opacity={glow} /></g>
      <polygon points={HEX} fill="url(#pcore)" stroke={a} strokeWidth="1.6" filter="url(#pglow)" opacity={0.5 + 0.5 * glow} />
      <circle cx="65" cy="65" r={9 + 3 * pulse} fill={a} opacity={0.30 + 0.4 * pulse * glow} />
      <circle cx="65" cy="65" r="4.5" fill="#FFFFFF" opacity={glow} />
    </svg>
    {label && <div style={{marginTop: 8, fontFamily: t.sans, fontSize: 18, color: t.ink, letterSpacing: 1}}>{label}</div>}
  </div>;
};

export {spring, interpolate, Easing, useCurrentFrame};
