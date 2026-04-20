import { create } from 'zustand';
import type { AspectRatio } from './providers/types';
import type { FontDef } from './fonts/presets';

interface GeneratedImage {
  url: string;
  provider: string;
  timestamp: number;
}

interface StudioState {
  // 画布尺寸
  aspectRatio: AspectRatio;
  setAspectRatio: (r: AspectRatio) => void;

  // AI 生图
  provider: string;
  setProvider: (p: string) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  referenceImages: string[];
  addReferenceImage: (dataUrl: string) => void;
  removeReferenceImage: (i: number) => void;
  isGenerating: boolean;
  setGenerating: (b: boolean) => void;
  generatedImages: GeneratedImage[];
  pushGenerated: (imgs: GeneratedImage[]) => void;

  // 字体
  customFonts: FontDef[];
  addCustomFont: (font: FontDef) => void;

  // 选中的 Fabric 对象（用于右栏面板）
  selectedObjectVersion: number; // 触发 React 重渲染的计数
  bumpSelection: () => void;
}

export const useStudioStore = create<StudioState>((set) => ({
  aspectRatio: '9:16',
  setAspectRatio: (r) => set({ aspectRatio: r }),

  provider: 'gemini',
  setProvider: (p) => set({ provider: p }),
  prompt: '',
  setPrompt: (p) => set({ prompt: p }),
  referenceImages: [],
  addReferenceImage: (url) =>
    set((s) => ({ referenceImages: [...s.referenceImages, url].slice(0, 4) })),
  removeReferenceImage: (i) =>
    set((s) => ({ referenceImages: s.referenceImages.filter((_, idx) => idx !== i) })),

  isGenerating: false,
  setGenerating: (b) => set({ isGenerating: b }),
  generatedImages: [],
  pushGenerated: (imgs) => set((s) => ({ generatedImages: [...imgs, ...s.generatedImages] })),

  customFonts: [],
  addCustomFont: (font) =>
    set((s) => ({
      customFonts: s.customFonts.find((f) => f.family === font.family)
        ? s.customFonts
        : [...s.customFonts, font],
    })),

  selectedObjectVersion: 0,
  bumpSelection: () => set((s) => ({ selectedObjectVersion: s.selectedObjectVersion + 1 })),
}));
