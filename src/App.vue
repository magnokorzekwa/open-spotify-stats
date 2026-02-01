<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useUiStore } from '@/stores/ui';
import { useHead } from '@unhead/vue'

import Header from './components/Header.vue';
import Footer from './components/Footer.vue';
import LoaderOverlay from './components/LoaderOverlay.vue';

const uiStore = useUiStore();
const { loading } = storeToRefs(uiStore);

useHead({
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": "Open Spotify Stats",
        "url": "https://oss.korzekwa.com.br",
        "potentialAction": {
          "@type": "SearchAction",
          "target": "https://oss.korzekwa.com.br/?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      })
    }
  ]
})
</script>

<template>
  <v-app class="app-wrapper">
    <LoaderOverlay :open="loading" />

    <Header />

    <v-main class="main-content">
      <RouterView v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </RouterView>
    </v-main>

    <Footer />
  </v-app>
</template>

<style lang="scss">
@use '@/styles/colors' as *;

.app-wrapper {
  min-height: 100vh;
  background-color: $primaryBackground !important;
  color: $primaryTypograhyColor;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}

.main-content {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 1;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>