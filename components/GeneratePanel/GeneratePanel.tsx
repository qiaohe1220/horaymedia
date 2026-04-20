'use client';
import { useEffect, useState } from 'react';
import { useStudioStore } from '@/lib/store';
import type { AspectRatio } from '@/lib/providers/types';

interface Props {
  onImageReady: (dataUrl: string) => void;
}

const RATIOS: AspectRatio[] = ['9:16', '3:4', '16:9', '1:1'];

export default function GeneratePanel({ onImageReady }: Props) {
  const {
    aspectRatio, setAspectRatio,
    provider, setProvider,
    prompt, setPrompt,
    referenceImages, addReferenceImage, removeReferenceImage,
    isGenerating, setGenerating,
    generatedImages, pushGenerated,
  } = useStudioStore();

  const [providers, setProviders] = useState<{ name: string; displayName: string; ready: boolean }[]>([]);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    fetch('/api/generate')
      .then((r) => r.json())
      .then((d) => setProviders(d.providers || []))
      .catch(() => {});
  }, []);

  async function handleGenerate() {
    if (!prompt.trim()) {
      setError('请输入 prompt');
      return;
    }
    setError('');
    setGenerating(true);
    try {
      const resp = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          prompt,
          aspectRatio,
          referenceImages,
          count: 1,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data.error || 'Generate failed');

      pushGenerated(
        data.images.map((img: any) => ({
          url: img.url,
          provider,
          timestamp: Date.now(),
        })),
      );
    } catch (err: any) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  }

  function handleRefUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const dataUrl = evt.target?.result as string;
        if (dataUrl) addReferenceImage(dataUrl);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflowY: 'auto' }} className="scroll-y">

      <div>
        <div className="panel-title">模型</div>
        <select value={provider} onChange={(e) => setProvider(e.target.value)}>
          {providers.map((p) => (
            <option key={p.name} value={p.name} disabled={!p.ready}>
              {p.displayName} {p.ready ? '' : '(未配置)'}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="panel-title">Prompt</div>
        <textarea
          rows={5}
          placeholder="如：哑光黑宝马M4侧45°，城市夜景霓虹反射，低机位电影感，橙青调"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          style={{ resize: 'vertical', minHeight: 90 }}
        />
      </div>

      <div>
        <div className="panel-title">参考图 ({referenceImages.length}/4)</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
          {referenceImages.map((url, i) => (
            <div
              key={i}
              onClick={() => removeReferenceImage(i)}
              style={{
                aspectRatio: '1',
                backgroundImage: `url(${url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                borderRadius: 4,
                cursor: 'pointer',
                position: 'relative',
              }}
              title="点击移除"
            />
          ))}
          {referenceImages.length < 4 && (
            <label
              style={{
                aspectRatio: '1',
                border: '1px dashed #2a2a2a',
                borderRadius: 4,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#555',
                fontSize: 20,
              }}
            >
              +
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleRefUpload}
                style={{ display: 'none' }}
              />
            </label>
          )}
        </div>
      </div>

      <div>
        <div className="panel-title">尺寸</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          {RATIOS.map((r) => (
            <button
              key={r}
              className={aspectRatio === r ? 'active' : ''}
              onClick={() => setAspectRatio(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <button
        className="primary"
        onClick={handleGenerate}
        disabled={isGenerating}
        style={{ padding: '10px', fontSize: 14 }}
      >
        {isGenerating ? '生成中...' : '生成'}
      </button>

      {error && (
        <div style={{ color: '#ff6b6b', fontSize: 11, background: '#2a1515', padding: 8, borderRadius: 4 }}>
          {error}
        </div>
      )}

      {generatedImages.length > 0 && (
        <div>
          <div className="panel-title">历史生成（点击加入画布）</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {generatedImages.slice(0, 8).map((img, i) => (
              <div
                key={i}
                onClick={() => onImageReady(img.url)}
                style={{
                  aspectRatio: '1',
                  backgroundImage: `url(${img.url})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  borderRadius: 4,
                  cursor: 'pointer',
                  border: '1px solid #2a2a2a',
                }}
                title="加入画布作为底图"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
