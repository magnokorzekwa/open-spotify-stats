import { createI18n } from 'vue-i18n'
import pt from '@/locales/pt.json'
import en from '@/locales/en.json'

type MessageSchema = typeof pt

const i18n = createI18n<[MessageSchema], 'pt' | 'en'>({
  legacy: false,
  locale: localStorage.getItem('language') || 'pt',
  fallbackLocale: 'en',
  messages: {
    pt,
    en
  }
})

export default i18n