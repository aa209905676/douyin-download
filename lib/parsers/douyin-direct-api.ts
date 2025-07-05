import { BaseParser, VideoInfo, DownloadOptions, DownloadResult, ParserError } from './interface'

export class DouyinDirectApiParser extends BaseParser {
  name = 'DouyinDirectAPI'
  priority = 3

  private readonly baseApiUrl = 'https://www.iesdouyin.com/web/api/v2'
  private readonly pcUserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
  private readonly mobileUserAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1'
  private timeout: number

  constructor(config?: { timeout?: number }) {
    super()
    this.timeout = config?.timeout || 15000
  }

  async isAvailable(): Promise<boolean> {
    try {
      // 测试API是否可达
      const testResponse = await fetch(`${this.baseApiUrl}/aweme/iteminfo/?item_ids=test`, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
        headers: {
          'User-Agent': this.pcUserAgent,
        }
      })

      // 只要服务器有响应就认为可用（即使是错误响应）
      return testResponse.status >= 200 && testResponse.status < 500
    } catch {
      return false
    }
  }

  canParse(url: string): boolean {
    // 只解析抖音链接，不处理TikTok
    const douyinPatterns = [
      /https?:\/\/(www\.)?douyin\.com\/video\/\d+/,
      /https?:\/\/v\.douyin\.com\/[\w]+/,
      /https?:\/\/(www\.)?douyin\.com\/discover\?modal_id=\d+/,
      // 分享口令（包含抖音链接）
      /.*https?:\/\/v\.douyin\.com\/[\w]+.*/,
    ]

    return douyinPatterns.some(pattern => pattern.test(url))
  }

  async getInfo(url: string): Promise<VideoInfo> {
    this.validateUrl(url)

    try {
      // 1. 提取和处理URL
      const cleanUrl = this.extractUrl(url)

      // 2. 如果是短链接，跟随重定向
      const finalUrl = await this.followRedirectIfNeeded(cleanUrl)

      // 3. 提取视频ID
      const videoId = await this.extractVideoId(finalUrl)

      // 4. 调用抖音API获取视频信息
      const videoData = await this.fetchVideoInfo(videoId)

      // 5. 映射到标准格式
      return this.mapToVideoInfo(videoData)

    } catch (error) {
      if (error instanceof ParserError) throw error

      throw new ParserError(
          `Failed to get video info from Douyin API: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'NETWORK_ERROR',
          this.name
      )
    }
  }

  async download(url: string, options?: DownloadOptions): Promise<DownloadResult> {
    // 先获取视频信息
    const info = await this.getInfo(url)

    if (!info.videoUrl && !info.audioUrl) {
      throw new ParserError(
          'No download URL available from Douyin API',
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

  /**
   * 如果是短链接则跟随重定向
   * 增强版：更好地处理重定向逻辑
   */
  private async followRedirectIfNeeded(url: string): Promise<string> {
    // 检查是否是短链接
    if (!url.includes('v.douyin.com')) {
      return url
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        redirect: 'manual', // 手动处理重定向
        signal: AbortSignal.timeout(this.timeout),
        headers: {
          'User-Agent': this.mobileUserAgent,
        }
      })

      // 检查 Location 头
      const location = response.headers.get('location')
      if (location) {
        return location
      }

      // 如果状态码是 302/301 但没有 location 头，尝试从响应体获取
      if (response.status >= 300 && response.status < 400) {
        // 某些情况下重定向信息可能在响应体中
        const text = await response.text()
        const match = text.match(/href="(.*?)"/i)
        if (match && match[1]) {
          return match[1]
        }
      }

      // 如果没有重定向，返回原URL
      return url
    } catch (error) {
      // 如果是 AbortError，说明超时
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ParserError(
            'Request timeout while following redirect',
            'TIMEOUT_ERROR',
            this.name
        )
      }

      throw new ParserError(
          `Failed to follow redirect: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'NETWORK_ERROR',
          this.name
      )
    }
  }

  /**
   * 从URL或页面中提取视频ID
   * 增强版：添加更多提取模式
   */
  private async extractVideoId(url: string): Promise<string> {
    // 首先尝试从URL直接提取
    const urlPatterns = [
      /video\/(\d+)/,
      /modal_id=(\d+)/,
      /note\/(\d+)/, // 图文笔记
      /aweme_id=(\d+)/, // URL参数形式
    ]

    for (const pattern of urlPatterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    // 如果URL中没有找到，尝试从页面HTML提取
    try {
      const response = await fetch(url, {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout),
        headers: {
          'User-Agent': this.pcUserAgent,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Cache-Control': 'no-cache',
          'Referer': 'https://www.douyin.com/',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const htmlContent = await response.text()

      // 尝试多种模式匹配视频ID
      const htmlPatterns = [
        /video\/(\d+)/,
        /itemId[=:"']+(\d+)/i,
        /aweme_id[=:"']+(\d+)/i,
        /"aweme_id":"(\d+)"/,
        /aweme_id=(\d+)/,
        /"aweme_id":(\d+)/,
        /data-aweme-id="(\d+)"/,
        /id[=:"']+(\d+)/i,
        // SSR渲染的数据
        /__RENDER_DATA__.*?"aweme_id":"(\d+)"/,
        // 新的模式
        /note\/(\d+)/,
        /"note_id":"(\d+)"/,
      ]

      for (const pattern of htmlPatterns) {
        const match = htmlContent.match(pattern)
        if (match && match[1]) {
          return match[1]
        }
      }

      throw new ParserError(
          'Unable to extract video ID from URL or page content',
          'INVALID_URL',
          this.name
      )
    } catch (error) {
      if (error instanceof ParserError) throw error

      // 超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ParserError(
            'Request timeout while extracting video ID',
            'TIMEOUT_ERROR',
            this.name
        )
      }

      throw new ParserError(
          `Failed to extract video ID: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'NETWORK_ERROR',
          this.name
      )
    }
  }

  /**
   * 调用抖音API获取视频信息
   * 增强版：更好的错误处理和重试机制
   */
  private async fetchVideoInfo(videoId: string): Promise<Record<string, any>> {
    const apiUrl = `${this.baseApiUrl}/aweme/iteminfo/?item_ids=${videoId}`

    try {
      const response = await fetch(apiUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(this.timeout),
        headers: {
          'User-Agent': this.pcUserAgent,
          'Accept': 'application/json',
          'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
          'Referer': 'https://www.douyin.com/',
          'Origin': 'https://www.douyin.com',
        }
      })

      if (!response.ok) {
        throw new ParserError(
            `Douyin API request failed: ${response.status} ${response.statusText}`,
            'API_REQUEST_FAILED',
            this.name
        )
      }

      const result = await response.json()

      // 检查API响应
      if (result.status_code !== 0) {
        throw new ParserError(
            `Douyin API error: ${result.status_msg || 'Unknown error'}`,
            'API_ERROR',
            this.name
        )
      }

      if (!result.aweme_list || result.aweme_list.length === 0) {
        throw new ParserError(
            'Video not found or unavailable',
            'VIDEO_NOT_FOUND',
            this.name
        )
      }

      return result.aweme_list[0]
    } catch (error) {
      if (error instanceof ParserError) throw error

      // 超时错误
      if (error instanceof Error && error.name === 'AbortError') {
        throw new ParserError(
            'Request timeout while fetching video info',
            'TIMEOUT_ERROR',
            this.name
        )
      }

      throw new ParserError(
          `Failed to fetch video info from Douyin API: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'NETWORK_ERROR',
          this.name
      )
    }
  }

  /**
   * 将抖音API数据映射到标准VideoInfo格式
   * 增强版：处理更多字段和边缘情况
   */
  private mapToVideoInfo(awemeData: Record<string, any>): VideoInfo {
    const author = awemeData.author || {}
    const statistics = awemeData.statistics || {}
    const video = awemeData.video || {}
    const music = awemeData.music || {}

    // 提取视频URL（优先高清）
    const playAddr = video.play_addr || {}
    const videoUrls = playAddr.url_list || []
    const downloadAddr = video.download_addr || {}
    const downloadUrls = downloadAddr.url_list || []

    // 选择最佳视频URL
    let bestVideoUrl = ''
    if (videoUrls.length > 0) {
      // 优先选择不带水印的URL
      bestVideoUrl = videoUrls.find((url: string) => url.includes('play-')) || videoUrls[0]
    } else if (downloadUrls.length > 0) {
      bestVideoUrl = downloadUrls[0]
    }

    // 提取音频URL
    const musicPlayUrl = music.play_url || {}
    const audioUrls = musicPlayUrl.url_list || []

    // 提取封面图（优先使用高清封面）
    const dynamicCover = video.dynamic_cover || {}
    const coverUrls = dynamicCover.url_list || []
    const originCover = video.origin_cover || {}
    const originCoverUrls = originCover.url_list || []
    const cover = video.cover || {}
    const staticCoverUrls = cover.url_list || []

    // 选择最佳封面
    const bestThumbnail = originCoverUrls[0] || coverUrls[0] || staticCoverUrls[0] || ''

    // 处理标题（如果没有描述，使用音乐标题或作者名）
    let title = awemeData.desc || ''
    if (!title || title.trim() === '') {
      if (music.title) {
        title = `${music.title} - ${author.nickname || 'Unknown'}`
      } else {
        title = `Video by ${author.nickname || 'Unknown'}`
      }
    }

    // 计算持续时间（毫秒转秒）
    const duration = video.duration ? Math.round(video.duration / 1000) : 0

    return {
      title: title,
      author: author.nickname || author.unique_id || 'Unknown Author',
      authorId: author.unique_id || author.sec_uid || '',
      thumbnail: bestThumbnail,
      duration: duration,
      videoUrl: bestVideoUrl,
      audioUrl: audioUrls[0] || '',
      stats: {
        likes: statistics.digg_count || 0,
        comments: statistics.comment_count || 0,
        shares: statistics.share_count || 0,
        views: statistics.play_count || 0,
        // 额外的统计信息
        collects: statistics.collect_count || 0,
        forwards: statistics.forward_count || 0,
      },
      createdAt: awemeData.create_time ? new Date(awemeData.create_time * 1000) : new Date(),
      // 额外的元数据
      metadata: {
        videoId: awemeData.aweme_id,
        isAd: awemeData.is_ad || false,
        region: awemeData.region || '',
        shareUrl: awemeData.share_url || '',
        musicInfo: music.title ? {
          id: music.id,
          title: music.title,
          author: music.author,
          coverUrl: music.cover_thumb?.url_list?.[0] || ''
        } : undefined
      }
    }
  }

  /**
   * 通用请求方法（类似 NestJS 版本）
   */
  async request(
      path: string,
      params: Record<string, any> = {},
      options: {
        useMobile?: boolean
        timeout?: number
      } = {}
  ): Promise<any> {
    const apiUrl = `${this.baseApiUrl}${path}`
    const searchParams = new URLSearchParams(params)
    const fullUrl = `${apiUrl}?${searchParams.toString()}`

    try {
      const response = await fetch(fullUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(options.timeout || this.timeout),
        headers: {
          'User-Agent': options.useMobile ? this.mobileUserAgent : this.pcUserAgent,
          'Accept': 'application/json',
          'Referer': 'https://www.douyin.com/',
        }
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      throw new ParserError(
          `API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          'NETWORK_ERROR',
          this.name
      )
    }
  }
}