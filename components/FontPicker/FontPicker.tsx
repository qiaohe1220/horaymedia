'use client';
import { useState, useMemo, useRef } from 'react';
import { ALL_BUILTIN_FONTS, type FontDef } from '@/lib/fonts/presets';
import { loadPresetFont, loadCustomFont } from '@/lib/fonts/loader';
import { useStudioStore } from '@/lib/store';

interface Props {
  value: string;
  onChange: (family: string) => void;
}

export default function FontPicker({ value, onChange }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const customFonts = useStudioStore((s) => s.customFonts);
  const addCustomFont = useStudioStore((s) => s.addCustomFont);

  const allFonts = useMemo<FontDef[]>(
    () => [...customFonts, ...ALL_BUILTIN_FONTS],
    [customFonts],
  );

  const filtered = useMemo(
    () =>
      allFonts.filter((f) =>
        (f.displayName + f.family).toLowerCase().includes(query.toLowerCase()),
      ),
    [allFonts, query],
  );

  async function handleSelect(font: FontDef) {
    if (font.source !== 'custom') {
      await loadPresetFont(font);
    }
    onChange(font.family);
    setOpen(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      try {
        const font = await loadCustomFont(file);
        addCustomFont(font);
        onChange(font.family);
      } catch (err) {
        alert(`加载字体失败：${file.name}`);
      }
    }
    e.target.value = '';
  }

  const current = allFonts.find((f) => f.family === value);

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          textAlign: 'left',
          fontFamily: value,
          padding: '8px 10px',
          background: '#0f0f0f',
          border: '1px solid #2a2a2a',
        }}
      >
        {current?.displayName || value}
        <span style={{ float: 'right', color: '#666' }}>▾</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            right: 0,
            background: '#161616',
            border: '1px solid #2a2a2a',
            borderRadius: 6,
            zIndex: 100,
            maxHeight: 340,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div style={{ padding: 8, borderBottom: '1px solid #262626' }}>
            <input
              placeholder="搜索字体..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          <div className="scroll-y" style={{ flex: 1 }}>
            {filtered.map((font) => (
              <div
                key={`${font.source}-${font.family}`}
                onMouseEnter={() => font.source !== 'custom' && loadPresetFont(font).catch(() => {})}
                onClick={() => handleSelect(font)}
                style={{
                  padding: '10px 12px',
                  cursor: 'pointer',
                  fontFamily: font.family,
                  fontSize: 14,
                  borderBottom: '1px solid #1e1e1e',
                  background: value === font.family ? '#252525' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{font.displayName}</span>
                  <span style={{ fontSize: 9, color: '#666', fontFamily: 'monospace' }}>
                    {font.source === 'google' ? 'EN' : font.source === 'builtin-cn' ? 'CN' : 'TTF'}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: 8, borderTop: '1px solid #262626' }}>
            <button
              onClick={() => fileInputRef.current?.click()}
              style={{ width: '100%' }}
            >
              + 上传自定义字体 (TTF/OTF/WOFF)
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              multiple
              onChange={handleUpload}
              style={{ display: 'none' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
