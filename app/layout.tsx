import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "../lib/hooks/useLanguage";

export const metadata: Metadata = {
  title: "抖音视频无水印下载器 - 免费在线下载抖音TikTok视频",
  description: "免费在线抖音视频下载器，支持无水印下载抖音、TikTok视频。快速、安全、无需安装软件，一键下载高清视频到本地。",
  keywords: "抖音视频下载,抖音无水印下载,TikTok下载器,抖音去水印,视频下载器,免费下载抖音,在线视频下载",
  authors: [{ name: "抖音下载器" }],
  creator: "抖音视频下载器",
  publisher: "抖音下载器",
  robots: "index, follow",
  openGraph: {
    title: "抖音视频无水印下载器 - 免费在线下载",
    description: "免费在线抖音视频下载器，支持无水印下载抖音、TikTok视频。快速、安全、无需安装软件。",
    type: "website",
    locale: "zh_CN",
    alternateLocale: "en_US",
    siteName: "抖音视频下载器",
  },
  twitter: {
    card: "summary_large_image",
    title: "抖音视频无水印下载器",
    description: "免费在线下载抖音TikTok视频，支持无水印高清下载",
  },
  alternates: {
    canonical: "https://your-domain.com",
    languages: {
      "zh-CN": "https://your-domain.com",
      "en": "https://your-domain.com/en",
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="antialiased font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
