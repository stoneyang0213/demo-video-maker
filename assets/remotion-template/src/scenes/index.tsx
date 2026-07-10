import React from 'react';
import {useCurrentFrame, spring, interpolate, Easing} from 'remotion';
import {useT, Stage, Hd, Type, CountUp, fadeUp, revealCine, Sfx, Persona, BgFx, TopBrand, Watermark} from './common';

/* kicker:短 accent 线 + mono 小标(signature 元素) */
const Kicker: React.FC<{text: string; color?: string; center?: boolean; start?: number}> = ({text, color, center, start = 4}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  const w = interpolate(frame, [start, start + 18], [0, 34], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <div style={{...fadeUp(frame, start), display: 'flex', alignItems: 'center', gap: 12, justifyContent: center ? 'center' : 'flex-start', marginBottom: 18}}>
      <div style={{width: w, height: 2, background: color || t.accent}} />
      <div style={{color: color || t.accent, fontFamily: t.mono, fontSize: 16, letterSpacing: 3}}>{text}</div>
    </div>
  );
};

/* 颜色名 -> 主题色,或直接 hex */
const col = (t: any, c?: string) => (c && t[c] ? t[c] : (c || t.accent));

/* ---------- title:封面/落板/标题幕 ---------- */
const Title: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  return (
    <Stage w={data.w || 1180} align="center">
      {data.kicker && <Kicker text={data.kicker} color={col(t, data.kickerColor)} center start={6} />}
      <Hd style={{...revealCine(frame, 12), fontSize: data.big ? 68 : 56, fontWeight: 700, lineHeight: 1.2, textAlign: 'center'}}>{data.title}</Hd>
      {data.subtitle && <Hd style={{...fadeUp(frame, 28), fontSize: data.big ? 38 : 32, fontWeight: 500, lineHeight: 1.35, color: t.soft, textAlign: 'center', marginTop: 14}}>{data.subtitle}</Hd>}
      {data.tagline && <div style={{...fadeUp(frame, 44), marginTop: 30, fontSize: 19, color: t.faint, fontFamily: t.mono, letterSpacing: 2, textAlign: 'center'}}>{data.tagline}</div>}
    </Stage>
  );
};

/* ---------- quote:引用/用户原话(打字机) ---------- */
const Quote: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  return (
    <Stage w={data.w || 1100} align="center">
      {data.title && <Hd style={{...fadeUp(frame, 6), fontSize: 40, textAlign: 'center', marginBottom: 30}}>{data.title}</Hd>}
      <div style={{...fadeUp(frame, 20), background: t.bg2, borderLeft: `3px solid ${t.accent}`, borderRadius: 8, padding: '24px 30px', textAlign: 'left', width: '100%'}}>
        {data.label && <div style={{fontSize: 15, color: t.accent, fontFamily: t.mono, marginBottom: 10}}>{data.label}</div>}
        <div style={{fontSize: 27, lineHeight: 1.5, color: t.ink}}><Type start={12} cps={data.cps || 20} text={data.text} /></div>
      </div>
    </Stage>
  );
};

/* ---------- bullets:要点列表 + 可选盖章 ---------- */
const Bullets: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  const stamp = data.stamp ? spring({frame: frame - (data.stamp.at ?? 150), fps: 30, config: {damping: 12}}) : 0;
  return (
    <Stage w={data.w || 900} align="center">
      {data.stamp && <Sfx name="stamp" at={data.stamp.at ?? 150} vol={0.28} />}
      {data.label && <div style={{...fadeUp(frame, 6), alignSelf: 'flex-start', color: t.soft, fontFamily: t.mono, fontSize: 18, letterSpacing: 2, marginBottom: 20}}>{data.label}</div>}
      <div style={{position: 'relative', width: '100%'}}>
        <div style={{background: t.card, border: `1px solid ${t.cardLine}`, borderRadius: 14, padding: 40}}>
          {data.items.map((l: string, i: number) => (
            <div key={i} style={{...fadeUp(frame, 24 + i * 18), fontSize: 30, color: t.soft, marginBottom: 22, display: 'flex', gap: 14}}>
              <span style={{color: t.faint}}>·</span>{l}
            </div>
          ))}
        </div>
        {data.stamp && (
          <div style={{position: 'absolute', left: '50%', top: '55%', transform: `translate(-50%,-50%) rotate(-9deg) scale(${stamp})`, opacity: stamp}}>
            <div style={{border: `4px solid ${col(t, data.stamp.color || 'danger')}`, color: col(t, data.stamp.color || 'danger'), fontWeight: 900, fontSize: 60, padding: '10px 34px', borderRadius: 10, letterSpacing: 4, whiteSpace: 'nowrap'}}>{data.stamp.text}</div>
          </div>
        )}
      </div>
    </Stage>
  );
};

