'use client'

import { useEffect } from 'react'

interface GoogleAdsenseProps {
  adSlot: string
  adFormat?: 'auto' | 'rectangle' | 'vertical' | 'horizontal'
  adLayout?: string
  adLayoutKey?: string
  style?: React.CSSProperties
  className?: string
}

declare global {
  interface Window {
    adsbygoogle: any[]
  }
}

export default function GoogleAdsense({
  adSlot,
  adFormat = 'auto',
  adLayout,
  adLayoutKey,
  style = { display: 'block' },
  className = ''
}: GoogleAdsenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        (window.adsbygoogle = window.adsbygoogle || []).push({})
      }
    } catch (error) {
      console.error('AdSense error:', error)
    }
  }, [])

  return (
    <div className={`adsense-container ${className}`}>
      {/* 广告标识 - 符合AdSense政策要求 */}
      <div className="text-xs text-gray-400 text-center mb-2">
        广告
      </div>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-8752416319460616"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-ad-layout-key={adLayoutKey}
        data-full-width-responsive="true"
      />
    </div>
  )
}

// 预定义的广告位组件 - 减少广告数量，符合AdSense政策
export function ContentAd() {
  return (
    <div className="my-12">
      <GoogleAdsense
        adSlot="3456789012"
        adFormat="rectangle"
        className="my-8"
        style={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
      />
    </div>
  )
}

export function FooterAd() {
  return (
    <div className="mt-16">
      <GoogleAdsense
        adSlot="4567890123"
        adFormat="horizontal"
        className="mt-8"
        style={{ display: 'block', textAlign: 'center', minHeight: '90px' }}
      />
    </div>
  )
}
