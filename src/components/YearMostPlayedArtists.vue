<script setup lang="ts">
import { computed } from 'vue';
import type { TopArtist } from '@/types/DataManipulation';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  dados: TopArtist[]
}>();

const hasMultiple = computed(() => props.dados.length > 1);
const hasSingle = computed(() => props.dados.length === 1);

const topOne = computed(() => props.dados[0]);
const topOthers = computed(() => props.dados.slice(1, 5));
</script>

<template>
  <div class="titleDiv">
    <h1>{{ t('top_artists.title') }}</h1>
  </div>
  
  <div class="mainDiv">
    <template v-if="hasMultiple">
      <div class="topOne">
        <v-tooltip target="cursor" location="end">
          <template #activator="{ props: activatorProps }">
            <div class="card" v-bind="activatorProps">
              <h1>{{ t('top_artists.rank_one') }}</h1>
              <h1>{{ topOne?.artist }}</h1>
            </div>
          </template>
          <span>{{ t('top_artists.streams_count', { count: topOne?.timesPlayed }) }}</span>
        </v-tooltip>
      </div>

      <div class="others">
        <v-tooltip 
          v-for="(artist, index) in topOthers" 
          :key="artist.artist"
          target="cursor" 
          location="start"
        >
          <template #activator="{ props: activatorProps }">
            <div class="card" v-bind="activatorProps">
              <h1>{{ index + 2 }}. {{ artist.artist }}</h1>
            </div>
          </template>
          <span>{{ t('top_artists.streams_count', { count: artist.timesPlayed }) }}</span>
        </v-tooltip>
      </div>
    </template>

    <div class="singleData" v-else-if="hasSingle">
      <v-tooltip location="bottom" :open-on-hover="false" open-on-click>
        <template #activator="{ props: activatorProps }">
          <div class="card" v-bind="activatorProps">
            <h1>{{ t('top_artists.rank_one') }}</h1>
            <h1>{{ topOne?.artist }}</h1>
          </div>
        </template>
        <span>{{ t('top_artists.streams_count', { count: topOne?.timesPlayed }) }}</span>
      </v-tooltip>
    </div>

    <div class="singleData" v-else>
      <h1>{{ t('top_artists.empty') }}</h1>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '../styles/colors' as *;

.titleDiv {
  display: flex;
  justify-content: start;
  margin-top: 35px;
  margin-bottom: 25px;
  user-select: none;

  @media (max-width: 768px) {
    justify-content: center;
    
    h1 {
      font-size: 1.5rem;
      text-align: center;
    }
  }
}

.mainDiv {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  user-select: none;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 0 16px;
  }
}

.card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 16px;
  border-radius: 12px;
  border: 2px solid $borderColor;
  transition: background-color 0.5s ease, transform 0.2s ease;
  box-sizing: border-box; 

  &:hover {
    transform: scale(1.05);
  }
}

.topOne {
  display: flex;
  flex-direction: column;
  padding-right: 10px;

  @media (max-width: 768px) {
    padding-right: 0;
    min-height: 200px;
  }

  .card {
    width: 100%;
    height: 100%;
    align-items: flex-end;
    background-color: $primaryBackground;
    cursor: pointer;
    overflow: hidden;

    &:hover {
      background-color: color.scale($primaryBackground, $lightness: -10%);
      transform: scale(1.01);
    }
    
    @media (max-width: 768px) {
       align-items: center;
       text-align: center;
    }
  }

  h1 {
    margin: 0;
    word-break: break-word;
  }
}

.others {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .card {
    align-items: flex-start; 
    justify-content: center; 
    min-width: 300px;
    min-height: 60px; 
    height: auto; 
    cursor: pointer;
    padding: 12px 16px; 

    @media (max-width: 768px) {
      min-width: unset;
      width: 100%;
    }

    &:hover {
      background-color: color.scale($primaryBackground, $lightness: 25%);
    }
  }

  h1 {
    margin: 0;
    font-weight: 400;
    font-size: 1.3rem; 
    line-height: 1.3;
    word-break: break-word; 
  }
}

.singleData {
  grid-column: 1 / -1;
  width: 100%;
  min-height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;

  .card {
    align-items: center;
    background-color: $primaryBackground;
    min-width: min(600px, 90vw);
    cursor: pointer;

    @media (max-width: 768px) {
      min-width: 100%;
      text-align: center;
    }

    &:hover {
      background-color: color.scale($primaryBackground, $lightness: -10%);
    }
  }
}
</style>