/* ---------- breakdown:结论 + 分层节点(思维链/步骤/五维) ---------- */
const Breakdown: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  const concl = data.heading ? spring({frame: frame - 20, fps: 30, config: {damping: 18}}) : 0;
  const step = data.step ?? 70;
  return (
    <Stage w={data.w || 1520}>
      {data.nodes.map((_: any, i: number) => <Sfx key={i} name="ping" at={70 + i * step} vol={0.15} />)}
      <div style={{display: 'flex', gap: 46, alignItems: 'flex-start'}}>
        {data.persona && <div style={{width: 150, flexShrink: 0, paddingTop: 12}}><Persona active label={data.persona} /></div>}
        <div style={{flex: 1}}>
          {data.heading && (
            <div style={{opacity: concl, transform: `translateY(${(1 - concl) * 20}px)`, marginBottom: 30}}>
              {data.headingLabel && <div style={{color: t.accent, fontFamily: t.mono, fontSize: 15, letterSpacing: 2, marginBottom: 10}}>{data.headingLabel}</div>}
              <Hd style={{fontSize: 33, lineHeight: 1.4}}>{data.heading}</Hd>
            </div>
          )}
          {data.nodes.map((n: any, i: number) => {
            const p = spring({frame: frame - (70 + i * step), fps: 30, config: {damping: 20}});
            return (
              <div key={i} style={{display: 'flex', alignItems: 'center', gap: 18, marginBottom: 15, opacity: p, transform: `translateX(${(1 - p) * 30}px)`}}>
                <div style={{minWidth: 118, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.accentSoft, border: `1px solid ${t.accentLine}`, borderRadius: 8, color: t.accent, fontSize: 22, fontWeight: 700}}>{n.k}</div>
                <div style={{width: 22, height: 2, background: t.accentLine}} />
                <div style={{fontSize: 23, color: t.ink, lineHeight: 1.3, flex: 1}}>{n.v}</div>
              </div>
            );
          })}
        </div>
      </div>
    </Stage>
  );
};

/* ---------- score:打分条 ---------- */
const Score: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  return (
    <Stage w={data.w || 1100} align="center">
      {data.label && <div style={{alignSelf: 'flex-start', color: t.accent, fontFamily: t.mono, fontSize: 15, letterSpacing: 2, marginBottom: 24}}>{data.label}</div>}
      <div style={{width: '100%'}}>
        {data.bars.map((b: any, i: number) => {
          const s = 20 + i * 24;
          const p = interpolate(frame, [s, s + 26], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
          const c = col(t, b.color);
          return (
            <div key={i} style={{marginBottom: 26}}>
              <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 22, color: t.ink}}>
                <span>{b.label}</span>
                <span style={{fontFamily: t.mono, color: c, fontWeight: 700}}><CountUp from={0} to={b.score} start={s} dur={26} digits={1} /> / 10</span>
              </div>
              <div style={{height: 12, background: 'rgba(128,128,128,0.18)', borderRadius: 6, overflow: 'hidden'}}>
                <div style={{height: '100%', width: `${p * b.score * 10}%`, background: c, borderRadius: 6, boxShadow: `0 0 14px ${c}`}} />
              </div>
            </div>
          );
        })}
      </div>
    </Stage>
  );
};

