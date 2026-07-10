/* 主题预设 + 解析。config.theme 选预设名,config.themeOverrides 覆盖任意字段。 */

export type Theme = {
  dark: boolean;       // 明暗(背景氛围层用:暗色加 vignette、亮色减弱)
  bg: string; bg2: string;
  ink: string; soft: string; faint: string;
  accent: string;      // 主强调(点亮/边框/数字)
  accentSoft: string;  // 主强调淡背景
  accentLine: string;  // 主强调描边
  danger: string;      // 红(结论/盖章/风险)
  blue: string;        // 蓝方/对比
  redd: string;        // 红方
  ok: string;          // 绿(结果上扬)
  card: string; cardLine: string;
  sans: string; mono: string;
  display?: string;    // 大标题字体(高级/编辑感,思源宋体)
};

const SANS = "'Microsoft YaHei','PingFang SC','Hiragino Sans GB',sans-serif";
const MONO = "'Cascadia Code','Consolas',monospace";

export const PRESETS: Record<string, Theme> = {
  // 暖黑 · 编辑感(KROX/BP 风,融资/高端产品演示)
  'warm-dark': {
    dark: true,
    bg: '#0E0E10', bg2: '#17171B', ink: '#F5F5F2',
    soft: 'rgba(245,245,242,0.58)', faint: 'rgba(245,245,242,0.30)',
    accent: '#E9A23B', accentSoft: 'rgba(233,162,59,0.16)', accentLine: 'rgba(233,162,59,0.40)',
    danger: '#D93A2B', blue: '#5B8DEF', redd: '#E0574A', ok: '#3FB984',
    card: 'rgba(255,255,255,0.05)', cardLine: 'rgba(255,255,255,0.10)', sans: SANS, mono: MONO,
  },
  // 午夜蓝 · 科技(SaaS/工具/数据产品)
  'midnight': {
    dark: true,
    bg: '#0A0F1A', bg2: '#111A2B', ink: '#EAF1FB',
    soft: 'rgba(234,241,251,0.60)', faint: 'rgba(234,241,251,0.30)',
    accent: '#3DD3E0', accentSoft: 'rgba(61,211,224,0.14)', accentLine: 'rgba(61,211,224,0.40)',
    danger: '#FF6B6B', blue: '#5B8DEF', redd: '#FF8A5B', ok: '#4ADE80',
    card: 'rgba(255,255,255,0.05)', cardLine: 'rgba(255,255,255,0.10)', sans: SANS, mono: MONO,
  },
  // 暖纸 · warm-editorial(stoneyang 品牌美学:暖奶油底 + 珊瑚主色,禁纯白/冷灰)
  'clean-light': {
    dark: false,
    bg: '#faf9f5', bg2: '#fffefb', ink: '#141413',
    soft: 'rgba(20,20,19,0.58)', faint: 'rgba(20,20,19,0.26)',
    accent: '#cc785c', accentSoft: 'rgba(204,120,92,0.10)', accentLine: 'rgba(204,120,92,0.30)',
    danger: '#b23b2e', blue: '#3b6ea5', redd: '#c15b4a', ok: '#3f7d5a',
    card: 'rgba(20,20,19,0.025)', cardLine: 'rgba(20,20,19,0.10)', sans: SANS, mono: MONO,
  },
};

const DISPLAY = "'Noto Serif SC','Source Han Serif SC','Songti SC',Georgia,serif";

export function resolveTheme(name?: string, overrides?: Partial<Theme>): Theme {
  const base = PRESETS[name || 'warm-dark'] || PRESETS['warm-dark'];
  return {display: DISPLAY, ...base, ...(overrides || {})};
}

export const ASPECTS: Record<string, {w: number; h: number}> = {
  '16:9': {w: 1920, h: 1080},
  '9:16': {w: 1080, h: 1920},
  '1:1': {w: 1080, h: 1080},
};
