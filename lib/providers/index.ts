import type { ImageProvider } from './types';
import { GeminiProvider } from './gemini';
import { LiblibProvider } from './liblib';

// Provider 工厂：根据名字拿实例
export function getProvider(name: string): ImageProvider {
  switch (name) {
    case 'gemini':
      return new GeminiProvider(process.env.GEMINI_API_KEY || '');
    case 'liblib':
      return new LiblibProvider(
        process.env.LIBLIB_ACCESS_KEY || '',
        process.env.LIBLIB_SECRET_KEY || '',
      );
    default:
      throw new Error(`Unknown provider: ${name}`);
  }
}

// 前端展示用（不包含 key 状态，前端通过 /api/providers 查）
export const PROVIDER_LIST = [
  { name: 'gemini', displayName: 'Gemini 2.5 Flash Image', envKey: 'GEMINI_API_KEY' },
  { name: 'liblib', displayName: 'Liblib Flux', envKey: 'LIBLIB_ACCESS_KEY' },
];
