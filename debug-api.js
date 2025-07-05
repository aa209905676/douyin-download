// 调试API返回的原始数据
async function debugAPI() {
  const testUrl = "https://v.douyin.com/IDnB4VdOKNg/"
  
  try {
    console.log('=== 调试视频信息接口 ===')
    console.log('测试URL:', testUrl)
    
    const response = await fetch('http://localhost:3001/api/video/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl })
    })
    
    const result = await response.json()
    console.log('响应状态:', response.status)
    
    if (response.ok) {
      console.log('\n=== 返回的视频信息 ===')
      console.log('标题:', result.title)
      console.log('作者:', result.author)
      console.log('视频URL:', result.videoUrl || '❌ 空')
      console.log('音频URL:', result.audioUrl ? '✅ 有' : '❌ 空')
      console.log('缩略图:', result.thumbnail || '❌ 空')
      console.log('时长:', result.duration, '毫秒')
      
      console.log('\n=== 统计数据 ===')
      console.log('点赞:', result.stats.likes)
      console.log('评论:', result.stats.comments)
      console.log('分享:', result.stats.shares)
      console.log('播放:', result.stats.views)
      
      // 检查音频URL的详细信息
      if (result.audioUrl) {
        console.log('\n=== 音频URL详情 ===')
        if (typeof result.audioUrl === 'string') {
          console.log('音频URL (字符串):', result.audioUrl)
        } else if (typeof result.audioUrl === 'object') {
          console.log('音频URL (对象):', JSON.stringify(result.audioUrl, null, 2))
        }
      }
      
      // 测试音频下载
      if (result.audioUrl) {
        console.log('\n=== 测试音频下载 ===')
        try {
          const audioResponse = await fetch('http://localhost:3001/api/video/download', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url: testUrl, format: 'audio' })
          })
          
          const audioResult = await audioResponse.json()
          console.log('音频下载状态:', audioResponse.status)
          
          if (audioResponse.ok) {
            console.log('✅ 音频下载成功!')
            console.log('下载URL:', audioResult.url)
            console.log('文件名:', audioResult.filename)
            console.log('MIME类型:', audioResult.mimeType)
          } else {
            console.log('❌ 音频下载失败:', audioResult.error)
          }
        } catch (error) {
          console.log('❌ 音频下载请求失败:', error.message)
        }
      }
      
      // 测试视频下载（即使videoUrl为空也试试）
      console.log('\n=== 测试视频下载 ===')
      try {
        const videoResponse = await fetch('http://localhost:3001/api/video/download', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url: testUrl, format: 'video' })
        })
        
        const videoResult = await videoResponse.json()
        console.log('视频下载状态:', videoResponse.status)
        
        if (videoResponse.ok) {
          console.log('✅ 视频下载成功!')
          console.log('下载URL:', videoResult.url)
          console.log('文件名:', videoResult.filename)
          console.log('MIME类型:', videoResult.mimeType)
        } else {
          console.log('❌ 视频下载失败:', videoResult.error)
          console.log('错误代码:', videoResult.code)
        }
      } catch (error) {
        console.log('❌ 视频下载请求失败:', error.message)
      }
      
    } else {
      console.log('❌ API调用失败:', result.error)
      console.log('错误代码:', result.code)
    }
    
  } catch (error) {
    console.error('❌ 请求失败:', error.message)
  }
}

// 运行调试
debugAPI()
