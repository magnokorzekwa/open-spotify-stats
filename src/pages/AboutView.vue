<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const projectVersion = import.meta.env.PACKAGE_VERSION || '1.0.0';

const techStack = [
  { name: 'Vue.js 3', icon: 'mdi-vuejs', color: '#42b883' },
  { name: 'TypeScript', icon: 'mdi-language-typescript', color: '#3178c6' },
  { name: 'Web Workers', icon: 'mdi-cogs', color: '#ff9800' },
  { name: 'Pinia', icon: 'mdi-fruit-pineapple', color: '#ffe01b' },
];

const features = computed(() => [
  {
    title: t('about.features.wrapped.title'),
    icon: 'mdi-calendar-check',
    text: t('about.features.wrapped.text')
  },
  {
    title: t('about.features.control.title'),
    icon: 'mdi-tune-vertical',
    text: t('about.features.control.text')
  },
  {
    title: t('about.features.opensource.title'),
    icon: 'mdi-github',
    text: t('about.features.opensource.text')
  }
]);

const openGithub = () => {
  window.open('https://github.com/magnokorzekwa/open-spotify-stats', '_blank');
};
</script>

<template>
  <v-container class="fill-height align-start py-12 page-container" fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        
        <div class="text-center mb-12 animate-fade-in">
          <v-avatar color="secondary" size="80" class="mb-4 elevation-2">
            <v-icon icon="mdi-chart-bar-stacked" size="40" class="logo-icon"></v-icon>
          </v-avatar>
          <h1 class="text-h3 font-weight-bold page-title mb-2">{{ t('about.title') }}</h1>
          <p class="subtitle-text">
            {{ t('about.subtitle') }}
          </p>
        </div>

        <v-row class="mb-8">
          <v-col cols="12">
            <v-card class="about-card pa-8" elevation="0">
              <h2 class="text-h5 font-weight-bold mb-4 card-title">{{ t('about.mission.title') }}</h2>
              <p class="body-text" v-html="t('about.mission.text')"></p>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col 
            v-for="(feature, index) in features" 
            :key="index" 
            cols="12" 
            md="4"
          >
            <v-card class="feature-card h-100 pa-6" elevation="0">
              <div class="d-flex flex-column align-center text-center h-100">
                <v-icon 
                  :icon="feature.icon" 
                  size="40" 
                  class="feature-icon mb-4"
                ></v-icon>
                <h3 class="text-h6 font-weight-bold mb-3 card-title">{{ feature.title }}</h3>
                <p class="body-text text-body-2">{{ feature.text }}</p>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div class="mt-12">
          <p class="text-overline text-center mb-6 text-disabled">{{ t('about.powered_by') }}</p>
          <div class="d-flex justify-center flex-wrap gap-4 tech-stack">
            <v-chip
              v-for="tech in techStack"
              :key="tech.name"
              variant="outlined"
              class="tech-chip ma-2"
              :style="{ borderColor: tech.color }"
            >
              <template #prepend>
                <v-icon :icon="tech.icon" :color="tech.color" start></v-icon>
              </template>
              <span class="tech-text">{{ tech.name }}</span>
            </v-chip>
          </div>
        </div>

        <v-divider class="my-10 border-opacity-25"></v-divider>

        <div class="text-center">
          <p class="body-text mb-6" v-html="t('about.footer.community_note')"></p>
          
          <v-btn
            size="large"
            prepend-icon="mdi-github"
            variant="flat"
            class="github-btn text-none px-8 mb-6"
            @click="openGithub"
          >
            {{ t('about.footer.github_btn') }}
          </v-btn>

          <div class="copyright-section pt-4">
             <p class="text-caption text-disabled font-weight-medium mb-1" v-html="t('about.footer.developed_by')"></p>
             <p class="text-caption text-disabled" style="opacity: 0.7">
               {{ t('about.footer.copyright') }}
             </p>
             <p class="text-caption text-disabled mt-2">{{ t('about.footer.version', { version: projectVersion }) }}</p>
          </div>

        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/colors' as *;

.logo-icon {
  color: $primaryColor;
}

.page-title {
  color: $primaryTypograhyColor;
  letter-spacing: -1px;
}

.subtitle-text {
  color: $secondaryTypograhyColor;
  font-size: 1.1rem;
}

.about-card, .feature-card {
  background-color: $secondaryBackground;
  border: 1px solid $borderColor;
  transition: all 0.3s ease;
}

.feature-card:hover {
  border-color: $primaryColor;
  transform: translateY(-4px);
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
}

.card-title {
  color: $primaryTypograhyColor;
}

.feature-icon {
  color: $primaryColor;
  opacity: 0.8;
}

.body-text {
  color: $secondaryTypograhyColor;
  line-height: 1.7;
}

.tech-chip {
  background-color: transparent !important;
  transition: transform 0.2s;
  
  &:hover {
    transform: scale(1.05);
  }

  .tech-text {
    color: $secondaryTypograhyColor;
    font-weight: 500;
  }
}

.github-btn {
  background-color: $primaryColor;
  color: #fff;
  font-weight: 600;
  transition: background-color 0.2s;

  &:hover {
    background-color: $primaryColorHover;
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

.page-container {
  max-width: 1920px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.copyright-section {
  border-top: 1px solid rgba($borderColor, 0.5);
  max-width: 300px;
  margin: 0 auto;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>