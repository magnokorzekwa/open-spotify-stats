<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import LanguageSwitch from './LanguageSwitch.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const drawer = ref(false);

const menuItems = [
  { text: 'header.privacy', path: '/privacy', icon: 'mdi-shield-account' },
  { text: 'header.about', path: '/about', icon: 'mdi-information' },
  { text: 'header.how_to_use', path: '/how-to-use', icon: 'mdi-help-circle' }
];
</script>

<template>
  <header class="header">
    <div class="header-content">
      <div class="left">
        <RouterLink to="/" class="logo-link">
          <span class="logo">{{ t('header.logo') }}</span>
        </RouterLink>
      </div>

      <nav class="nav desktop-nav">
        <LanguageSwitch class="mr-2" />
        <RouterLink 
          v-for="item in menuItems" 
          :key="item.path" 
          :to="item.path" 
          class="link"
        >
          {{ t(item.text) }}
        </RouterLink>
      </nav>

      <div class="mobile-controls">
        <LanguageSwitch class="mr-2" />
        <v-btn icon="mdi-menu" variant="text" @click="drawer = true"></v-btn>
      </div>
    </div>
  </header>

  <v-navigation-drawer
    v-model="drawer"
    location="right"
    temporary
    class="mobile-drawer"
  >
    <div class="drawer-header pa-4">
      <span class="logo">{{ t('header.logo') }}</span>
      <v-btn icon="mdi-close" variant="text" density="compact" @click="drawer = false"></v-btn>
    </div>

    <v-divider></v-divider>

    <v-list nav>
      <v-list-item
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        :prepend-icon="item.icon"
        :title="t(item.text)"
        @click="drawer = false"
      ></v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<style lang="scss" scoped>
@use '@/styles/colors' as *;

.header {
  width: 100%;
  background-color: $secondaryBackground;
  border-bottom: 1px solid $borderColor;
  position: relative;
  z-index: 50;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  max-width: 1920px;
  margin-inline: auto;
  padding-inline: 24px;
}

.logo-link {
  text-decoration: none;
}

.logo {
  font-size: 1.15rem;
  font-weight: 700;
  color: $primaryTypograhyColor;
  letter-spacing: -0.3px;
}

.nav {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.link {
  text-decoration: none;
  color: $secondaryTypograhyColor;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;

  &:hover {
    color: $primaryColor;
  }

  &.router-link-active {
    color: $primaryColor;
    font-weight: 600;
  }
}

.mobile-controls {
  display: none;
  align-items: center;
}

.drawer-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.mobile-drawer {
  background-color: $secondaryBackground !important;
  border-left: 1px solid $borderColor;
}

@media (max-width: 768px) {
  .desktop-nav {
    display: none;
  }

  .mobile-controls {
    display: flex;
  }

  .header-content {
    padding-inline: 16px;
  }
}
</style>