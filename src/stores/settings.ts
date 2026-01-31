import type { LanguageType, Settings } from '@/types/Settings'
import { defineStore } from 'pinia'
import i18n from '@/plugins/i18n'
import type { Composer } from 'vue-i18n'

export const useSettingsStore = defineStore('settings', {
    state: (): Settings => ({
        minStreamDuration: 30 as number,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: (localStorage.getItem('language') || 'en') as LanguageType
    }),
    actions: {
        setLanguage(lang: LanguageType) {
            this.language = lang
            const globalI18n = i18n.global as unknown as Composer
            globalI18n.locale.value = lang
            localStorage.setItem('language', lang)
        }
    }
})
