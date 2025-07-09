#!/bin/bash

# TikTok Downloader 部署脚本
# 添加Google AdSense广告功能

echo "🚀 开始部署 TikTok Downloader (Google AdSense版本)..."

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 发现未提交的更改，准备提交..."
    
    # 添加所有更改
    git add .
    
    # 提交更改
    git commit -m "feat: 集成Google AdSense广告系统

- 添加GoogleAdsense组件，支持多种广告格式
- 在主页面添加头部、内容和底部广告位
- 在layout.tsx中集成AdSense脚本
- 添加广告样式和响应式设计
- 优化广告加载状态显示

广告位置：
- 头部广告：Hero Section之后
- 内容广告：视频信息和功能介绍之间  
- 底部广告：页脚之前

技术改进：
- 使用TypeScript类型安全
- 响应式广告布局
- 优雅的加载状态
- 符合Google AdSense政策"
    
    echo "✅ 代码已提交到本地仓库"
else
    echo "ℹ️  没有发现未提交的更改"
fi

# 推送到远程仓库
echo "📤 推送到远程仓库..."
git push origin main

if [ $? -eq 0 ]; then
    echo "🎉 部署成功！"
    echo ""
    echo "📋 部署摘要："
    echo "   ✅ Google AdSense 广告系统已集成"
    echo "   ✅ 三个广告位已添加（头部、内容、底部）"
    echo "   ✅ 响应式广告设计已实现"
    echo "   ✅ 代码已推送到远程仓库"
    echo ""
    echo "🔧 下一步操作："
    echo "   1. 在Google AdSense中创建广告单元"
    echo "   2. 替换广告位ID (adSlot) 为真实的广告单元ID"
    echo "   3. 验证网站域名并等待审核通过"
    echo "   4. 监控广告展示和收入数据"
    echo ""
    echo "📝 广告位配置："
    echo "   - 头部广告: 横幅格式，适合展示品牌广告"
    echo "   - 内容广告: 矩形格式，适合展示相关内容广告"  
    echo "   - 底部广告: 横幅格式，适合展示行动号召广告"
    echo ""
    echo "🌐 如果使用Vercel部署，更改将自动部署到生产环境"
else
    echo "❌ 推送失败，请检查网络连接和仓库权限"
    exit 1
fi
