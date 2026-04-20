'use client';
import { useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import * as fabric from 'fabric';
import type { CanvasHandle } from '@/components/Canvas/EditorCanvas';
import GeneratePanel from '@/components/GeneratePanel/GeneratePanel';
import PropertyPanel from '@/components/PropertyPanel/PropertyPanel';

// Fabric 依赖 window，必须 client-only
const EditorCanvas = dynamic(() => import('@/components/Canvas/EditorCanvas'), {
  ssr: false,
});

export default function Home() {
  const canvasRef = useRef<CanvasHandle>(null);
  const [selected, setSelected] = useState<fabric.Object | null>(null);

  function handleImageReady(dataUrl: string) {
    canvasRef.current?.addImageFromUrl(dataUrl, 'cover');
  }

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'grid',
      gridTemplateColumns: '260px 1fr 280px',
      gridTemplateRows: '44px 1fr',
      gridTemplateAreas: `
        "header header header"
        "left   canvas right"
      `,
    }}>
      <header style={{
        gridArea: 'header',
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        borderBottom: '1px solid #262626',
        background: '#0f0f0f',
      }}>
        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: 0.5 }}>
          AI Cover Studio <span style={{ color: '#666', marginLeft: 8 }}>HORAYMEDIA</span>
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: '#666', fontFamily: 'monospace' }}>
          v0.1 · 第1期
        </span>
      </header>

      <aside style={{
        gridArea: 'left',
        borderRight: '1px solid #262626',
        background: '#0f0f0f',
        overflow: 'hidden',
      }}>
        <GeneratePanel onImageReady={handleImageReady} />
      </aside>

      <main style={{
        gridArea: 'canvas',
        background: '#0a0a0a',
        overflow: 'hidden',
      }}>
        <EditorCanvas ref={canvasRef} onSelectionChange={setSelected} />
      </main>

      <aside style={{
        gridArea: 'right',
        borderLeft: '1px solid #262626',
        background: '#0f0f0f',
        overflow: 'hidden',
      }}>
        <PropertyPanel selected={selected} canvasHandle={canvasRef.current} />
      </aside>
    </div>
  );
}
