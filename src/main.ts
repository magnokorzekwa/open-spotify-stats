/*
    Spotify Stats Project
    Copyright (C) 2026 Magno Korzekwa

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.
*/

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVuetify } from 'vuetify'
import { mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'
import "iconify-icon"
import App from './App.vue'
import router from './router'
import i18n from './plugins/i18n'

const app = createApp(App)
const pinia = createPinia()
const vuetify = createVuetify({
  theme: {
    defaultTheme: 'darkCustom',
    themes: {
      darkCustom: {
        dark: true,
        colors: {
          primary: '#2563EB',
          secondary: '#7C3AED',
          success: '#22C55E',
          error: '#EF4444',

          background: '#0F172A',
          surface: '#020617',

          outline: '#1E293B',

          onBackground: '#E5E7EB',
          onSurface: '#E5E7EB',
        }
      }
    }
  },
  icons: {
    defaultSet: 'mdi',
    sets: { mdi },
  },
})

app.use(vuetify)
app.use(pinia)
app.use(router)
app.use(i18n)

app.mount('#app')
