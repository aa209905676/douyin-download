// 测试API接口
async function testAPI() {
  const testUrl = "https://v.douyin.com/L4FJNR3/"
  
  try {
    console.log('测试视频信息接口...')
    const response = await fetch('http://localhost:3000/api/video/info', {
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
      console.log('✅ API测试成功!')
      console.log('视频标题:', result.title)
      console.log('作者:', result.author)
      console.log('点赞数:', result.stats?.likes)
      
      // 测试下载接口
      console.log('\n测试下载接口...')
      const downloadResponse = await fetch('http://localhost:3000/api/video/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: testUrl, format: 'video' })
      })
      
      const downloadResult = await downloadResponse.json()
      console.log('下载响应状态:', downloadResponse.status)
      console.log('下载结果:', JSON.stringify(downloadResult, null, 2))
      
      if (downloadResponse.ok) {
        console.log('✅ 下载API测试成功!')
        console.log('下载链接:', downloadResult.url)
        console.log('文件名:', downloadResult.filename)
      }
    } else {
      console.log('❌ API测试失败:', result.error)
    }
  } catch (error) {
    console.error('❌ 请求失败:', error.message)
  }
}

// 运行测试
testAPI()