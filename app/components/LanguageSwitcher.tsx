'use client'

import { useState, useRef, useEffect } from 'react'
import { useLanguage } from '../../lib/hooks/useLanguage'
import { Language } from '../../lib/i18n'

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Debug: 确保数据正确加载
  if (!language || !t) {
    return (
      <div className="flex items-center space-x-2 px-4 py-2.5 bg-white/80 border border-gray-200/60 rounded-xl">
        <span className="text-lg">🌐</span>
        <span className="text-sm text-gray-500">Loading...</span>
      </div>
    )
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const languages = [
    { code: 'zh' as Language, name: t?.chinese || '中文', flag: '🇨🇳' },
    { code: 'en' as Language, name: t?.english || 'English', flag: '🇺🇸' }
  ]

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0]

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-gray-50 border-2 border-gray-400 hover:border-gray-500 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400"
        aria-label={t?.language || 'Language'}
      >
        <span className="text-lg">{currentLanguage.flag}</span>
        <span className="text-sm font-semibold text-gray-800 group-hover:text-gray-900 hidden sm:inline">
          {currentLanguage.name}
        </span>
        <svg 
          className={`w-4 h-4 text-gray-600 group-hover:text-gray-800 transition-all duration-200 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Mobile backdrop */}
          <div className="fixed inset-0 bg-black bg-opacity-25 z-40 sm:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown */}
          <div className="absolute top-full right-0 mt-2 w-44 bg-white border-2 border-gray-400 rounded-xl shadow-xl z-50 py-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  setLanguage(lang.code)
                  setIsOpen(false)
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-100 active:bg-gray-200 transition-colors duration-150 ${
                  language === lang.code 
                    ? 'bg-blue-100 text-blue-800 font-semibold' 
                    : 'text-gray-800 hover:text-gray-900'
                }`}
              >
                <span className="text-lg">{lang.flag}</span>
                <span className="text-sm font-medium flex-1">{lang.name}</span>
                {language === lang.code && (
                  <svg className="w-4 h-4 text-blue-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}