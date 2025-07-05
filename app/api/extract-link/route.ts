import { NextRequest, NextResponse } from 'next/server'
import { LinkExtractor } from '../../../lib/utils/linkExtractor'

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
    const { input } = await request.json()

    if (!input || typeof input !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a text string.' },
        {
          status: 400,
          headers: corsHeaders()
        }
      )
    }

    // 智能解析用户输入
    const result = LinkExtractor.smartParse(input)

    if (result.links.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid video links found in the input text.',
          suggestion: 'Please make sure you include a valid Douyin or TikTok link.'
        },
        {
          status: 400,
          headers: corsHeaders()
        }
      )
    }

    // 返回解析结果
    return NextResponse.json({
      success: true,
      data: {
        primaryLink: result.links[0],
        allLinks: result.links,
        metadata: result.metadata,
        extractedInfo: {
          platform: result.links[0].platform,
          linkType: result.links[0].type,
          title: result.metadata?.title,
          description: result.metadata?.description
        }
      }
    }, {
      headers: corsHeaders()
    })

  } catch (error) {
    console.error('Link extraction error:', error)
    return NextResponse.json(
      { error: 'Failed to extract link from input text.' },
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

  if (!input) {
    return NextResponse.json({
      message: 'Link Extractor API',
      usage: 'POST /api/extract-link with { "input": "your text with video link" }',
      example: {
        input: '6.12 01/18 usr:/ i@C.HV 小巷人家# 创作灵感 # 80后 # 精彩片段 # 每日更新  https://v.douyin.com/GZnbct7tGrs/ 复制此链接，打开Dou音搜索，直接观看视频！'
      }
    }, {
      headers: corsHeaders()
    })
  }

  // 处理GET请求中的输入
  const result = LinkExtractor.smartParse(input)

  return NextResponse.json({
    success: result.links.length > 0,
    data: result.links.length > 0 ? {
      primaryLink: result.links[0],
      allLinks: result.links,
      metadata: result.metadata
    } : null,
    error: result.links.length === 0 ? 'No valid links found' : null
  }, {
    headers: corsHeaders()
  })
}
