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

// 预定义的广告位组件
export function HeaderAd() {
  return (
    <GoogleAdsense
      adSlot="1234567890"
      adFormat="horizontal"
      className="mb-6"
      style={{ display: 'block', textAlign: 'center', minHeight: '90px' }}
    />
  )
}

export function SidebarAd() {
  return (
    <GoogleAdsense
      adSlot="2345678901"
      adFormat="vertical"
      className="sticky top-24"
      style={{ display: 'block', width: '300px', minHeight: '250px' }}
    />
  )
}

export function ContentAd() {
  return (
    <GoogleAdsense
      adSlot="3456789012"
      adFormat="rectangle"
      className="my-8"
      style={{ display: 'block', textAlign: 'center', minHeight: '250px' }}
    />
  )
}

export function FooterAd() {
  return (
    <GoogleAdsense
      adSlot="4567890123"
      adFormat="horizontal"
      className="mt-8"
      style={{ display: 'block', textAlign: 'center', minHeight: '90px' }}
    />
  )
}
