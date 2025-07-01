import { BaseParser, VideoInfo, DownloadOptions, DownloadResult, ParserError } from './interface'

export class HybridApiParser extends BaseParser {
  name = 'HybridAPI'
  priority = 1

  private baseUrl: string
  private timeout: number

  constructor(config?: { baseUrl?: string; timeout?: number }) {
    super()
    this.baseUrl = config?.baseUrl || 'https://api.douyin.wtf'
    this.timeout = config?.timeout || 10000
  }

  async isAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/hybrid/video_data?url=test`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': 'TikTok-Downloader/1.0'
        }
      })
      // 400也认为是可用的，因为这表示API服务正在运行，只是参数有问题
      return response.status === 200 || response.status === 400 || response.status === 422
    } catch {
      return false
    }
  }

  async getInfo(url: string): Promise<VideoInfo> {
    this.validateUrl(url)
    
    const cleanUrl = this.extractUrl(url)
    const apiUrl = `${this.baseUrl}/api/hybrid/video_data?url=${encodeURIComponent(cleanUrl)}&minimal=false`
    
    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout),
        headers: {
          'User-Agent': 'TikTok-Downloader/1.0',
          'Accept': 'application/json'
        }
      })

      if (!response.ok) {
        throw new ParserError(
          `API request failed: ${response.status} ${response.statusText}`,
          'API_REQUEST_FAILED',
          this.name
        )
      }

      const result = await response.json()
      
      if (result.code !== 200) {
        throw new ParserError(
          `API returned error: ${result.code} - ${result.message || 'Unknown error'}`,
          'API_ERROR',
          this.name
        )
      }

      return this.mapToVideoInfo(result.data)
    } catch (error) {
      if (error instanceof ParserError) throw error
      
      throw new ParserError(
        `Failed to get video info: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'NETWORK_ERROR',
        this.name
      )
    }
  }

  async download(url: string, options?: DownloadOptions): Promise<DownloadResult> {
    // 先获取视频信息，从中提取下载链接
    const info = await this.getInfo(url)
    
    if (!info.videoUrl && !info.audioUrl) {
      throw new ParserError(
        'No download URL available',
        'NO_DOWNLOAD_URL',
        this.name
      )
    }

    const downloadUrl = options?.format === 'audio' ? info.audioUrl : info.videoUrl
    
    if (!downloadUrl) {
      throw new ParserError(
        `No ${options?.format || 'video'} URL available`,
        'NO_FORMAT_URL',
        this.name
      )
    }

    // 生成文件名
    const extension = options?.format === 'audio' ? 'mp3' : 'mp4'
    const filename = `${this.sanitizeFilename(info.title)}.${extension}`

    return {
      url: downloadUrl,
      filename,
      mimeType: options?.format === 'audio' ? 'audio/mpeg' : 'video/mp4'
    }
  }

  private mapToVideoInfo(data: Record<string, unknown>): VideoInfo {
    // 根据API返回的数据结构进行映射
    const author = data.author as Record<string, unknown> | undefined
    const statistics = data.statistics as Record<string, unknown> | undefined
    const stats = data.stats as Record<string, unknown> | undefined
    const music = data.music as Record<string, unknown> | undefined
    const cover = data.cover as string[] | undefined
    const dynamicCover = data.dynamic_cover as string[] | undefined
    const play = data.play as string[] | undefined
    
    return {
      title: (data.title as string) || (data.desc as string) || 'Unknown Title',
      author: (author?.nickname as string) || (author?.unique_id as string) || 'Unknown Author',
      authorId: (author?.unique_id as string) || (author?.sec_uid as string) || '',
      thumbnail: cover?.[0] || dynamicCover?.[0] || '',
      duration: (data.duration as number) || 0,
      videoUrl: play?.[0] || (data.video_url as string) || '',
      audioUrl: (music?.play_url as string) || (data.audio_url as string) || '',
      stats: {
        likes: (statistics?.digg_count as number) || (stats?.like_count as number) || 0,
        comments: (statistics?.comment_count as number) || (stats?.comment_count as number) || 0,
        shares: (statistics?.share_count as number) || (stats?.share_count as number) || 0,
        views: (statistics?.play_count as number) || (stats?.view_count as number) || 0
      },
      createdAt: data.create_time ? new Date((data.create_time as number) * 1000) : new Date()
    }
  }
}