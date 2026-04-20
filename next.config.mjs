/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fabric.js 在服务端会报错，标记为外部模块
  serverExternalPackages: ['fabric'],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
};
export default nextConfig;
