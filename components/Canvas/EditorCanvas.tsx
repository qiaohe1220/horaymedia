'use client';
import { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';
import * as fabric from 'fabric';
import { useStudioStore } from '@/lib/store';
import { ASPECT_TO_SIZE } from '@/lib/providers/types';

export interface CanvasHandle {
  getCanvas: () => fabric.Canvas | null;
  addText: (text: string, options?: Partial<fabric.ITextboxOptions>) => void;
  addImageFromUrl: (url: string, fitMode?: 'cover' | 'contain') => Promise<void>;
  deleteSelected: () => void;
  bringForward: () => void;
  sendBackward: () => void;
  clear: () => void;
}

interface Props {
  onSelectionChange?: (obj: fabric.Object | null) => void;
}

const EditorCanvas = forwardRef<CanvasHandle, Props>(({ onSelectionChange }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<fabric.Canvas | null>(null);
  const aspectRatio = useStudioStore((s) => s.aspectRatio);
  const bumpSelection = useStudioStore((s) => s.bumpSelection);
  const [zoom, setZoom] = useState(1);

  // 初始化 Fabric Canvas
  useEffect(() => {
    if (!canvasElRef.current) return;

    const canvas = new fabric.Canvas(canvasElRef.current, {
      backgroundColor: '#1a1a1a',
      preserveObjectStacking: true,
      selection: true,
    });
    fabricRef.current = canvas;

    const handleSelection = () => {
      const active = canvas.getActiveObject();
      onSelectionChange?.(active || null);
      bumpSelection();
    };
    canvas.on('selection:created', handleSelection);
    canvas.on('selection:updated', handleSelection);
    canvas.on('selection:cleared', () => {
      onSelectionChange?.(null);
      bumpSelection();
    });
    canvas.on('object:modified', bumpSelection);

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, []); // eslint-disable-line

  // 监听 aspectRatio 变化，调整画布尺寸
  useEffect(() => {
    const canvas = fabricRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const { width: targetW, height: targetH } = ASPECT_TO_SIZE[aspectRatio];
    canvas.setDimensions({ width: targetW, height: targetH });

    const fit = () => {
      const rect = container.getBoundingClientRect();
      const padding = 40;
      const availW = rect.width - padding;
      const availH = rect.height - padding;
      const scale = Math.min(availW / targetW, availH / targetH, 1);
      canvas.setZoom(scale);
      canvas.setDimensions(
        { width: targetW * scale, height: targetH * scale },
        { cssOnly: true },
      );
      setZoom(scale);
    };
    fit();

    const ro = new ResizeObserver(fit);
    ro.observe(container);
    return () => ro.disconnect();
  }, [aspectRatio]);

  // 暴露方法给父组件
  useImperativeHandle(ref, () => ({
    getCanvas: () => fabricRef.current,
    addText: (text, options) => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const t = new fabric.Textbox(text, {
        left: canvas.getWidth() / (2 * canvas.getZoom()) - 150,
        top: canvas.getHeight() / (2 * canvas.getZoom()) - 40,
        width: 300,
        fontSize: 64,
        fill: '#ffffff',
        fontFamily: 'Noto Sans SC',
        fontWeight: 700,
        textAlign: 'left',
        ...options,
      });
      canvas.add(t);
      canvas.setActiveObject(t);
      canvas.requestRenderAll();
    },
    addImageFromUrl: async (url, fitMode = 'cover') => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: 'anonymous' });
      const cw = canvas.getWidth() / canvas.getZoom();
      const ch = canvas.getHeight() / canvas.getZoom();
      const scale = fitMode === 'cover'
        ? Math.max(cw / img.width!, ch / img.height!)
        : Math.min(cw / img.width!, ch / img.height!);
      img.set({
        left: cw / 2,
        top: ch / 2,
        originX: 'center',
        originY: 'center',
        scaleX: scale,
        scaleY: scale,
      });
      canvas.add(img);
      canvas.sendObjectToBack(img);
      canvas.requestRenderAll();
    },
    deleteSelected: () => {
      const canvas = fabricRef.current;
      if (!canvas) return;
      canvas.getActiveObjects().forEach((o) => canvas.remove(o));
      canvas.discardActiveObject();
      canvas.requestRenderAll();
    },
    bringForward: () => {
      const canvas = fabricRef.current;
      const obj = canvas?.getActiveObject();
      if (canvas && obj) { canvas.bringObjectForward(obj); canvas.requestRenderAll(); }
    },
    sendBackward: () => {
      const canvas = fabricRef.current;
      const obj = canvas?.getActiveObject();
      if (canvas && obj) { canvas.sendObjectBackwards(obj); canvas.requestRenderAll(); }
    },
    clear: () => {
      fabricRef.current?.clear();
      fabricRef.current?.setBackgroundColor('#1a1a1a', () => fabricRef.current?.requestRenderAll());
    },
  }));

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex items-center justify-center relative"
      style={{ background: '#0a0a0a' }}
    >
      <div style={{ boxShadow: '0 0 0 1px #262626' }}>
        <canvas ref={canvasElRef} />
      </div>
      <div style={{
        position: 'absolute', bottom: 12, right: 12,
        fontSize: 11, color: '#666', fontFamily: 'monospace',
      }}>
        {ASPECT_TO_SIZE[aspectRatio].width}×{ASPECT_TO_SIZE[aspectRatio].height} · {Math.round(zoom * 100)}%
      </div>
    </div>
  );
});

EditorCanvas.displayName = 'EditorCanvas';
export default EditorCanvas;
