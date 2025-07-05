'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '../lib/hooks/useLanguage'
import SimpleLanguageSwitcher from './components/SimpleLanguageSwitcher'

interface VideoInfo {
  title: string
  author: string
  thumbnail: string
  duration: number
  stats: {
    likes: number
    views: number
    comments: number
    shares: number
  }
}

const getFriendlyErrorMessage = (error: string, code: string, t: any) => {
  switch (code) {
    case 'NO_PARSER_AVAILABLE':
      return t.errors.noParserAvailable
    case 'ALL_PARSERS_FAILED':
      return t.errors.allParsersFailed
    case 'API_REQUEST_FAILED':
      return t.errors.apiRequestFailed
    case 'API_ERROR':
      return t.errors.apiError
    case 'NETWORK_ERROR':
      return t.errors.networkErrorCode
    case 'NO_DOWNLOAD_URL':
      return t.errors.noDownloadUrl
    case 'NO_FORMAT_URL':
      return t.errors.noFormatUrl
    // DouyinDirectAPI 特定错误
    case 'VIDEO_NOT_FOUND':
      return t.errors.videoNotFound
    case 'INVALID_URL':
      return t.errors.invalidUrl
    case 'DOUYIN_API_ERROR':
      return t.errors.douyinApiError
    default:
      if (error?.includes('Invalid URL')) {
        return t.errors.invalidUrl
      }
      if (error?.includes('timeout')) {
        return t.errors.timeout
      }
      if (error?.includes('400') || error?.includes('Bad Request')) {
        return t.errors.badRequest
      }
      return `${t.errors.defaultError}: ${error}`
  }
}

export default function Home() {
  const { t } = useLanguage()
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setVideoInfo(null)

    try {
      const response = await fetch('/api/video/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (response.ok) {
        setVideoInfo(data)
      } else {
        // 根据错误类型提供友好的提示
        const friendlyError = getFriendlyErrorMessage(data.error, data.code, t)
        setError(friendlyError)
      }
    } catch {
      setError(t.errors.networkError)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: 'video' | 'audio') => {
    try {
      // 直接跳转到下载API，触发浏览器下载对话框
      const downloadUrl = `/api/video/download?url=${encodeURIComponent(url)}&format=${format}`
      window.location.href = downloadUrl
    } catch {
      setError(`${t.errors.downloadFailed}，${t.errors.networkError}`)
    }
  }

  // 新增：直接下载功能（不需要先获取视频信息）
  const handleDirectDownload = async (format: 'video' | 'audio') => {
    if (!url.trim()) {
      setError(t.errors.invalidUrl)
      return
    }

    try {
      // 直接跳转到下载API，触发浏览器下载对话框
      const downloadUrl = `/api/video/download?url=${encodeURIComponent(url)}&format=${format}`
      window.location.href = downloadUrl

      // 显示下载提示
      setError('')
      // 可以添加一个成功提示，但由于页面会跳转，用户可能看不到
    } catch {
      setError(`${t.errors.downloadFailed}，${t.errors.networkError}`)
    }
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-gray-900">{t.appTitle}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">{t.appSubtitle}</div>
              <SimpleLanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            {t.heroTitle}
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              {t.heroSubtitle}
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            {t.heroDescription}
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={t.inputPlaceholder}
                className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="submit"
                disabled={loading || !url.trim()}
                className="flex-1 sm:flex-none px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
              >
                {loading ? (
                  <span className="flex items-center justify-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{t.processingButton}</span>
                  </span>
                ) : (
                  t.getInfoButton
                )}
              </button>

              {/* 直接下载按钮 */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleDirectDownload('video')}
                  disabled={!url.trim()}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>📹 直接下载视频</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDirectDownload('audio')}
                  disabled={!url.trim()}
                  className="flex items-center justify-center space-x-2 px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span>🎵 直接下载音频</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-red-800 font-semibold text-lg mb-2">{t.errors.serviceUnavailable}</h4>
                <p className="text-red-700 leading-relaxed mb-4">{error}</p>
                <div className="bg-red-100 rounded-lg p-4 border border-red-200">
                  <h5 className="text-red-800 font-medium mb-2">{t.errors.suggestions}</h5>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• {t.errors.suggestionsList.checkLink}</li>
                    <li>• {t.errors.suggestionsList.ensurePublic}</li>
                    <li>• {t.errors.suggestionsList.retryLater}</li>
                    <li>• {t.errors.suggestionsList.tryOther}</li>
                  </ul>
                </div>
                <button
                  onClick={() => setError('')}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  {t.errors.retryButton}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Video Info */}
        {videoInfo && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200/50 overflow-hidden mb-8">
            <div className="p-8">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Thumbnail */}
                {videoInfo.thumbnail && (
                  <div className="lg:w-1/3 flex-shrink-0">
                    <div className="aspect-[9/16] bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={videoInfo.thumbnail}
                        alt={videoInfo.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Info */}
                <div className="lg:w-2/3 space-y-6">
                  <div>
                    <h3 className="text-2xl font-semibold text-gray-900 mb-2 leading-tight">
                      {videoInfo.title}
                    </h3>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span>👤 {t.videoAuthor}: {videoInfo.author}</span>
                      <span>⏱️ {t.videoDuration}: {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: t.statsLikes, value: videoInfo.stats.likes, color: 'text-pink-600', icon: '❤️' },
                      { label: t.statsViews, value: videoInfo.stats.views, color: 'text-blue-600', icon: '👁️' },
                      { label: t.statsComments, value: videoInfo.stats.comments, color: 'text-green-600', icon: '💬' },
                      { label: t.statsShares, value: videoInfo.stats.shares, color: 'text-purple-600', icon: '📤' }
                    ].map((stat) => (
                      <div key={stat.label} className="text-center p-4 bg-gray-50 rounded-xl">
                        <div className="text-2xl mb-1">{stat.icon}</div>
                        <div className={`text-xl font-semibold ${stat.color} mb-1`}>
                          {typeof stat.value === 'number' ? stat.value.toLocaleString() : '0'}
                        </div>
                        <div className="text-sm text-gray-500">{stat.label}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Download Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button
                      onClick={() => handleDownload('video')}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>{t.downloadVideo}</span>
                    </button>
                    <button
                      onClick={() => handleDownload('audio')}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <span>{t.downloadAudio}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {[
            {
              icon: '⚡',
              title: t.featureFastTitle,
              description: t.featureFastDesc
            },
            {
              icon: '🎯',
              title: t.featureNoWatermarkTitle,
              description: t.featureNoWatermarkDesc
            },
            {
              icon: '🔒',
              title: t.featurePrivacyTitle,
              description: t.featurePrivacyDesc
            }
          ].map((feature, index) => (
            <div key={index} className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-200/50">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Supported Formats */}
        <div className="text-center mb-16">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">{t.supportedPlatforms}</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {[t.platforms.tiktok, t.platforms.douyin, t.platforms.shortLinks, t.platforms.shareLinks].map((platform) => (
              <span key={platform} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">
                {platform}
              </span>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="text-center text-gray-500">
            <p className="text-sm">
              {t.footerCopyright}
              <br className="sm:hidden" />
              <span className="text-xs opacity-75 ml-2">{t.footerEducational}</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}