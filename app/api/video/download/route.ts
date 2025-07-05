import { NextRequest, NextResponse } from 'next/server'
import { parserManager } from '@/lib/parsers/registry'

// CORS头部
function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  }
}

// URL提取函数
function extractUrl(text: string): string {
  const patterns = [
    /https?:\/\/(?:www\.)?tiktok\.com\/@[\w.-]+\/video\/\d+/,
    /https?:\/\/(?:www\.)?tiktok\.com\/t\/[\w]+/,
    /https?:\/\/vm\.tiktok\.com\/[\w]+/,
    /https?:\/\/vt\.tiktok\.com\/[\w]+/,
    /https?:\/\/(?:www\.)?douyin\.com\/video\/\d+/,
    /https?:\/\/v\.douyin\.com\/[\w_]+/,
    /https?:\/\/(?:www\.)?douyin\.com\/discover\?modal_id=\d+/
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) return match[0]
  }

  return text.trim()
}

// 错误响应
function errorResponse(message: string, status = 500, error?: any) {
  return NextResponse.json(
    {
      error: message,
      code: error?.code || 'UNKNOWN_ERROR',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    },
    { status, headers: corsHeaders() }
  )
}

// 下载处理函数
async function handleDownload(url: string, format: string, quality: string, watermark: boolean) {
  try {
    const extractedUrl = extractUrl(url)

    // 验证URL
    try {
      new URL(extractedUrl)
    } catch {
      return errorResponse('Invalid URL format', 400)
    }

    // 验证格式
    if (!['video', 'audio'].includes(format)) {
      return errorResponse('Invalid format. Must be "video" or "audio"', 400)
    }

    // 获取下载信息
    const result = await parserManager.download(extractedUrl, {
      format,
      quality,
      watermark
    })

    // 代理下载文件
    try {
      const response = await fetch(result.url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Referer': 'https://www.douyin.com/'
        },
        signal: AbortSignal.timeout(30000)
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch video: ${response.status}`)
      }

      const videoStream = response.body
      if (!videoStream) {
        throw new Error('No video stream available')
      }

      // 返回文件流，强制下载
      return new NextResponse(videoStream, {
        headers: {
          ...corsHeaders(),
          'Content-Type': 'application/octet-stream',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(result.filename)}"`,
          'Cache-Control': 'no-cache',
          'Content-Length': response.headers.get('content-length') || '',
        }
      })

    } catch (downloadError) {
      console.error('Direct download failed:', downloadError)

      // 备用方案：返回下载链接
      return NextResponse.json({
        success: true,
        url: result.url,
        filename: result.filename,
        size: result.size,
        mimeType: result.mimeType,
        message: 'Direct download failed, use this URL to download manually'
      }, { headers: corsHeaders() })
    }

  } catch (error) {
    console.error('Download error:', error)
    return errorResponse(error instanceof Error ? error.message : 'Unknown error', 500, error)
  }
}

// OPTIONS预检请求
export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders() })
}

// GET请求处理
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return errorResponse('URL parameter is required', 400)
  }

  const format = searchParams.get('format') || 'video'
  const quality = searchParams.get('quality') || 'high'
  const watermark = searchParams.get('watermark') === 'true'

  return handleDownload(url, format, quality, watermark)
}

// POST请求处理
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { url, format = 'video', quality = 'high', watermark = false } = body

    if (!url || typeof url !== 'string') {
      return errorResponse('URL is required', 400)
    }

    return handleDownload(url, format, quality, watermark)

  } catch (error) {
    console.error('POST error:', error)
    return errorResponse(error instanceof Error ? error.message : 'Invalid request', 400, error)
  }
}

