<script setup lang="ts">
import { computed } from 'vue';
import type { MostSkipped } from '@/types/DataManipulation';
import { useI18n } from 'vue-i18n';
import { useSettingsStore } from '@/stores/settings';

const { t } = useI18n();
const settingsStore = useSettingsStore();

const props = defineProps<{
  mostSkipped: MostSkipped,
  listeningPeriod: string,
  mostUsedPlatform: string
}>();

const currentPeriod = computed(() => {
  const key = props.listeningPeriod;
  if (['morning', 'afternoon', 'night'].includes(key)) {
    return {
      phrase: t(`curious_stats.day_night.${key}.phrase`),
      name: t(`curious_stats.day_night.${key}.name`),
      icon: key === 'night' ? "solar:moon-bold" : "solar:sun-bold"
    };
  }
  return {
    phrase: t('curious_stats.day_night.phrase'),
    name: t('curious_stats.day_night.name'),
    icon: "solar:sun-bold"
  };
});

const currentPlatform = computed(() => {
  if (props.mostUsedPlatform === 'desktop') {
    return {
      phrase: t('curious_stats.platform.desktop.phrase'),
      name: t('curious_stats.platform.desktop.name'),
      icon: "jam:computer"
    };
  }
  return {
    phrase: t('curious_stats.platform.default_phrase'),
    name: t('curious_stats.platform.default_name'),
    icon: "jam:phone"
  };
});
</script>

<template>
  <div class="stats-container">
    <div class="title-div">
      <h1>{{ t('curious_stats.title') }}</h1>
    </div>

    <div class="grid-layout">
      <article class="card hated-artist">
        <div class="icon-wrapper">
          <iconify-icon icon="bx:tired" width="64" height="64"></iconify-icon>
        </div>
        <div class="content">
          <h1>{{ t('curious_stats.hated_artist.title') }}</h1>
          <h2>{{ props.mostSkipped.mostSkippedArtist }} - {{ props.mostSkipped.mostSkippedTrack }}</h2>
          <h4>{{ t('curious_stats.hated_artist.description', { count: props.mostSkipped.mostSkippedCount, limit: settingsStore.minStreamDuration }) }}</h4>
        </div>
      </article>

      <article 
        class="card day-night-person" 
        :class="{ 'is-night': props.listeningPeriod === 'night' }"
      >
        <div class="content">
          <h1>{{ currentPeriod.phrase }}</h1>
          <h3>{{ t('curious_stats.day_night.preference', { period: currentPeriod.name }) }}</h3>
        </div>
        <div class="icon-wrapper">
          <iconify-icon :icon="currentPeriod.icon" width="64" height="64"></iconify-icon>
        </div>
      </article>

      <article class="card main-device">
        <div class="icon-wrapper">
          <iconify-icon :icon="currentPlatform.icon" width="64" height="64"></iconify-icon>
        </div>
        <div class="content">
          <h1>{{ currentPlatform.phrase }}</h1>
          <h3>{{ t('curious_stats.platform.preference', { device: currentPlatform.name }) }}</h3>
        </div>
      </article>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../styles/colors' as *;

.stats-container {
  width: 100%;
  padding: 0 16px;
  box-sizing: border-box;
}

.title-div {
  margin-top: 65px;
  margin-bottom: 25px;
  text-align: center;

  h1 {
    font-size: 2rem;
    
    @media (max-width: 768px) {
      font-size: 1.5rem;
      margin-top: 40px;
    }
  }
}

.grid-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  width: 100%;
  user-select: none;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@keyframes shakeX {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
  20%, 40%, 60%, 80% { transform: translateX(3px); }
}

@keyframes glow {
  0%, 100% { filter: drop-shadow(0 0 0 rgba(255,255,255,0)); }
  50% { filter: drop-shadow(0 0 12px rgba(255,255,255,0.9)); }
}

.card {
  position: relative;
  overflow: hidden;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid $borderColor;
  border-radius: 12px;
  padding: 25px;
  cursor: pointer;
  box-sizing: border-box;
  background-color: transparent;

  > * {
    position: relative;
    z-index: 1;
  }

  .content {
    text-align: center;
    
    h1 { font-size: 1.25rem; margin-bottom: 0.5rem; }
    h2 { font-size: 1rem; margin-bottom: 0.25rem; }
    h3, h4 { font-size: 0.875rem; opacity: 0.9; }
  }

  &::before {
    content: "";
    position: absolute;
    inset: 0;
    opacity: 0;
    transition: transform 0.6s ease, opacity 0.6s ease;
  }

  &:hover::before {
    transform: translateX(0);
    opacity: 1;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 20px;
    text-align: center;

    .icon-wrapper {
      margin: 0 0 16px 0 !important;
    }

    &.day-night-person {
      flex-direction: column-reverse;
    }
  }
}

.hated-artist {
  &::before {
    background-color: color.scale($secondaryColor, $lightness: -25%);
    transform: translateX(-100%);
  }

  .icon-wrapper {
    margin-right: 50px;
  }

  &:hover .icon-wrapper {
    animation: shakeX 0.6s linear;
  }
}

.day-night-person {
  &::before {
    background-color: color.scale(yellow, $lightness: -15%);
    transform: translateX(100%);
  }

  .icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-left: 50px;
    transition: transform 0.6s ease, filter 0.3s ease;
  }

  &:hover .icon-wrapper {
    transform: scale(1.3) rotate(360deg);
  }

  &.is-night {
    &::before {
      background-color: $primaryBackground;
    }

    &:hover .icon-wrapper {
      transform: none;
      filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.9));
    }
  }
}

.main-device {
  grid-column: 1 / -1;

  &::before {
    background-color: color.scale($secondaryColor, $lightness: -15%);
    transition: opacity 0.6s ease;
  }

  .icon-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    margin-right: 50px;
  }

  &:hover .icon-wrapper {
    animation: glow 0.6s ease;
  }
}
</style>