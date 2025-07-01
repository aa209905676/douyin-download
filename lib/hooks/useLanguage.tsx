'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Language, Translation, getTranslation, defaultLanguage } from '../i18n'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translation
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<Language>(defaultLanguage)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    try {
      // 从 localStorage 读取保存的语言设置
      const savedLanguage = localStorage.getItem('language') as Language
      if (savedLanguage && (savedLanguage === 'zh' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage)
      } else {
        // 如果没有保存的语言，尝试从浏览器语言检测
        const browserLanguage = navigator.language.toLowerCase()
        if (browserLanguage.startsWith('zh')) {
          setLanguageState('zh')
        } else {
          setLanguageState('en')
        }
      }
    } catch (error) {
      // localStorage 可能不可用，使用默认语言
      console.warn('localStorage not available, using default language')
      setLanguageState('zh')
    }
    setMounted(true)
  }, [])

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('language', lang)
  }

  const t = getTranslation(language)

  if (!mounted) {
    // 避免 SSR/CSR 不匹配
    return null
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}