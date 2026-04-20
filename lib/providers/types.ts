// 所有图像生成 Provider 的统一接口
// 接新 Provider（Liblib、LibTV、Coze、ComfyUI）时只需实现这个接口，前端零改动

export type AspectRatio = '9:16' | '3:4' | '16:9' | '1:1';

export interface GenerateParams {
  prompt: string;
  aspectRatio: AspectRatio;
  referenceImages?: string[]; // base64 data url
  count?: number;
  seed?: number;
  negativePrompt?: string;
}

export interface GenerateResult {
  images: { url: string; seed?: number }[];
  provider: string;
  cost?: number;
  raw?: unknown;
}

export interface ImageProvider {
  name: string;
  displayName: string;
  generate(params: GenerateParams): Promise<GenerateResult>;
}

// 尺寸映射：封面实际输出像素（越大越清晰但越慢）
export const ASPECT_TO_SIZE: Record<AspectRatio, { width: number; height: number }> = {
  '9:16': { width: 1080, height: 1920 },
  '3:4': { width: 1200, height: 1600 },
  '16:9': { width: 1920, height: 1080 },
  '1:1': { width: 1440, height: 1440 },
};
