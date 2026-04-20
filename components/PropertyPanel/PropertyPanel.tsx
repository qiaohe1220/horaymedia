'use client';
import { useState, useEffect } from 'react';
import * as fabric from 'fabric';
import FontPicker from '@/components/FontPicker/FontPicker';
import type { CanvasHandle } from '@/components/Canvas/EditorCanvas';
import { exportCanvas } from '@/lib/canvas/export';
import { useStudioStore } from '@/lib/store';

interface Props {
  selected: fabric.Object | null;
  canvasHandle: CanvasHandle | null;
}

const PRESET_COLORS = ['#ffffff', '#000000', '#FF5A1F', '#FFD400', '#8BC34A', '#00C2CB', '#9B59B6', '#FF4D6D'];

export default function PropertyPanel({ selected, canvasHandle }: Props) {
  const bumpSelection = useStudioStore((s) => s.bumpSelection);
  const version = useStudioStore((s) => s.selectedObjectVersion);
  const [, force] = useState(0);

  // 当选中对象内部状态变了也要重渲染
  useEffect(() => { force((n) => n + 1); }, [version]);

  const isText = selected && 'text' in selected;
  const textObj = selected as fabric.Textbox | null;

  function update<K extends keyof fabric.Textbox>(key: K, value: any) {
    if (!selected || !canvasHandle) return;
    (selected as any).set(key, value);
    canvasHandle.getCanvas()?.requestRenderAll();
    bumpSelection();
  }

  function handleAddText() {
    canvasHandle?.addText('双击编辑文字');
  }

  function handleExport(format: 'png' | 'jpeg') {
    const canvas = canvasHandle?.getCanvas();
    if (canvas) exportCanvas(canvas, { format, multiplier: 2 });
  }

  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 14, height: '100%', overflowY: 'auto' }} className="scroll-y">

      <div>
        <div className="panel-title">添加元素</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <button onClick={handleAddText}>+ 文字</button>
          <button onClick={() => canvasHandle?.deleteSelected()} disabled={!selected}>删除</button>
          <button onClick={() => canvasHandle?.bringForward()} disabled={!selected}>上移一层</button>
          <button onClick={() => canvasHandle?.sendBackward()} disabled={!selected}>下移一层</button>
        </div>
      </div>

      {isText && textObj && (
        <>
          <div>
            <div className="panel-title">字体</div>
            <FontPicker
              value={textObj.fontFamily || 'Noto Sans SC'}
              onChange={(family) => update('fontFamily', family)}
            />
          </div>

          <div>
            <div className="panel-title">字号 / 字重</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <input
                type="number"
                value={Math.round(textObj.fontSize || 64)}
                onChange={(e) => update('fontSize', parseInt(e.target.value) || 12)}
              />
              <select
                value={String(textObj.fontWeight || 400)}
                onChange={(e) => update('fontWeight', parseInt(e.target.value))}
              >
                <option value="300">Light 300</option>
                <option value="400">Regular 400</option>
                <option value="500">Medium 500</option>
                <option value="700">Bold 700</option>
                <option value="900">Black 900</option>
              </select>
            </div>
          </div>

          <div>
            <div className="panel-title">字间距 / 行高</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
              <input
                type="number"
                step="10"
                value={textObj.charSpacing || 0}
                onChange={(e) => update('charSpacing', parseInt(e.target.value) || 0)}
                placeholder="字间距"
              />
              <input
                type="number"
                step="0.1"
                value={textObj.lineHeight || 1.16}
                onChange={(e) => update('lineHeight', parseFloat(e.target.value) || 1)}
                placeholder="行高"
              />
            </div>
          </div>

          <div>
            <div className="panel-title">颜色</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_COLORS.map((c) => (
                <div
                  key={c}
                  onClick={() => update('fill', c)}
                  style={{
                    width: 24, height: 24,
                    background: c,
                    borderRadius: 4,
                    cursor: 'pointer',
                    border: textObj.fill === c ? '2px solid #fff' : '1px solid #2a2a2a',
                  }}
                />
              ))}
              <input
                type="color"
                value={(textObj.fill as string) || '#ffffff'}
                onChange={(e) => update('fill', e.target.value)}
                style={{ width: 24, height: 24, padding: 0, border: 'none', cursor: 'pointer' }}
              />
            </div>
          </div>

          <div>
            <div className="panel-title">描边 / 对齐</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 6 }}>
              <input
                type="color"
                value={(textObj.stroke as string) || '#000000'}
                onChange={(e) => update('stroke', e.target.value)}
                style={{ height: 32, padding: 0, border: 'none' }}
              />
              <input
                type="number"
                value={textObj.strokeWidth || 0}
                onChange={(e) => update('strokeWidth', parseInt(e.target.value) || 0)}
                placeholder="描边粗细"
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
              {(['left', 'center', 'right'] as const).map((a) => (
                <button
                  key={a}
                  className={textObj.textAlign === a ? 'active' : ''}
                  onClick={() => update('textAlign', a)}
                >
                  {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {!selected && (
        <div style={{ fontSize: 11, color: '#666', padding: '8px 0' }}>
          选中画布上的元素开始编辑 →
        </div>
      )}

      <div style={{ marginTop: 'auto', borderTop: '1px solid #262626', paddingTop: 14 }}>
        <div className="panel-title">导出</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
          <button onClick={() => handleExport('png')}>PNG</button>
          <button onClick={() => handleExport('jpeg')}>JPG</button>
        </div>
      </div>
    </div>
  );
}
