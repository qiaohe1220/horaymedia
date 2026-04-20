import type { GenerateParams, GenerateResult, ImageProvider } from './types';
import { ASPECT_TO_SIZE } from './types';
import crypto from 'crypto';

// Liblib.art 开放平台 API 封装（占位，待你申请 AccessKey+SecretKey 后启用）
// 文档：https://liblibai.feishu.cn/wiki/... （登录 liblib.art 获取最新链接）
// 签名方式：AK/SK + HMAC-SHA1，参数放在 query string

const BASE = 'https://openapi.liblibai.cloud';

// Flux-dev 的 templateUuid，可在 liblib.art 的 API 模板页找到
const TEMPLATE_UUID_FLUX = '6f7c4652458d4802969f8d089cf5b91f';

export class LiblibProvider implements ImageProvider {
  name = 'liblib';
  displayName = 'Liblib Flux';

  constructor(
    private accessKey: string,
    private secretKey: string,
  ) {
    if (!accessKey || !secretKey) throw new Error('LIBLIB_ACCESS_KEY / SECRET_KEY not set');
  }

  // Liblib 签名算法
  private sign(uri: string) {
    const timestamp = Date.now().toString();
    const signatureNonce = Math.random().toString(36).slice(2, 10);
    const content = `${uri}&${timestamp}&${signatureNonce}`;
    const hmac = crypto.createHmac('sha1', this.secretKey);
    hmac.update(content);
    const signature = hmac.digest('base64')
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    return { signature, timestamp, signatureNonce };
  }

  private buildUrl(path: string) {
    const { signature, timestamp, signatureNonce } = this.sign(path);
    return `${BASE}${path}?AccessKey=${this.accessKey}&Signature=${signature}&Timestamp=${timestamp}&SignatureNonce=${signatureNonce}`;
  }

  async generate(params: GenerateParams): Promise<GenerateResult> {
    const { prompt, aspectRatio, count = 1 } = params;
    const size = ASPECT_TO_SIZE[aspectRatio];

    // 1. 提交生成任务
    const submitUrl = this.buildUrl('/api/generate/webui/text2img');
    const submitResp = await fetch(submitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateUuid: TEMPLATE_UUID_FLUX,
        generateParams: {
          prompt,
          steps: 20,
          width: size.width,
          height: size.height,
          imgCount: count,
          seed: params.seed ?? -1,
        },
      }),
    });

    const submitJson = await submitResp.json();
    if (submitJson.code !== 0) throw new Error(`Liblib submit failed: ${submitJson.msg}`);
    const generateUuid = submitJson.data.generateUuid;

    // 2. 轮询状态
    const maxWait = 120000; // 2 分钟
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      await new Promise(r => setTimeout(r, 2000));
      const statusUrl = this.buildUrl('/api/generate/webui/status');
      const statusResp = await fetch(statusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generateUuid }),
      });
      const statusJson = await statusResp.json();
      if (statusJson.data?.generateStatus === 5) {
        // 成功
        return {
          images: (statusJson.data.images ?? []).map((img: any) => ({
            url: img.imageUrl,
            seed: img.seed,
          })),
          provider: this.name,
        };
      }
      if (statusJson.data?.generateStatus === 6) {
        throw new Error('Liblib generation failed');
      }
    }
    throw new Error('Liblib timeout');
  }
}
