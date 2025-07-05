/**
 * 链接提取工具
 * 从用户输入的文本中智能提取抖音/TikTok链接
 */

export interface ExtractedLink {
  url: string
  platform: 'douyin' | 'tiktok'
  type: 'short' | 'long'
  originalText: string
}

export class LinkExtractor {
  // 抖音链接模式
  private static readonly DOUYIN_PATTERNS = [
    // 短链接
    /https?:\/\/v\.douyin\.com\/[A-Za-z0-9]+\/?/g,
    // 长链接
    /https?:\/\/(www\.)?douyin\.com\/video\/\d+/g,
    /https?:\/\/(www\.)?douyin\.com\/discover\?modal_id=\d+/g,
    // 分享链接
    /https?:\/\/(www\.)?douyin\.com\/share\/video\/\d+/g,
  ]

  // TikTok链接模式
  private static readonly TIKTOK_PATTERNS = [
    // 短链接
    /https?:\/\/vm\.tiktok\.com\/[A-Za-z0-9]+\/?/g,
    // 长链接
    /https?:\/\/(www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/g,
    // 分享链接
    /https?:\/\/(www\.)?tiktok\.com\/t\/[A-Za-z0-9]+\/?/g,
  ]

  /**
   * 从文本中提取所有链接
   */
  static extractLinks(text: string): ExtractedLink[] {
    const links: ExtractedLink[] = []

    // 提取抖音链接
    this.DOUYIN_PATTERNS.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          links.push({
            url: match,
            platform: 'douyin',
            type: this.isShortLink(match) ? 'short' : 'long',
            originalText: text
          })
        })
      }
    })

    // 提取TikTok链接
    this.TIKTOK_PATTERNS.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) {
        matches.forEach(match => {
          links.push({
            url: match,
            platform: 'tiktok',
            type: this.isShortLink(match) ? 'short' : 'long',
            originalText: text
          })
        })
      }
    })

    // 去重
    return this.deduplicateLinks(links)
  }

  /**
   * 提取第一个有效链接
   */
  static extractFirstLink(text: string): ExtractedLink | null {
    const links = this.extractLinks(text)
    return links.length > 0 ? links[0] : null
  }

  /**
   * 判断是否为短链接
   */
  private static isShortLink(url: string): boolean {
    return url.includes('v.douyin.com') || 
           url.includes('vm.tiktok.com') || 
           url.includes('tiktok.com/t/')
  }

  /**
   * 去重链接
   */
  private static deduplicateLinks(links: ExtractedLink[]): ExtractedLink[] {
    const seen = new Set<string>()
    return links.filter(link => {
      if (seen.has(link.url)) {
        return false
      }
      seen.add(link.url)
      return true
    })
  }

  /**
   * 验证链接是否有效
   */
  static isValidLink(url: string): boolean {
    try {
      new URL(url)
      return this.DOUYIN_PATTERNS.some(pattern => pattern.test(url)) ||
             this.TIKTOK_PATTERNS.some(pattern => pattern.test(url))
    } catch {
      return false
    }
  }

  /**
   * 清理和标准化链接
   */
  static cleanLink(url: string): string {
    // 移除多余的参数和空格
    let cleaned = url.trim()
    
    // 确保有协议
    if (!cleaned.startsWith('http://') && !cleaned.startsWith('https://')) {
      cleaned = 'https://' + cleaned
    }

    return cleaned
  }

  /**
   * 从复制的分享文本中提取链接
   * 处理类似 "6.12 01/18 usr:/ i@C.HV 小巷人家# 创作灵感 # 80后 # 精彩片段 # 每日更新  https://v.douyin.com/GZnbct7tGrs/ 复制此链接，打开Dou音搜索，直接观看视频！" 的文本
   */
  static extractFromShareText(text: string): {
    link: ExtractedLink | null
    title?: string
    description?: string
  } {
    const link = this.extractFirstLink(text)
    
    if (!link) {
      return { link: null }
    }

    // 尝试提取标题和描述
    const result: any = { link }

    // 提取可能的标题（通常在链接前面，包含#标签）
    const titleMatch = text.match(/([^\/\n]*#[^\/\n]*?)(?=https?:\/\/)/i)
    if (titleMatch) {
      result.title = titleMatch[1].trim()
    }

    // 提取描述（通常在链接后面）
    const descMatch = text.match(/https?:\/\/[^\s]+\s+(.+)$/i)
    if (descMatch) {
      result.description = descMatch[1].trim()
    }

    return result
  }

  /**
   * 智能解析用户输入
   * 支持多种输入格式
   */
  static smartParse(input: string): {
    links: ExtractedLink[]
    metadata?: {
      title?: string
      description?: string
      platform?: string
    }
  } {
    const trimmedInput = input.trim()

    // 如果输入看起来像是分享文本
    if (trimmedInput.includes('#') && trimmedInput.includes('http')) {
      const shareResult = this.extractFromShareText(trimmedInput)
      return {
        links: shareResult.link ? [shareResult.link] : [],
        metadata: {
          title: shareResult.title,
          description: shareResult.description,
          platform: shareResult.link?.platform
        }
      }
    }

    // 普通链接提取
    const links = this.extractLinks(trimmedInput)
    
    return {
      links,
      metadata: links.length > 0 ? {
        platform: links[0].platform
      } : undefined
    }
  }
}

// 导出便捷函数
export const extractLink = LinkExtractor.extractFirstLink
export const extractLinks = LinkExtractor.extractLinks
export const isValidVideoLink = LinkExtractor.isValidLink
export const parseUserInput = LinkExtractor.smartParse
