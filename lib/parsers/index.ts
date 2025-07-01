import { VideoParser, VideoInfo, DownloadOptions, DownloadResult, ParserError } from './interface'

export class ParserManager {
  private parsers: VideoParser[] = []
  
  register(parser: VideoParser): void {
    this.parsers.push(parser)
    this.parsers.sort((a, b) => a.priority - b.priority)
  }
  
  unregister(parserName: string): void {
    this.parsers = this.parsers.filter(p => p.name !== parserName)
  }
  
  async getAvailableParsers(): Promise<VideoParser[]> {
    const available = await Promise.all(
      this.parsers.map(async parser => ({
        parser,
        isAvailable: await parser.isAvailable()
      }))
    )
    
    return available
      .filter(({ isAvailable }) => isAvailable)
      .map(({ parser }) => parser)
  }
  
  async getInfo(url: string): Promise<VideoInfo> {
    const availableParsers = await this.getAvailableParsers()
    const errors: Error[] = []
    
    for (const parser of availableParsers) {
      if (!parser.canParse(url)) continue
      
      // 重试机制
      const maxRetries = this.getMaxRetries(parser)
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`尝试使用 ${parser.name} 解析器 (第${attempt + 1}次尝试)`)
          return await parser.getInfo(url)
        } catch (error) {
          errors.push(error as Error)
          console.error(`Parser ${parser.name} attempt ${attempt + 1} failed:`, error)
          
          if (attempt < maxRetries) {
            // 指数退避延迟
            await this.delay(1000 * Math.pow(2, attempt))
          }
        }
      }
    }
    
    if (errors.length > 0) {
      throw new ParserError(
        'All parsers failed to get video info',
        'ALL_PARSERS_FAILED',
        errors.map(e => e.message).join(', ')
      )
    }
    
    throw new ParserError('No parser available for this URL', 'NO_PARSER_AVAILABLE')
  }
  
  async download(url: string, options?: DownloadOptions): Promise<DownloadResult> {
    const availableParsers = await this.getAvailableParsers()
    const errors: Error[] = []
    
    for (const parser of availableParsers) {
      if (!parser.canParse(url)) continue
      
      // 重试机制
      const maxRetries = this.getMaxRetries(parser)
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`尝试使用 ${parser.name} 下载器 (第${attempt + 1}次尝试)`)
          return await parser.download(url, options)
        } catch (error) {
          errors.push(error as Error)
          console.error(`Parser ${parser.name} download attempt ${attempt + 1} failed:`, error)
          
          if (attempt < maxRetries) {
            await this.delay(1000 * Math.pow(2, attempt))
          }
        }
      }
    }
    
    if (errors.length > 0) {
      throw new ParserError(
        'All parsers failed to download video',
        'ALL_PARSERS_FAILED',
        errors.map(e => e.message).join(', ')
      )
    }
    
    throw new ParserError('No parser available for this URL', 'NO_PARSER_AVAILABLE')
  }
  
  private getMaxRetries(parser: VideoParser): number {
    // API解析器重试2次，其他解析器重试1次
    if (parser.name.includes('API')) {
      return 2
    }
    return 1
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Export singleton instance
export const parserManager = new ParserManager()

// Re-export types
export * from './interface'