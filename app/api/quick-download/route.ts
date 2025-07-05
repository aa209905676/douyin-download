import { NextRequest, NextResponse } from 'next/server'
import { LinkExtractor } from '../../../lib/utils/linkExtractor'
import { parserManager } from '../../../lib/parsers/registry'

// 添加CORS头部
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// 处理OPTIONS预检请求
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders(),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { input, format = 'video', quality = 'high' } = body
    
    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: '请提供视频链接或分享文本' },
        { 
          status: 400,
          headers: corsHeaders()
        }
      )
    }

    // 1. 智能提取链接
    const parseResult = LinkExtractor.smartParse(input)
    
    if (parseResult.links.length === 0) {
      return NextResponse.json(
        { 
          error: '未找到有效的视频链接',
          suggestion: '请确保输入包含抖音或TikTok链接'
        },
        { 
          status: 400,
          headers: corsHeaders()
        }
      )
    }

    const videoUrl = parseResult.links[0].url
    
    // 2. 获取视频信息
    const videoInfo = await parserManager.getInfo(videoUrl)
    
    // 3. 下载视频
    const downloadResult = await parserManager.download(videoUrl, {
      format,
      quality,
      watermark: false
    })
    
    // 4. 返回下载信息，让前端触发浏览器下载
    // 生成友好的文件名
    const cleanTitle = videoInfo.title
      .replace(/[^\w\s\u4e00-\u9fff-]/g, '') // 保留中文、英文、数字、空格、连字符
      .replace(/\s+/g, '_') // 空格替换为下划线
      .substring(0, 50) // 限制长度

    const filename = `${cleanTitle}.${format === 'video' ? 'mp4' : 'mp3'}`

    // 返回下载信息
    return NextResponse.json({
      success: true,
      downloadUrl: downloadResult.url,
      filename: filename,
      originalFilename: downloadResult.filename,
      size: downloadResult.size,
      mimeType: downloadResult.mimeType,
      videoInfo: {
        title: videoInfo.title,
        author: videoInfo.author,
        duration: videoInfo.duration,
        thumbnail: videoInfo.thumbnail,
        stats: videoInfo.stats
      },
      platform: parseResult.links[0].platform
    }, {
      headers: corsHeaders()
    })
    
  } catch (error) {
    console.error('Quick download error:', error)
    
    const message = error instanceof Error ? error.message : 'Unknown error'
    const code = (error as { code?: string })?.code || 'UNKNOWN_ERROR'
    
    return NextResponse.json(
      { 
        error: message,
        code,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { 
        status: 500,
        headers: corsHeaders()
      }
    )
  }
}

// 支持GET请求用于测试
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const input = searchParams.get('input')
  const format = searchParams.get('format') || 'video'

  if (!input) {
    return NextResponse.json({
      message: 'Quick Download API',
      usage: 'POST /api/quick-download with { "input": "video link or share text", "format": "video|audio" }',
      example: {
        input: 'https://v.douyin.com/GZnbct7tGrs/',
        format: 'video'
      }
    }, {
      headers: corsHeaders()
    })
  }

  // 重定向到POST请求
  return NextResponse.redirect(new URL('/api/quick-download', request.url), {
    status: 307,
    headers: corsHeaders()
  })
}
