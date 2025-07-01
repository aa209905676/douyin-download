// 专门测试本地API
async function testLocalAPI() {
  console.log('=== 测试本地API (127.0.0.1:6666) ===')
  
  // 测试不同的URL
  const testUrls = [
    'https://v.douyin.com/ieFsJXQM/',
    'https://www.tiktok.com/@user/video/123456789'
  ]
  
  for (const testUrl of testUrls) {
    console.log(`\n测试URL: ${testUrl}`)
    
    try {
      const response = await fetch('http://localhost:3002/api/video/info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: testUrl })
      })
      
      const result = await response.json()
      console.log('响应状态:', response.status)
      console.log('响应结果:', JSON.stringify(result, null, 2))
      
      if (response.ok) {
        console.log('✅ 解析成功!')
        break
      } else {
        console.log('❌ 解析失败:', result.error)
      }
    } catch (error) {
      console.error('❌ 请求失败:', error.message)
    }
  }
}

testLocalAPI()