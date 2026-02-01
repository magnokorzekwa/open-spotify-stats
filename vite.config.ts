import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import vuetify from 'vite-plugin-vuetify'
import Sitemap from 'vite-plugin-sitemap'

const HOSTNAME = 'https://oss.korzekwa.com.br'

export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    vuetify({ autoImport: true }),
    Sitemap({
      hostname: HOSTNAME,
      dynamicRoutes: [
        '/privacy',
        '/about',
        '/how-to-use'
      ]
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