/* ---------- debate:红蓝对抗 + 裁决 + 依据卡 ---------- */
const Debate: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  return (
    <Stage w={data.w || 1300}>
      {(data.sides || []).map((_: any, i: number) => <Sfx key={i} name="ping" at={100 + i * 45} vol={0.16} />)}
      {data.verdict && <Sfx name="ding" at={data.verdictAt ?? 195} vol={0.2} />}
      {(data.evidence || []).map((_: any, i: number) => <Sfx key={'e' + i} name="whoosh" at={(data.evidenceAt ?? 240) + i * 25} />)}
      {data.label && <div style={{color: t.accent, fontFamily: t.mono, fontSize: 15, letterSpacing: 2, marginBottom: 16}}>{data.label}</div>}
      {(data.sides || []).map((s: any, i: number) => {
        const p = spring({frame: frame - (100 + i * 45), fps: 30, config: {damping: 16}});
        const c = col(t, s.color);
        return <div key={i} style={{opacity: p, transform: `translateX(${(1 - p) * (i % 2 ? 30 : -30)}px)`, background: `${c}1A`, border: `1px solid ${c}`, borderRadius: 12, padding: '14px 20px', fontSize: 22, color: t.ink, marginBottom: 12}}>
          {s.dot && <span style={{color: c}}>{s.dot} </span>}<b style={{color: c}}>{s.tag}</b>:{s.text}
        </div>;
      })}
      {data.verdict && (() => {
        const p = spring({frame: frame - (data.verdictAt ?? 195), fps: 30, config: {damping: 18}});
        return <div style={{opacity: p, transform: `scale(${0.96 + p * 0.04})`, background: t.accentSoft, border: `1px solid ${t.accentLine}`, borderRadius: 12, padding: '16px 22px', fontSize: 23, color: t.ink}}>
          {data.verdict.dot || '⚖️'} <b style={{color: t.accent}}>{data.verdict.tag}</b>:{data.verdict.text}
        </div>;
      })()}
      {data.evidence && <div style={{marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12}}>
        {data.evidence.map((e: any, i: number) => {
          const p = spring({frame: frame - ((data.evidenceAt ?? 240) + i * 25), fps: 30, config: {damping: 18}});
          return <div key={i} style={{display: 'flex', gap: 14, alignItems: 'flex-start', background: t.accentSoft, border: `1px solid ${t.accentLine}`, borderRadius: 10, padding: '13px 18px', opacity: p, transform: `translateX(${(1 - p) * 40}px)`}}>
            {e.icon ? <div style={{fontSize: 24}}>{e.icon}</div> : <div style={{width: 6, height: 6, borderRadius: '50%', background: t.accent, marginTop: 9}} />}
            <div><div style={{color: t.accent, fontFamily: t.mono, fontSize: 14, letterSpacing: 1, marginBottom: 3}}>{e.label}</div><div style={{color: t.ink, fontSize: 20, lineHeight: 1.35}}>{e.text}</div></div>
          </div>;
        })}
      </div>}
    </Stage>
  );
};

