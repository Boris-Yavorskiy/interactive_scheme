import type { Lang } from '../types'

export function getLang(): Lang {
  try {
    return localStorage.getItem('lang') === 'en' ? 'en' : 'uk'
  } catch (error) {
    return 'uk'
  }
}

export function saveLang(lang: Lang) {
  try {
    localStorage.setItem('lang', lang)
  } catch (error) {
    return
  }
}
