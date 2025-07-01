// 测试多API切换机制
async function testMultiAPI() {
  const testUrl = "https://v.douyin.com/ieFsJXQM/"
  
  console.log('=== 测试多API解析器切换机制 ===')
  console.log(`测试URL: ${testUrl}`)
  
  try {
    console.log('\n1. 测试第一个API (HybridAPI) 可用性...')
    const hybridResponse = await fetch('https://api.douyin.wtf/api/hybrid/video_data?url=test', {
      method: 'GET',
      headers: {
        'User-Agent': 'TikTok-Downloader/1.0'
      }
    })
    console.log(`HybridAPI 响应状态: ${hybridResponse.status}`)
    console.log(`HybridAPI 可用性: ${hybridResponse.status === 200 || hybridResponse.status === 422 ? '✅' : '❌'}`)
    
    console.log('\n2. 测试第二个API (LocalAPI) 可用性...')
    try {
      const localResponse = await fetch('http://127.0.0.1:6666/api/hybrid/video_data?url=test', {
        method: 'GET',
        headers: {
          'User-Agent': 'TikTok-Downloader/1.0'
        }
      })
      console.log(`LocalAPI 响应状态: ${localResponse.status}`)
      console.log(`LocalAPI 可用性: ${localResponse.status === 200 || localResponse.status === 422 ? '✅' : '❌'}`)
    } catch (error) {
      console.log(`LocalAPI 连接失败: ${error.message}`)
      console.log('LocalAPI 可用性: ❌')
    }
    
    console.log('\n3. 测试解析器管理器的自动切换机制...')
    const response = await fetch('http://localhost:3000/api/video/info', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: testUrl })
    })
    
    const result = await response.json()
    console.log('最终响应状态:', response.status)
    
    if (response.ok) {
      console.log('✅ 解析成功!')
      console.log('使用的解析器:', '通过日志查看')
      console.log('视频标题:', result.title)
      console.log('作者:', result.author)
    } else {
      console.log('❌ 解析失败:', result.error)
      console.log('错误代码:', result.code)
    }
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message)
  }
}

// 测试不同场景
async function testScenarios() {
  console.log('\n=== 测试场景分析 ===')
  
  // 场景1: 第一个API可用
  console.log('场景1: 如果HybridAPI可用，应该优先使用它')
  
  // 场景2: 第一个API不可用，第二个API可用
  console.log('场景2: 如果HybridAPI不可用，应该自动切换到LocalAPI')
  
  // 场景3: 两个API都不可用
  console.log('场景3: 如果两个API都不可用，应该返回"No parser available"错误')
  
  await testMultiAPI()
}

testScenarios()