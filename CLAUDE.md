# TikTok 视频下载网站

## 项目概述
一个基于 Next.js 的抖音/TikTok视频下载网站，支持通过链接下载无水印视频。采用策略模式设计，支持多种解析方式，默认使用第三方API解析，支持多层级容错机制。

## 技术栈
- **前端**: Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **后端**: Next.js API Routes
- **视频解析**: 第三方API (默认) / Python库 / 网页解析
- **国际化**: React Context + localStorage (支持中文/英文)
- **部署**: Vercel

## 项目结构
```
tiktok-downloader/
├── app/                    # Next.js 应用
│   ├── api/               # API 路由
│   │   └── video/         # 视频相关API
│   │       ├── info/      # 获取视频信息
│   │       └── download/  # 下载视频
│   ├── components/        # React 组件
│   └── page.tsx          # 主页面
├── lib/                   # 核心库
│   ├── parsers/          # 解析器实现
│   │   ├── interface.ts  # 解析器接口
│   │   ├── hybrid-api.ts # Hybrid-API解析器
│   │   ├── local-api.ts  # 本地API解析器
│   │   ├── registry.ts   # 解析器注册中心
│   │   └── index.ts      # 解析器管理器
│   ├── i18n/            # 国际化
│   │   ├── types.ts     # 类型定义
│   │   ├── translations/ # 翻译文件
│   │   │   ├── zh.ts    # 中文
│   │   │   └── en.ts    # 英文
│   │   └── index.ts     # 导出
│   └── hooks/           # React Hooks
│       └── useLanguage.tsx # 语言Hook
└── config/               # 配置文件
    └── parsers.json      # 解析器配置
```

## 核心架构

### 多层级解析策略
```
解析策略
├── API解析 (默认, 优先级1)
│   ├── HybridAPI (优先级1.1, 重试2次)
│   ├── RapidAPI (优先级1.2, 重试2次)
│   └── OtherAPI (优先级1.3, 重试2次)
├── Python库解析 (优先级2)
│   └── PythonScraper (重试1次)
└── 其他解析方式 (优先级3)
    ├── 直接网页解析
    └── 备用解析器
```

### 解析器接口
```typescript
interface VideoParser {
  name: string
  priority: number
  isAvailable(): Promise<boolean>
  canParse(url: string): boolean
  getInfo(url: string): Promise<VideoInfo>
  download(url: string, options?: DownloadOptions): Promise<DownloadResult>
}

interface VideoInfo {
  title: string
  author: string
  authorId: string
  thumbnail: string
  duration: number
  videoUrl?: string
  audioUrl?: string
  stats: {
    likes: number
    comments: number
    shares: number
    views: number
  }
  createdAt: Date
}
```

### 策略模式实现
- **智能切换**: API失败自动切换到Python库
- **细粒度控制**: 每个API独立配置和重试
- **容错能力**: 多层级备份策略
- **可配置**: 通过配置文件灵活调整策略和优先级

## 国际化 (i18n) 系统

### 支持语言
- **中文 (zh)**: 简体中文，默认语言
- **英文 (en)**: English

### 架构设计
```typescript
// 语言类型定义
type Language = 'zh' | 'en'

// 翻译接口
interface Translation {
  appTitle: string
  heroTitle: string
  // ... 其他翻译键
}

// 使用Context + Hook
const { t, language, setLanguage } = useLanguage()
```

### 功能特性
- **自动检测**: 首次访问根据浏览器语言自动设置
- **持久化**: localStorage 保存用户语言偏好
- **组件化**: 独立的语言切换器组件
- **Apple风格**: 现代化下拉菜单设计
- **响应式**: 移动端适配和优化
- **SSR友好**: 避免水合不匹配问题

### 语言切换器特性
- **视觉效果**: 国旗图标 + 语言名称
- **交互优化**: 悬停效果、动画过渡
- **移动适配**: 触摸友好、背景遮罩
- **状态指示**: 当前语言高亮显示
- **键盘导航**: 支持键盘操作

### 翻译覆盖范围
- 界面文本: 标题、按钮、提示信息
- 错误消息: 多种错误场景的友好提示
- 功能说明: 特性介绍、使用指南
- 表单输入: 占位符、验证信息

## API 设计

### 1. 获取视频信息
```
POST /api/video/info
Body: { url: string }
Response: VideoInfo
```

### 2. 下载视频
```
POST /api/video/download
Body: { url: string, format: 'video' | 'audio' }
Response: { url: string, filename: string, size?: number, mimeType: string }
```

## 支持的URL格式

### 抖音 (Douyin)
- 分享口令: `7.43 pda:/ 让你在几秒钟之内记住我  https://v.douyin.com/L5pbfdP/ 复制此链接`
- 短网址: `https://v.douyin.com/L4FJNR3/`
- 正常网址: `https://www.douyin.com/video/6914948781100338440`
- 发现页网址: `https://www.douyin.com/discover?modal_id=7069543727328398622`

### TikTok
- 短网址: `https://www.tiktok.com/t/ZTR9nDNWq/`
- 正常网址: `https://www.tiktok.com/@evil0ctal/video/7156033831819037994`
- 移动端链接: `https://vm.tiktok.com/xxx/`, `https://vt.tiktok.com/xxx/`

## 第三方API集成

### Hybrid-API (默认)
- **端点**: `https://api.douyin.wtf/api/hybrid/video_data`
- **参数**: `url` (视频链接), `minimal` (可选)
- **特点**: 支持抖音和TikTok混合解析
- **优先级**: 1

### Local-API (备用)
- **端点**: `http://127.0.0.1:6666/api/hybrid/video_data`
- **参数**: `url` (视频链接), `minimal` (可选)
- **特点**: 本地API服务，作为备用解析器
- **优先级**: 2

## 前端功能
1. 单链接下载
2. 视频信息预览
3. 格式选择（视频/音频）
4. 下载历史记录
5. 响应式设计

## 安全措施
1. URL验证和清理
2. 请求频率限制
3. 文件大小限制
4. 错误处理和重试机制
5. API密钥管理

## 开发进度
- [x] 创建 Next.js 项目
- [x] 创建 CLAUDE.md 文档
- [x] 实现解析器接口和策略模式
- [x] 创建 Hybrid-API 解析器
- [x] 创建 Local-API 解析器
- [x] 实现 API 路由
- [x] 创建前端界面
- [x] 集成配置系统
- [x] 测试多API切换机制
- [x] 错误处理和TypeScript类型优化

## API状态
- **Hybrid-API**: ❌ 当前不可用 (返回400错误)
- **Local-API**: ❌ 需要启动本地服务 (127.0.0.1:6666)
- **策略切换**: ✅ 正常工作，自动重试和切换

## 配置示例
```json
{
  "defaultStrategy": "api",
  "strategies": {
    "api": {
      "priority": 1,
      "retries": 2,
      "parsers": [
        {
          "type": "hybrid-api",
          "name": "HybridAPI",
          "priority": 1,
          "enabled": true,
          "config": {
            "baseUrl": "https://api.douyin.wtf",
            "timeout": 10000
          }
        },
        {
          "name": "LocalAPI", 
          "priority": 2,
          "config": {
            "baseUrl": "http://127.0.0.1:6666",
            "timeout": 10000
          }
        }
      ]
    }
  }
}
```

## 开发命令
```bash
# 安装依赖
npm install

# 开发模式
npm run dev

# 构建
npm run build

# 生产模式
npm start
```

## 注意事项
1. 第三方API需要稳定的网络连接
2. 建议配置多个备用解析器
3. 遵守相关法律法规，仅供个人学习使用
4. 定期检查API服务可用性