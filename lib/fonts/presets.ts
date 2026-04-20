// 三层字体架构：
// Tier 1 - 内置中文字体（CDN 加载，免费商用）
// Tier 2 - Google Fonts（英文为主，WebFontLoader 动态加载）
// Tier 3 - 用户上传 TTF/OTF（通过 FontFace API 注入）

export type FontSource = 'builtin-cn' | 'google' | 'custom';

export interface FontDef {
  family: string;         // CSS font-family 值
  displayName: string;    // UI 展示名
  source: FontSource;
  weights?: number[];     // 可用字重
  cssUrl?: string;        // 外链 CSS（仅 builtin-cn 需要）
}

// 内置中文字体 —— 全部免费商用，通过 cdn.jsdelivr.net / 阿里字体 CDN 加载
export const BUILTIN_CN_FONTS: FontDef[] = [
  {
    family: 'Noto Sans SC',
    displayName: '思源黑体',
    source: 'builtin-cn',
    weights: [300, 400, 500, 700, 900],
    cssUrl: 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&display=swap',
  },
  {
    family: 'Noto Serif SC',
    displayName: '思源宋体',
    source: 'builtin-cn',
    weights: [400, 500, 700, 900],
    cssUrl: 'https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;500;700;900&display=swap',
  },
  {
    family: 'ZCOOL KuaiLe',
    displayName: '站酷快乐体',
    source: 'builtin-cn',
    weights: [400],
    cssUrl: 'https://fonts.googleapis.com/css2?family=ZCOOL+KuaiLe&display=swap',
  },
  {
    family: 'ZCOOL XiaoWei',
    displayName: '站酷小薇',
    source: 'builtin-cn',
    weights: [400],
    cssUrl: 'https://fonts.googleapis.com/css2?family=ZCOOL+XiaoWei&display=swap',
  },
  {
    family: 'ZCOOL QingKe HuangYou',
    displayName: '站酷庆科黄油体',
    source: 'builtin-cn',
    weights: [400],
    cssUrl: 'https://fonts.googleapis.com/css2?family=ZCOOL+QingKe+HuangYou&display=swap',
  },
  {
    family: 'Ma Shan Zheng',
    displayName: '马善政毛笔楷书',
    source: 'builtin-cn',
    weights: [400],
    cssUrl: 'https://fonts.googleapis.com/css2?family=Ma+Shan+Zheng&display=swap',
  },
  {
    family: 'Long Cang',
    displayName: '龙藏体',
    source: 'builtin-cn',
    weights: [400],
    cssUrl: 'https://fonts.googleapis.com/css2?family=Long+Cang&display=swap',
  },
];

// 常用英文字体预设（全部通过 Google Fonts 加载）
export const BUILTIN_EN_FONTS: FontDef[] = [
  { family: 'Inter', displayName: 'Inter', source: 'google', weights: [300, 400, 500, 700, 900] },
  { family: 'Bebas Neue', displayName: 'Bebas Neue', source: 'google', weights: [400] },
  { family: 'Oswald', displayName: 'Oswald', source: 'google', weights: [300, 400, 500, 700] },
  { family: 'Anton', displayName: 'Anton', source: 'google', weights: [400] },
  { family: 'Archivo Black', displayName: 'Archivo Black', source: 'google', weights: [400] },
  { family: 'Montserrat', displayName: 'Montserrat', source: 'google', weights: [300, 400, 500, 700, 900] },
  { family: 'Playfair Display', displayName: 'Playfair Display', source: 'google', weights: [400, 700, 900] },
  { family: 'Space Mono', displayName: 'Space Mono', source: 'google', weights: [400, 700] },
  { family: 'Rajdhani', displayName: 'Rajdhani', source: 'google', weights: [300, 400, 500, 700] },
  { family: 'Orbitron', displayName: 'Orbitron', source: 'google', weights: [400, 500, 700, 900] },
];

export const ALL_BUILTIN_FONTS = [...BUILTIN_CN_FONTS, ...BUILTIN_EN_FONTS];
