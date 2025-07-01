export type Language = 'zh' | 'en'

export interface Translation {
  // Header
  appTitle: string
  appSubtitle: string
  
  // Hero Section
  heroTitle: string
  heroSubtitle: string
  heroDescription: string
  
  // Input Section
  inputPlaceholder: string
  getInfoButton: string
  processingButton: string
  
  // Video Info
  videoAuthor: string
  videoDuration: string
  downloadVideo: string
  downloadAudio: string
  
  // Stats
  statsLikes: string
  statsViews: string
  statsComments: string
  statsShares: string
  
  // Features
  featureFastTitle: string
  featureFastDesc: string
  featureNoWatermarkTitle: string
  featureNoWatermarkDesc: string
  featurePrivacyTitle: string
  featurePrivacyDesc: string
  
  // Platforms
  supportedPlatforms: string
  platforms: {
    tiktok: string
    douyin: string
    shortLinks: string
    shareLinks: string
  }
  
  // Footer
  footerCopyright: string
  footerEducational: string
  
  // Error Messages
  errors: {
    serviceUnavailable: string
    suggestions: string
    suggestionsList: {
      checkLink: string
      ensurePublic: string
      retryLater: string
      tryOther: string
    }
    retryButton: string
    networkError: string
    downloadFailed: string
    
    // Error Codes
    noParserAvailable: string
    allParsersFailed: string
    apiRequestFailed: string
    apiError: string
    networkErrorCode: string
    noDownloadUrl: string
    noFormatUrl: string
    invalidUrl: string
    timeout: string
    badRequest: string
    defaultError: string
  }
  
  // Language Switcher
  language: string
  chinese: string
  english: string
}