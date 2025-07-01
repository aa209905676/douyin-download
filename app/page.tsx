'use client'

import { useState, useEffect } from 'react'

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

const getFriendlyErrorMessage = (error: string, code: string) => {
  switch (code) {
    case 'NO_PARSER_AVAILABLE':
      return '视频解析服务暂时不可用，我们正在努力修复中。请稍后重试或联系技术支持。'
    case 'ALL_PARSERS_FAILED':
      return '所有解析服务都暂时无法使用。这可能是由于服务器维护或网络问题导致的，请稍后重试。'
    case 'API_REQUEST_FAILED':
      return '解析服务响应异常，请稍后重试。如果问题持续存在，可能是服务器正在维护中。'
    case 'API_ERROR':
      return '视频解析失败，请检查视频链接是否正确，或者该视频可能无法下载（私密视频或已删除）。'
    case 'NETWORK_ERROR':
      return '网络连接出现问题，请检查网络连接后重试。'
    case 'NO_DOWNLOAD_URL':
      return '无法获取该视频的下载链接，可能是视频设置了下载限制或格式不支持。'
    case 'NO_FORMAT_URL':
      return '请求的格式不可用，请尝试其他格式或稍后重试。'
    default:
      if (error?.includes('Invalid URL')) {
        return '请输入有效的 TikTok 或抖音视频链接。支持的格式包括：分享链接、短链接和完整链接。'
      }
      if (error?.includes('timeout')) {
        return '请求超时，服务器响应较慢。请稍后重试。'
      }
      if (error?.includes('400') || error?.includes('Bad Request')) {
        return '视频链接格式有误或该视频无法解析。请检查链接是否正确。'
      }
      return `服务暂时不可用：${error}。我们正在努力解决问题，请稍后重试。`
  }
}

export default function Home() {
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
        const friendlyError = getFriendlyErrorMessage(data.error, data.code)
        setError(friendlyError)
      }
    } catch {
      setError('网络连接失败，请检查网络连接后重试。如果问题持续存在，请稍后再试。')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: 'video' | 'audio') => {
    try {
      const response = await fetch('/api/video/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url, format }),
      })

      const data = await response.json()

      if (response.ok) {
        const link = document.createElement('a')
        link.href = data.url
        link.download = data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const friendlyError = getFriendlyErrorMessage(data.error, data.code)
        setError(`下载失败：${friendlyError}`)
      }
    } catch {
      setError('下载失败，网络连接出现问题。请检查网络连接后重试。')
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
              <h1 className="text-2xl font-semibold text-gray-900">TikTok Downloader</h1>
            </div>
            <div className="text-sm text-gray-500">Free & Fast</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Download TikTok videos
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              without watermarks
            </span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Paste any TikTok or Douyin video link and download it in seconds. 
            High quality, no watermarks, completely free.
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
                placeholder="请粘贴 TikTok 或抖音视频链接..."
                className="w-full px-6 py-4 text-lg bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>正在解析视频...</span>
                </span>
              ) : (
                '获取视频信息'
              )}
            </button>
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
                <h4 className="text-red-800 font-semibold text-lg mb-2">服务暂时不可用</h4>
                <p className="text-red-700 leading-relaxed mb-4">{error}</p>
                <div className="bg-red-100 rounded-lg p-4 border border-red-200">
                  <h5 className="text-red-800 font-medium mb-2">💡 解决建议：</h5>
                  <ul className="text-red-700 text-sm space-y-1">
                    <li>• 检查视频链接是否完整和正确</li>
                    <li>• 确保视频是公开的（非私密设置）</li>
                    <li>• 稍后重试，服务可能正在维护中</li>
                    <li>• 尝试使用其他 TikTok 或抖音链接</li>
                  </ul>
                </div>
                <button
                  onClick={() => setError('')}
                  className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  重新尝试
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
                      <span>👤 {videoInfo.author}</span>
                      <span>⏱️ {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</span>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Likes', value: videoInfo.stats.likes, color: 'text-pink-600', icon: '❤️' },
                      { label: 'Views', value: videoInfo.stats.views, color: 'text-blue-600', icon: '👁️' },
                      { label: 'Comments', value: videoInfo.stats.comments, color: 'text-green-600', icon: '💬' },
                      { label: 'Shares', value: videoInfo.stats.shares, color: 'text-purple-600', icon: '📤' }
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
                      <span>Download Video</span>
                    </button>
                    <button
                      onClick={() => handleDownload('audio')}
                      className="flex-1 flex items-center justify-center space-x-2 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <span>Download Audio</span>
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
              title: 'Lightning Fast',
              description: 'Download videos in seconds with our optimized servers'
            },
            {
              icon: '🎯',
              title: 'No Watermarks',
              description: 'Get clean videos without any watermarks or logos'
            },
            {
              icon: '🔒',
              title: 'Privacy First',
              description: 'No registration required, your data stays private'
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
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">Supported Platforms</h3>
          <div className="flex flex-wrap justify-center gap-4">
            {['TikTok', 'Douyin', 'Short Links', 'Share Links'].map((platform) => (
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
              © 2024 TikTok Downloader. Made with ❤️ for creators. 
              <br className="sm:hidden" />
              <span className="text-xs opacity-75 ml-2">For educational purposes only.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}