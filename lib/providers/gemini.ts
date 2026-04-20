import { GoogleGenAI, Modality } from '@google/genai';
import type { GenerateParams, GenerateResult, ImageProvider } from './types';
import { ASPECT_TO_SIZE } from './types';

// Gemini 2.5 Flash Image（原 Nano Banana）
// 文档：https://ai.google.dev/gemini-api/docs/image-generation
// 定价：$0.039 / 张（1024x1024 级别）

const MODEL = 'gemini-2.5-flash-image';

export class GeminiProvider implements ImageProvider {
  name = 'gemini';
  displayName = 'Gemini 2.5 Flash Image';

  private client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');
    this.client = new GoogleGenAI({ apiKey });
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const { prompt, aspectRatio, referenceImages = [], count = 1 } = params;
    const size = ASPECT_TO_SIZE[aspectRatio];

    // Gemini 不接受精确像素尺寸，通过 prompt 描述比例
    const ratioHint = `Output image in ${aspectRatio} aspect ratio (${size.width}x${size.height}).`;
    const fullPrompt = `${prompt}\n\n${ratioHint}`;

    // 构建多模态 contents
    const parts: any[] = [{ text: fullPrompt }];
    for (const imgDataUrl of referenceImages) {
      const match = imgDataUrl.match(/^data:(.+?);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: { mimeType: match[1], data: match[2] },
        });
      }
    }

    const images: { url: string; seed?: number }[] = [];

    // Gemini 单次请求返回 1 张，需要的话并发多次
    const tasks = Array.from({ length: count }, () =>
      this.client.models.generateContent({
        model: MODEL,
        contents: [{ role: 'user', parts }],
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      }),
    );

    const responses = await Promise.all(tasks);

    for (const resp of responses) {
      const candidates = resp.candidates ?? [];
      for (const cand of candidates) {
        for (const part of cand.content?.parts ?? []) {
          if (part.inlineData?.data) {
            const mime = part.inlineData.mimeType || 'image/png';
            images.push({
              url: `data:${mime};base64,${part.inlineData.data}`,
            });
          }
        }
      }
    }

    if (images.length === 0) {
      throw new Error('Gemini returned no images. Check prompt safety or API quota.');
    }

    return {
      images,
      provider: this.name,
      cost: images.length * 0.039,
    };
  }
}