/* ---------- cards:卡片行/列(功能/依据/特性) ---------- */
const Cards: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  return (
    <Stage w={data.w || 1300} align="center">
      {data.cards.map((_: any, i: number) => <Sfx key={i} name="whoosh" at={30 + i * 16} vol={0.32} />)}
      {data.label && <div style={{...fadeUp(frame, 6), color: t.accent, fontFamily: t.mono, fontSize: 16, letterSpacing: 2, marginBottom: 24, textAlign: 'center'}}>{data.label}</div>}
      <div style={{display: 'flex', gap: 26, flexDirection: data.column ? 'column' : 'row', justifyContent: 'center', flexWrap: 'wrap'}}>
        {data.cards.map((c: any, i: number) => (
          <div key={i} style={{...fadeUp(frame, 24 + i * 12), background: t.card, border: `1px solid ${t.cardLine}`, borderRadius: 14, padding: 26, width: data.column ? '100%' : 320}}>
            {c.icon && <div style={{fontSize: 30, marginBottom: 12}}>{c.icon}</div>}
            {c.label && <div style={{color: t.soft, fontFamily: t.mono, fontSize: 15, letterSpacing: 1, marginBottom: 8}}>{c.label}</div>}
            <div style={{fontSize: c.big ? 26 : 21, color: t.ink, lineHeight: 1.4, fontWeight: c.big ? 700 : 400}}>{c.text}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
};

/* ---------- dispatch:指挥官派单(agent 团队/中枢分发) ---------- */
const Dispatch: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  return (
    <Stage w={data.w || 1180} align="center">
      {data.agents.map((_: any, i: number) => <Sfx key={i} name="whoosh" at={40 + i * 30} />)}
      {data.persona && <Persona active label={data.persona} />}
      {data.note && <div style={{...fadeUp(frame, 10), marginTop: 16, marginBottom: 34, fontSize: 22, color: t.soft, textAlign: 'center'}}>{data.note}</div>}
      <div style={{display: 'flex', gap: 60, justifyContent: 'center', flexWrap: 'wrap'}}>
        {data.agents.map((ag: any, i: number) => {
          const p = spring({frame: frame - (40 + i * 30), fps: 30, config: {damping: 18}});
          return <div key={i} style={{width: 500, opacity: p, transform: `translateY(${(1 - p) * 30}px)`, background: t.card, border: `1px solid ${t.accentLine}`, borderRadius: 14, padding: 26}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18}}>
              <div style={{width: 10, height: 10, borderRadius: '50%', background: t.accent}} />
              <div style={{fontSize: 24, fontWeight: 700, color: t.ink}}>{ag.name}</div>
            </div>
            {ag.items.map((it: string, j: number) => (
              <div key={j} style={{...fadeUp(frame, 40 + i * 30 + 18 + j * 12), fontSize: 20, color: t.soft, marginBottom: 12, display: 'flex', gap: 10}}>
                <span style={{color: t.ok}}>✓</span>{it}
              </div>
            ))}
          </div>;
        })}
      </div>
    </Stage>
  );
};

/* ---------- stats:结果数字 + 可选趋势线 ---------- */
const Stats: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  const p = interpolate(frame, [30, 120], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  return (
    <Stage w={data.w || 1080} align="center">
      <Sfx name="ding" at={95} vol={0.18} />
      {data.kicker && <Kicker text={data.kicker} color={col(t, data.kickerColor || 'ok')} center start={6} />}
      {data.title && <Hd style={{...revealCine(frame, 12), fontSize: 48, fontWeight: 700, lineHeight: 1.25, textAlign: 'center', marginBottom: 8}}>{data.title}</Hd>}
      {data.trend && (
        <svg width="820" height="200" style={{marginTop: 30}}>
          <line x1="0" y1="170" x2="820" y2="170" stroke={t.cardLine} strokeWidth="1" />
          <polyline points={`10,160 ${210 * p + 10},${160 - 18 * p} ${420 * p + 10},${160 - 56 * p} ${620 * p + 10},${160 - 108 * p} ${800 * p + 10},${160 - 150 * p}`} fill="none" stroke={t.ok} strokeWidth="4" />
          <circle cx={800 * p + 10} cy={160 - 150 * p} r="7" fill={t.ok} />
        </svg>
      )}
      <div style={{display: 'flex', gap: 30, marginTop: 26, justifyContent: 'center', flexWrap: 'wrap'}}>
        {data.stats.map((m: any, i: number) => (
          <div key={i} style={{...fadeUp(frame, 40 + i * 14), background: t.card, border: `1px solid ${t.cardLine}`, borderRadius: 16, padding: '28px 30px', minWidth: 280}}>
            <div style={{fontSize: 66, fontWeight: 800, color: t.accent, fontFamily: t.mono, letterSpacing: -1, textShadow: t.dark ? `0 0 32px ${t.accentSoft}` : 'none', lineHeight: 1}}>{m.big}</div>
            <div style={{fontSize: 18, color: t.soft, marginTop: 12}}>{m.cap}</div>
          </div>
        ))}
      </div>
    </Stage>
  );
};

/* ---------- scale:规模化网格 + 落板 ---------- */
const Scale: React.FC<{data: any}> = ({data}) => {
  const frame = useCurrentFrame(); const {t} = useT();
  const end = spring({frame: frame - (data.endAt ?? 150), fps: 30, config: {damping: 20}});
  const cols = data.columns || 4;
  return (
    <Stage w={1400} align="center">
      <Sfx name="chord" at={data.endAt ?? 150} vol={0.22} />
      {data.items && <div style={{display: 'grid', gridTemplateColumns: `repeat(${cols},1fr)`, gap: 26, marginBottom: 30, justifyItems: 'center'}}>
        {data.items.map((b: any, i: number) => {
          const p = spring({frame: frame - (20 + i * 8), fps: 30, config: {damping: 16}});
          return <div key={i} style={{opacity: p, transform: `scale(${0.8 + p * 0.2})`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <div style={{width: 52, height: 52, borderRadius: '50%', background: `radial-gradient(circle at 50% 38%, ${t.accent}, ${t.bg2})`, boxShadow: `0 0 16px ${t.accentSoft}`}} />
            <div style={{fontSize: 16, color: t.soft}}>{b.label || b}</div>
          </div>;
        })}
      </div>}
      {(data.lines || []).map((ln: string, i: number) => (
        <Hd key={i} style={{fontSize: 40, textAlign: 'center', color: i === (data.lines.length - 1) ? t.accent : t.ink, ...fadeUp(frame, 100 + i * 15)}}>{ln}</Hd>
      ))}
      {data.brandEnd && <div style={{marginTop: 46, opacity: end, transform: `translateY(${(1 - end) * 16}px)`, textAlign: 'center'}}>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12}}>
          <div style={{width: 11, height: 11, background: t.danger, borderRadius: 2}} />
          <div style={{fontFamily: t.mono, fontSize: 30, letterSpacing: 8, color: t.ink}}>{data.brandEnd}</div>
        </div>
        {data.brandSub && <div style={{fontSize: 18, color: t.soft, marginTop: 12, letterSpacing: 2}}>{data.brandSub}</div>}
      </div>}
    </Stage>
  );
};

export const REGISTRY: Record<string, React.FC<{data: any}>> = {
  title: Title, quote: Quote, bullets: Bullets, breakdown: Breakdown,
  score: Score, debate: Debate, cards: Cards, dispatch: Dispatch, stats: Stats, scale: Scale,
};
