import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint配置
  eslint: {
    ignoreDuringBuilds: true,
  },

  // TypeScript配置
  typescript: {
    ignoreBuildErrors: true,
  },

  // 图片优化
  images: {
    domains: ['p16-sign-sg.tiktokcdn.com', 'p16-sign-va.tiktokcdn.com', 'aweme.snssdk.com'],
    unoptimized: true
  },

  // API路由配置
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ]
  },

  // 重定向配置
  async redirects() {
    return [
      {
        source: '/downloader',
        destination: '/',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
