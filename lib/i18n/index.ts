import { zh } from './translations/zh'
import { en } from './translations/en'
import { Language, Translation } from './types'

export const translations: Record<Language, Translation> = {
  zh,
  en
}

export const defaultLanguage: Language = 'zh'

export const getTranslation = (language: Language): Translation => {
  return translations[language] || translations[defaultLanguage]
}

export * from './types'