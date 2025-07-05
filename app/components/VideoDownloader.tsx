'use client'

import { useState, useEffect } from 'react'
import { parseUserInput } from '../../lib/utils/linkExtractor'

interface VideoInfo {
  title: string
  author: string
  thumbnail: string
  duration: number
  videoUrl: string
  audioUrl: string
  stats: {
    likes: number
    views: number
    comments: number
    shares: number
  }
}

interface ExtractedInfo {
  platform: string
  linkType: string
  title?: string
  description?: string
}

export function VideoDownloader() {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null)
  const [extractedInfo, setExtractedInfo] = useState<ExtractedInfo | null>(null)
  const [error, setError] = useState('')
  const [step, setStep] = useState<'input' | 'processing' | 'result'>('input')

  const handleInputChange = (value: string) => {
    setInput(value)
    setError('')
    
    // 实时预览链接提取
    if (value.trim()) {
      const result = parseUserInput(value)
      if (result.links.length > 0) {
        setExtractedInfo({
          platform: result.links[0].platform,
          linkType: result.links[0].type,
          title: result.metadata?.title,
          description: result.metadata?.description
        })
      } else {
        setExtractedInfo(null)
      }
    } else {
      setExtractedInfo(null)
    }
  }

  const handleSubmit = async () => {
    if (!input.trim()) {
      setError('请输入视频链接或分享文本')
      return
    }

    setLoading(true)
    setError('')
    setStep('processing')

    try {
      // 1. 提取链接
      const extractResponse = await fetch('/api/extract-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      })

      if (!extractResponse.ok) {
        const extractError = await extractResponse.json()
        throw new Error(extractError.error || '链接提取失败')
      }

      const extractResult = await extractResponse.json()
      const videoUrl = extractResult.data.primaryLink.url

      // 2. 获取视频信息
      const infoResponse = await fetch('/api/video/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl })
      })

      if (!infoResponse.ok) {
        const infoError = await infoResponse.json()
        throw new Error(infoError.error || '获取视频信息失败')
      }

      const info = await infoResponse.json()
      setVideoInfo(info)
      setStep('result')

    } catch (err) {
      setError(err instanceof Error ? err.message : '处理失败')
      setStep('input')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (format: 'video' | 'audio') => {
    if (!extractedInfo || !videoInfo) return

    try {
      const result = parseUserInput(input)
      const videoUrl = result.links[0]?.url

      const response = await fetch('/api/video/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: videoUrl, format })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || '下载失败')
      }

      const downloadInfo = await response.json()
      
      // 创建下载链接
      const link = document.createElement('a')
      link.href = downloadInfo.url
      link.download = downloadInfo.filename
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

    } catch (err) {
      setError(err instanceof Error ? err.message : '下载失败')
    }
  }

  const reset = () => {
    setInput('')
    setVideoInfo(null)
    setExtractedInfo(null)
    setError('')
    setStep('input')
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            视频下载器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            支持抖音、TikTok视频下载，智能识别分享文本
          </p>
        </div>

        {/* 主卡片 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
          
          {step === 'input' && (
            <div className="p-8">
              {/* 输入区域 */}
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  粘贴视频链接或分享文本
                </label>
                
                <div className="relative">
                  <textarea
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="粘贴抖音或TikTok的分享文本，例如：&#10;&#10;6.12 01/18 usr:/ i@C.HV 小巷人家# 创作灵感 # 80后 # 精彩片段 # 每日更新  https://v.douyin.com/GZnbct7tGrs/ 复制此链接，打开Dou音搜索，直接观看视频！&#10;&#10;或者直接粘贴视频链接：&#10;https://v.douyin.com/GZnbct7tGrs/"
                    className="w-full h-32 px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
                    disabled={loading}
                  />
                  
                  {input && (
                    <button
                      onClick={() => setInput('')}
                      className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* 实时预览 */}
                {extractedInfo && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                        检测到 {extractedInfo.platform === 'douyin' ? '抖音' : 'TikTok'} 链接
                      </span>
                    </div>
                    {extractedInfo.title && (
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                        标题: {extractedInfo.title}
                      </p>
                    )}
                    <p className="text-xs text-blue-500 dark:text-blue-400">
                      链接类型: {extractedInfo.linkType === 'short' ? '短链接' : '长链接'}
                    </p>
                  </div>
                )}

                {/* 错误提示 */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-800">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
                    </div>
                  </div>
                )}

                {/* 提交按钮 */}
                <button
                  onClick={handleSubmit}
                  disabled={loading || !input.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium py-4 px-6 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>解析中...</span>
                    </div>
                  ) : (
                    '开始解析'
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="p-8 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">正在处理视频</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">请稍候，正在获取视频信息...</p>
              </div>
            </div>
          )}

          {step === 'result' && videoInfo && (
            <div className="p-8">
              {/* 视频信息 */}
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  {videoInfo.thumbnail && (
                    <img
                      src={videoInfo.thumbnail}
                      alt="视频缩略图"
                      className="w-24 h-24 rounded-xl object-cover"
                    />
                  )}
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {videoInfo.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      作者: {videoInfo.author}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>👍 {videoInfo.stats.likes.toLocaleString()}</span>
                      <span>👁️ {videoInfo.stats.views.toLocaleString()}</span>
                      <span>💬 {videoInfo.stats.comments.toLocaleString()}</span>
                      <span>🔄 {videoInfo.stats.shares.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* 下载按钮 */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => handleDownload('video')}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v18a1 1 0 01-1 1H4a1 1 0 01-1-1V1a1 1 0 011-1h2a1 1 0 011 1v3m0 0h8m-8 0V1" />
                      </svg>
                      <span>下载视频</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleDownload('audio')}
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-[1.02] shadow-lg"
                  >
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                      <span>下载音频</span>
                    </div>
                  </button>
                </div>

                {/* 重新开始按钮 */}
                <button
                  onClick={reset}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-3 px-6 rounded-xl transition-all duration-200"
                >
                  下载其他视频
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 底部说明 */}
        <div className="text-center mt-6 text-sm text-gray-500 dark:text-gray-400">
          <p>支持抖音、TikTok平台 • 智能识别分享文本 • 高清无水印下载</p>
        </div>
      </div>
    </div>
  )
}
