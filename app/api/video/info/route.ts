import { NextRequest, NextResponse } from 'next/server'
import { parserManager } from '@/lib/parsers/registry'

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
    const { url } = body
    
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'URL is required' },
        {
          status: 400,
          headers: corsHeaders()
        }
      )
    }
    
    // Extract URL from text if needed
    const extractUrl = (text: string): string => {
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
        if (match) {
          return match[0]
        }
      }
      
      return text.trim()
    }
    
    const extractedUrl = extractUrl(url)
    
    // Validate URL format
    try {
      new URL(extractedUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        {
          status: 400,
          headers: corsHeaders()
        }
      )
    }
    
    // Get video info using parser manager
    const info = await parserManager.getInfo(extractedUrl)

    return NextResponse.json(info, {
      headers: corsHeaders()
    })
    
  } catch (error) {
    console.error('Error getting video info:', error)
    
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