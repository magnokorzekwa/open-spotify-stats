<script setup lang="ts">
import { RouterLink } from 'vue-router';
import LanguageSwitch from './LanguageSwitch.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
</script>

<template>
  <header class="header">
    <div class="header-content">
      <div class="left">
        <RouterLink to="/" class="logo-link">
          <span class="logo">{{ t('header.logo') }}</span>
        </RouterLink>
      </div>

      <nav class="nav">
        <LanguageSwitch class="mr-2" />
        <RouterLink to="/privacidade" class="link">{{ t('header.privacy') }}</RouterLink>
        <RouterLink to="/sobre" class="link">{{ t('header.about') }}</RouterLink>
      </nav>
    </div>
  </header>
</template>

<style lang="scss" scoped>
@use '@/styles/colors' as *;

.header {
  width: 100%;
  background-color: $secondaryBackground;
  border-bottom: 1px solid $borderColor;
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

@media (max-width: 480px) {
  .logo {
    font-size: 1rem;
  }
  .nav {
    gap: 12px;
  }
  .header-content {
    padding-inline: 16px;
  }
}
</style>