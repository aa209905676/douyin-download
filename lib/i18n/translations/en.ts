import { Translation } from '../types'

export const en: Translation = {
  // Header
  appTitle: 'TikTok Downloader',
  appSubtitle: 'Free & Fast',
  
  // Hero Section
  heroTitle: 'Download TikTok videos',
  heroSubtitle: 'without watermarks',
  heroDescription: 'Paste any TikTok or Douyin video link and download it in seconds. High quality, no watermarks, completely free.',
  
  // Input Section
  inputPlaceholder: 'Paste TikTok or Douyin video link here...',
  getInfoButton: 'Get Video Info',
  processingButton: 'Processing video...',
  
  // Video Info
  videoAuthor: 'Author',
  videoDuration: 'Duration',
  downloadVideo: 'Download Video',
  downloadAudio: 'Download Audio',
  
  // Stats
  statsLikes: 'Likes',
  statsViews: 'Views', 
  statsComments: 'Comments',
  statsShares: 'Shares',
  
  // Features
  featureFastTitle: 'Lightning Fast',
  featureFastDesc: 'Download videos in seconds with our optimized servers',
  featureNoWatermarkTitle: 'No Watermarks',
  featureNoWatermarkDesc: 'Get clean videos without any watermarks or logos',
  featurePrivacyTitle: 'Privacy First',
  featurePrivacyDesc: 'No registration required, your data stays private',
  
  // Platforms
  supportedPlatforms: 'Supported Platforms',
  platforms: {
    tiktok: 'TikTok',
    douyin: 'Douyin',
    shortLinks: 'Short Links',
    shareLinks: 'Share Links'
  },
  
  // Footer
  footerCopyright: '© 2024 TikTok Downloader. Made with ❤️ for creators.',
  footerEducational: 'For educational purposes only.',
  
  // Error Messages
  errors: {
    serviceUnavailable: 'Service temporarily unavailable',
    suggestions: '💡 Suggestions:',
    suggestionsList: {
      checkLink: 'Check if the video link is complete and correct',
      ensurePublic: 'Ensure the video is public (not private)',
      retryLater: 'Try again later, service may be under maintenance',
      tryOther: 'Try using other TikTok or Douyin links'
    },
    retryButton: 'Try Again',
    networkError: 'Network connection failed. Please check your connection and try again. If the problem persists, please try again later.',
    downloadFailed: 'Download failed',
    
    // Error Codes
    noParserAvailable: 'Video parsing service is temporarily unavailable. We are working hard to fix it. Please try again later or contact technical support.',
    allParsersFailed: 'All parsing services are temporarily unavailable. This may be due to server maintenance or network issues. Please try again later.',
    apiRequestFailed: 'Parsing service responded abnormally. Please try again later. If the problem persists, the server may be under maintenance.',
    apiError: 'Video parsing failed. Please check if the video link is correct, or the video may not be downloadable (private video or deleted).',
    networkErrorCode: 'Network connection problem. Please check your network connection and try again.',
    noDownloadUrl: 'Unable to get download link for this video. The video may have download restrictions or format not supported.',
    noFormatUrl: 'Requested format is not available. Please try other formats or try again later.',
    invalidUrl: 'Please enter a valid TikTok or Douyin video link. Supported formats include: share links, short links and full links.',
    timeout: 'Request timeout, server response is slow. Please try again later.',
    badRequest: 'Video link format is incorrect or the video cannot be parsed. Please check if the link is correct.',
    defaultError: 'Service temporarily unavailable. We are working hard to solve the problem, please try again later.'
  },
  
  // Language Switcher
  language: 'Language',
  chinese: '中文',
  english: 'English'
}