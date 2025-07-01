'use client'

import { useState } from 'react'

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

export default function Home() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [error, setError] = useState('')

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
        setError(data.error || 'Failed to get video info')
      }
    } catch {
      setError('Network error occurred')
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
        // 创建下载链接
        const link = document.createElement('a')
        link.href = data.url
        link.download = data.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        setError(data.error || 'Failed to download video')
      }
    } catch {
      setError('Download failed')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
            TikTok Downloader
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Download TikTok and Douyin videos without watermark
          </p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-400">
            <span className="bg-gray-800 px-3 py-1 rounded-full">🎵 Audio & Video</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full">🚫 No Watermark</span>
            <span className="bg-gray-800 px-3 py-1 rounded-full">⚡ Fast Download</span>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Paste TikTok or Douyin URL here..."
              className="flex-1 px-6 py-4 text-lg bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Analyzing...
                </span>
              ) : (
                'Get Info'
              )}
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-900/50 border border-red-700 rounded-xl text-red-300">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Video Info */}
        {videoInfo && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Thumbnail */}
              {videoInfo.thumbnail && (
                <div className="lg:w-1/3">
                  <img
                    src={videoInfo.thumbnail}
                    alt={videoInfo.title}
                    className="w-full h-48 lg:h-64 object-cover rounded-xl"
                  />
                </div>
              )}
              
              {/* Info */}
              <div className="lg:w-2/3 space-y-4">
                <h2 className="text-2xl font-bold text-white mb-4">{videoInfo.title}</h2>
                
                <div className="flex items-center gap-4 text-gray-300">
                  <span className="font-medium">👤 {videoInfo.author}</span>
                  <span>⏱️ {Math.floor(videoInfo.duration / 60)}:{(videoInfo.duration % 60).toString().padStart(2, '0')}</span>
                </div>
                
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                  <div className="text-center bg-gray-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-pink-400">{videoInfo.stats.likes.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Likes</div>
                  </div>
                  <div className="text-center bg-gray-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-blue-400">{videoInfo.stats.views.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Views</div>
                  </div>
                  <div className="text-center bg-gray-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-green-400">{videoInfo.stats.comments.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Comments</div>
                  </div>
                  <div className="text-center bg-gray-700/50 rounded-lg p-3">
                    <div className="text-2xl font-bold text-yellow-400">{videoInfo.stats.shares.toLocaleString()}</div>
                    <div className="text-xs text-gray-400">Shares</div>
                  </div>
                </div>
                
                {/* Download Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8">
                  <button
                    onClick={() => handleDownload('video')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-semibold rounded-xl hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200"
                  >
                    📹 Download Video
                  </button>
                  <button
                    onClick={() => handleDownload('audio')}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all duration-200"
                  >
                    🎵 Download Audio
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16">
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-semibold text-white mb-2">Fast & Reliable</h3>
            <p className="text-gray-400">High-speed downloads with multiple backup servers</p>
          </div>
          
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-white mb-2">No Watermark</h3>
            <p className="text-gray-400">Download clean videos without any watermarks</p>
          </div>
          
          <div className="text-center p-6 bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-2xl">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-white mb-2">Safe & Secure</h3>
            <p className="text-gray-400">No registration required, your privacy is protected</p>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <p>© 2024 TikTok Downloader. For educational purposes only.</p>
        </footer>
      </div>
    </div>
  )
}