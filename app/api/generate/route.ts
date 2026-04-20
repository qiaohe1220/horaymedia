import { NextRequest, NextResponse } from 'next/server';
import { getProvider } from '@/lib/providers';
import type { GenerateParams } from '@/lib/providers/types';

export const runtime = 'nodejs';
export const maxDuration = 180; // 3 分钟

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider: providerName = 'gemini', ...params } = body as {
      provider?: string;
    } & GenerateParams;

    if (!params.prompt?.trim()) {
      return NextResponse.json({ error: 'prompt is required' }, { status: 400 });
    }

    const provider = getProvider(providerName);
    const result = await provider.generate(params);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('[generate] error:', err);
    return NextResponse.json(
      { error: err.message || 'Internal error' },
      { status: 500 },
    );
  }
}

export async function GET() {
  // 返回可用 provider 列表（检测环境变量是否配置）
  const providers = [
    { name: 'gemini', displayName: 'Gemini 2.5 Flash', ready: !!process.env.GEMINI_API_KEY },
    { name: 'liblib', displayName: 'Liblib Flux', ready: !!process.env.LIBLIB_ACCESS_KEY && !!process.env.LIBLIB_SECRET_KEY },
  ];
  return NextResponse.json({ providers });
}
