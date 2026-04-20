import type { Canvas } from 'fabric';

/**
 * 从 Fabric Canvas 导出为 PNG / JPG 并触发下载
 * multiplier: 导出倍率（>1 = 超采样，抗锯齿更好但文件更大）
 */
export function exportCanvas(
  canvas: Canvas,
  opts: { format?: 'png' | 'jpeg'; quality?: number; multiplier?: number; filename?: string } = {},
) {
  const { format = 'png', quality = 0.95, multiplier = 2, filename } = opts;

  const dataURL = canvas.toDataURL({
    format,
    quality,
    multiplier,
  });

  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename || `cover-${Date.now()}.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * 导出为 base64（可上传/保存到数据库）
 */
export function canvasToDataURL(canvas: Canvas, multiplier = 2): string {
  return canvas.toDataURL({ format: 'png', multiplier });
}
