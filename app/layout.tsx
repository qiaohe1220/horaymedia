import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Cover Studio · HORAYMEDIA',
  description: '汽车视觉内容 AI 封面生产系统',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
