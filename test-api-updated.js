// 使用不同URL测试API接口
async function testAPIWithDifferentUrls() {
  const testUrls = [
    'https://www.tiktok.com/@user/video/123456789', // TikTok URL
    'https://www.douyin.com/video/7126745726494821640', // 抖音长链接
    'https://v.douyin.com/ieFsJXQM/' // 尝试不同的抖音短链接
  ]
  
  for (const testUrl of testUrls) {
    console.log(`\n=== 测试URL: ${testUrl} ===`)
    
    try {
      const response = await fetch('http://localhost:3000/api/video/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: testUrl })
      })
      
      const result = await response.json()
      console.log('响应状态:', response.status)
      
      if (response.ok) {
        console.log('✅ 成功!')
        console.log('视频标题:', result.title)
        console.log('作者:', result.author)
        break // 找到一个成功的就停止
      } else {
        console.log('❌ 失败:', result.error)
      }
    } catch (error) {
      console.error('❌ 请求失败:', error.message)
    }
  }
}

// 同时测试isAvailable方法
async function testParserAvailability() {
  console.log('=== 测试解析器可用性 ===')
  
  try {
    // 直接测试API是否可达
    const testResponse = await fetch('https://api.douyin.wtf/api/hybrid/video_data?url=test', {
      method: 'GET',
      headers: {
        'User-Agent': 'TikTok-Downloader/1.0'
      }
    })
    
    console.log('API响应状态:', testResponse.status)
    console.log('API可用性:', testResponse.status === 200 || testResponse.status === 422 ? '✅ 可用' : '❌ 不可用')
    
    if (testResponse.status === 422) {
      const errorResult = await testResponse.json()
      console.log('API错误详情:', errorResult)
    }
  } catch (error) {
    console.error('API连接失败:', error.message)
  }
}

// 运行测试
async function runAllTests() {
  await testParserAvailability()
  await testAPIWithDifferentUrls()
}

runAllTests()