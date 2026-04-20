# AI Cover Studio · HORAYMEDIA

汽车视觉内容 AI 封面生产系统 · 第1期

## 功能

- **AI 生图**：Gemini 2.5 Flash Image（起步）+ Liblib.art Flux（预留）
- **参考图输入**：最多 4 张参考图 + prompt 组合生成
- **多尺寸**：9:16 / 3:4 / 16:9 / 1:1
- **画布编辑器**：基于 Fabric.js，文字/图片/图层自由组合
- **字体系统**：
  - 内置中文字体（思源黑体/站酷系列/毛笔楷书等，免费商用）
  - Google Fonts（Bebas Neue / Oswald / Anton 等）
  - **自定义 TTF/OTF/WOFF 上传**
- **导出**：PNG / JPG，2x 超采样

## 启动

### 1. 准备环境

- Node.js 20+
- npm 或 pnpm

### 2. 安装依赖

```bash
cd ai-cover-studio
npm install
```

### 3. 配置 API Key

复制 `.env.example` 为 `.env.local`，填入你的 key：

```bash
cp .env.example .env.local
```

编辑 `.env.local`：

```env
# 去 https://aistudio.google.com/apikey 申请
GEMINI_API_KEY=AIza...

# 后续要接 Liblib.art 时填这两个，现在留空即可
LIBLIB_ACCESS_KEY=
LIBLIB_SECRET_KEY=
```

### 4. 运行

```bash
npm run dev
```

打开 http://localhost:3000

## 使用流程

1. **左栏输入 prompt** → 选模型 → 选尺寸 → 生成
2. **历史生成区点击图片** → 自动加入画布作为底图
3. **右栏 + 文字** → 双击编辑内容 → 换字体 / 调字号 / 改颜色
4. **右下角导出** → PNG 或 JPG

## 扩展新 AI 模型

只需在 `lib/providers/` 下新增一个实现 `ImageProvider` 接口的文件，并在 `index.ts` 注册。前端 UI 零改动。

示例：接入 Coze 工作流

```typescript
// lib/providers/coze.ts
export class CozeProvider implements ImageProvider {
  name = 'coze';
  displayName = 'Coze 工作流';
  async generate(params) { /* 调用 Coze API */ }
}
```

## 目录结构

```
ai-cover-studio/
├── app/
│   ├── api/generate/       # 生图 API 路由
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # 主页面
├── components/
│   ├── Canvas/              # Fabric 画布封装
│   ├── FontPicker/          # 字体选择器
│   ├── GeneratePanel/       # 左栏
│   └── PropertyPanel/       # 右栏
├── lib/
│   ├── providers/           # AI Provider 适配层
│   ├── fonts/               # 字体预设 + 加载器
│   ├── canvas/              # 画布导出
│   └── store.ts             # Zustand 全局状态
├── .env.example
└── package.json
```

## 网络注意事项

- **国内直连 Google 不通**：调用 Gemini API 需要科学上网，或部署到 Vercel/海外服务器
- **国内稳定方案**：完成后期 2 期时接入 Liblib.art，走国内 API

## 第2期预告

- 风格工坊：批量上传参考封面 → Vision 分析 → 存为风格预设
- 字幕转标题：上传 .srt/.txt → AI 生成 4 套爆款变体
- Liblib.art Flux 正式接入

---

问题反馈请直接 ping 项目维护者。
