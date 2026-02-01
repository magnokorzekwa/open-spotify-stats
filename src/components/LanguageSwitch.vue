<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings';
import { computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const settingsStore = useSettingsStore();
const { locale } = useI18n();

const languages = [
  { title: 'Português', value: 'pt', code: 'PT' },
  { title: 'English', value: 'en', code: 'EN' }
];

const currentLangCode = computed(() => {
  return languages.find(l => l.value === locale.value)?.code || 'PT';
});

const selectLanguage = (lang: 'pt' | 'en') => {
  settingsStore.setLanguage(lang);
  locale.value = lang;
};

if (settingsStore.language && settingsStore.language !== locale.value) {
  locale.value = settingsStore.language;
} else if (settingsStore.language !== locale.value) {
  settingsStore.setLanguage(locale.value as 'pt' | 'en');
}

watch(() => settingsStore.language, (newLang) => {
  if (newLang && locale.value !== newLang) {
    locale.value = newLang;
  }
});
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="text"
        class="text-none lang-btn"
        prepend-icon="mdi-translate"
      >
        {{ currentLangCode }}
        <v-icon icon="mdi-chevron-down" size="small" class="ml-1"></v-icon>
      </v-btn>
    </template>

    <v-list class="lang-list elevation-2" density="compact">
      <v-list-item
        v-for="lang in languages"
        :key="lang.value"
        :value="lang.value"
        @click="selectLanguage(lang.value as 'pt' | 'en')"
        :active="locale === lang.value"
        class="lang-item"
      >
        <v-list-item-title class="text-body-2">
          {{ lang.title }}
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/colors' as *;

.lang-btn {
  color: $secondaryTypograhyColor;
  font-weight: 500;
  border-radius: 8px;
  
  &:hover {
    background-color: rgba($primaryColor, 0.05);
    color: $primaryColor;
  }
}

.lang-list {
  background-color: $secondaryBackground;
  border: 1px solid $borderColor;
  padding: 4px;
  border-radius: 8px !important;
  margin-top: 8px;
}

.lang-item {
  color: $primaryTypograhyColor;
  border-radius: 4px;
  
  &:hover {
    background-color: rgba($primaryColor, 0.05);
    color: $primaryColor;
  }

  &--active {
    background-color: rgba($primaryColor, 0.1);
    color: $primaryColor;
    font-weight: 600;
  }
}
</style>