import type { FontDef } from './presets';

// 已加载的字体缓存（避免重复加载）
const loadedFonts = new Set<string>();

/**
 * 加载预设字体（Google Fonts / 内置中文）
 * 返回 Promise，resolve 时字体已真正可用（否则 Canvas 绘制会用 fallback）
 */
export async function loadPresetFont(font: FontDef): Promise<void> {
  const cacheKey = `${font.source}:${font.family}`;
  if (loadedFonts.has(cacheKey)) return;

  if (font.source === 'google' || font.source === 'builtin-cn') {
    const url = font.cssUrl ||
      `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, '+')}:wght@${(font.weights || [400]).join(';')}&display=swap`;

    // 注入 <link> 标签
    if (!document.querySelector(`link[data-font="${font.family}"]`)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute('data-font', font.family);
      document.head.appendChild(link);
    }

    // 等字体真正下载完成（关键 —— 不等会导致 Canvas 渲染用 fallback 字体）
    await document.fonts.load(`16px "${font.family}"`);
    await document.fonts.ready;
  }

  loadedFonts.add(cacheKey);
}

/**
 * 加载用户上传的自定义字体
 * 支持 TTF / OTF / WOFF / WOFF2
 */
export async function loadCustomFont(file: File): Promise<FontDef> {
  const family = file.name.replace(/\.(ttf|otf|woff2?|eot)$/i, '');
  const url = URL.createObjectURL(file);

  const fontFace = new FontFace(family, `url(${url})`);
  await fontFace.load();
  (document.fonts as any).add(fontFace);

  loadedFonts.add(`custom:${family}`);

  return {
    family,
    displayName: family,
    source: 'custom',
    weights: [400],
  };
}

/**
 * 同步检查字体是否已加载（Fabric 绘制前用）
 */
export function isFontLoaded(family: string): boolean {
  return document.fonts.check(`16px "${family}"`);
}
