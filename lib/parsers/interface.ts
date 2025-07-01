export interface VideoInfo {
  title: string
  author: string
  authorId: string
  thumbnail: string
  duration: number
  videoUrl?: string
  audioUrl?: string
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  createdAt: Date
}

export interface DownloadOptions {
  format?: 'video' | 'audio'
  quality?: 'high' | 'medium' | 'low'
  watermark?: boolean
}

export interface DownloadResult {
  url: string
  filename: string
  size?: number
  mimeType: string
}

export interface VideoParser {
  name: string
  priority: number
  isAvailable(): Promise<boolean>
  canParse(url: string): boolean
  getInfo(url: string): Promise<VideoInfo>
  download(url: string, options?: DownloadOptions): Promise<DownloadResult>
}

export abstract class BaseParser implements VideoParser {
  abstract name: string
  abstract priority: number

  async isAvailable(): Promise<boolean> {
    return true
  }

  canParse(url: string): boolean {
    const patterns = [
      // 抖音链接
      /https?:\/\/(www\.)?douyin\.com\/video\/\d+/,
      /https?:\/\/v\.douyin\.com\/[\w]+/,
      /https?:\/\/(www\.)?douyin\.com\/discover\?modal_id=\d+/,
      // TikTok链接
      /https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
      /https?:\/\/(www\.)?tiktok\.com\/t\/[\w]+/,
      /https?:\/\/vm\.tiktok\.com\/[\w]+/,
      /https?:\/\/vt\.tiktok\.com\/[\w]+/,
      // 分享口令（包含链接）
      /.*https?:\/\/v\.douyin\.com\/[\w]+.*/,
      /.*https?:\/\/(www\.)?tiktok\.com\/t\/[\w]+.*/
    ]
    
    return patterns.some(pattern => pattern.test(url))
  }

  abstract getInfo(url: string): Promise<VideoInfo>
  abstract download(url: string, options?: DownloadOptions): Promise<DownloadResult>

  protected validateUrl(url: string): void {
    if (!this.canParse(url)) {
      throw new Error(`Invalid TikTok/Douyin URL: ${url}`)
    }
  }

  protected normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url)
      // Remove tracking parameters
      urlObj.searchParams.delete('_r')
      urlObj.searchParams.delete('checksum')
      urlObj.searchParams.delete('sec_uid')
      urlObj.searchParams.delete('share_app_id')
      urlObj.searchParams.delete('share_link_id')
      urlObj.searchParams.delete('timestamp')
      return urlObj.toString()
    } catch {
      return url
    }
  }

  protected extractUrl(text: string): string {
    const patterns = [
      /https?:\/\/(?:www\.)?douyin\.com\/video\/\d+/,
      /https?:\/\/v\.douyin\.com\/[\w]+/,
      /https?:\/\/(?:www\.)?douyin\.com\/discover\?modal_id=\d+/,
      /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
      /https?:\/\/(?:www\.)?tiktok\.com\/t\/[\w]+/,
      /https?:\/\/vm\.tiktok\.com\/[\w]+/,
      /https?:\/\/vt\.tiktok\.com\/[\w]+/
    ]
    
    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) {
        return match[0]
      }
    }
    
    return text.trim()
  }

  protected sanitizeFilename(filename: string): string {
    return filename
      .replace(/[<>:"/\\|?*]/g, '_')
      .replace(/\s+/g, '_')
      .substring(0, 100)
  }
}

export class ParserError extends Error {
  constructor(
    message: string,
    public code: string,
    public parser?: string
  ) {
    super(message)
    this.name = 'ParserError'
  }
}