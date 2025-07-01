import { Translation } from '../types'

export const zh: Translation = {
  // Header
  appTitle: 'TikTok Downloader',
  appSubtitle: '免费快速',
  
  // Hero Section
  heroTitle: '下载 TikTok 视频',
  heroSubtitle: '无水印下载',
  heroDescription: '粘贴任意 TikTok 或抖音视频链接，几秒钟内下载。高质量、无水印、完全免费。',
  
  // Input Section
  inputPlaceholder: '请粘贴 TikTok 或抖音视频链接...',
  getInfoButton: '获取视频信息',
  processingButton: '正在解析视频...',
  
  // Video Info
  videoAuthor: '作者',
  videoDuration: '时长',
  downloadVideo: '下载视频',
  downloadAudio: '下载音频',
  
  // Stats
  statsLikes: '点赞',
  statsViews: '播放',
  statsComments: '评论',
  statsShares: '分享',
  
  // Features
  featureFastTitle: '闪电般快速',
  featureFastDesc: '通过我们优化的服务器，几秒钟内下载视频',
  featureNoWatermarkTitle: '无水印',
  featureNoWatermarkDesc: '获得干净的视频，没有任何水印或标志',
  featurePrivacyTitle: '隐私优先',
  featurePrivacyDesc: '无需注册，您的数据保持私密',
  
  // Platforms
  supportedPlatforms: '支持的平台',
  platforms: {
    tiktok: 'TikTok',
    douyin: '抖音',
    shortLinks: '短链接',
    shareLinks: '分享链接'
  },
  
  // Footer
  footerCopyright: '© 2024 TikTok Downloader. 为创作者用心制作',
  footerEducational: '仅供教育用途',
  
  // Error Messages
  errors: {
    serviceUnavailable: '服务暂时不可用',
    suggestions: '💡 解决建议：',
    suggestionsList: {
      checkLink: '检查视频链接是否完整和正确',
      ensurePublic: '确保视频是公开的（非私密设置）',
      retryLater: '稍后重试，服务可能正在维护中',
      tryOther: '尝试使用其他 TikTok 或抖音链接'
    },
    retryButton: '重新尝试',
    networkError: '网络连接失败，请检查网络连接后重试。如果问题持续存在，请稍后再试。',
    downloadFailed: '下载失败',
    
    // Error Codes
    noParserAvailable: '视频解析服务暂时不可用，我们正在努力修复中。请稍后重试或联系技术支持。',
    allParsersFailed: '所有解析服务都暂时无法使用。这可能是由于服务器维护或网络问题导致的，请稍后重试。',
    apiRequestFailed: '解析服务响应异常，请稍后重试。如果问题持续存在，可能是服务器正在维护中。',
    apiError: '视频解析失败，请检查视频链接是否正确，或者该视频可能无法下载（私密视频或已删除）。',
    networkErrorCode: '网络连接出现问题，请检查网络连接后重试。',
    noDownloadUrl: '无法获取该视频的下载链接，可能是视频设置了下载限制或格式不支持。',
    noFormatUrl: '请求的格式不可用，请尝试其他格式或稍后重试。',
    invalidUrl: '请输入有效的 TikTok 或抖音视频链接。支持的格式包括：分享链接、短链接和完整链接。',
    timeout: '请求超时，服务器响应较慢。请稍后重试。',
    badRequest: '视频链接格式有误或该视频无法解析。请检查链接是否正确。',
    defaultError: '服务暂时不可用。我们正在努力解决问题，请稍后重试。'
  },
  
  // Language Switcher
  language: '语言',
  chinese: '中文',
  english: 'English'
}