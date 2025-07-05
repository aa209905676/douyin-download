'use client'

import Head from 'next/head'

export default function SEOHead() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://douyin-downloader.vercel.app'

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "抖音视频无水印下载器",
    "description": "免费在线抖音视频下载器，支持无水印下载抖音、TikTok视频。快速、安全、无需安装软件。",
    "url": baseUrl,
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "CNY"
    },
    "featureList": [
      "抖音视频无水印下载",
      "TikTok视频下载",
      "高清视频下载",
      "免费在线使用",
      "无需安装软件",
      "支持批量下载"
    ],
    "screenshot": `${baseUrl}/screenshot.jpg`,
    "softwareVersion": "1.0",
    "datePublished": "2024-01-01",
    "dateModified": new Date().toISOString().split('T')[0],
    "author": {
      "@type": "Organization",
      "name": "抖音下载器"
    },
    "publisher": {
      "@type": "Organization",
      "name": "抖音下载器"
    }
  }

  const faqData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "如何下载抖音视频无水印？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "复制抖音视频链接，粘贴到我们的下载器中，点击获取视频信息，然后点击下载视频即可获得无水印的高清视频。"
        }
      },
      {
        "@type": "Question", 
        "name": "下载的抖音视频有水印吗？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "我们的下载器支持无水印下载，下载的视频不包含抖音水印，保持原始高清画质。"
        }
      },
      {
        "@type": "Question",
        "name": "是否需要安装软件？",
        "acceptedAnswer": {
          "@type": "Answer", 
          "text": "不需要安装任何软件，我们提供在线下载服务，直接在浏览器中使用即可。"
        }
      },
      {
        "@type": "Question",
        "name": "支持哪些平台的视频下载？",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "支持抖音(Douyin)和TikTok平台的视频下载，兼容各种链接格式。"
        }
      }
    ]
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
      />
    </>
  )
}
