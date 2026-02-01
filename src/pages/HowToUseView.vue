<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';

const { t } = useI18n();
const spotifyPrivacyUrl = 'https://www.spotify.com/account/privacy/';

useHead({
  title: computed(() => `${t('header.how_to_use')} - ${t('header.logo')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('tutorial.subtitle'))
    }
  ]
})

const steps = computed(() => [
  {
    title: t('tutorial.steps.step1.title'),
    text: t('tutorial.steps.step1.text'),
    icon: 'mdi-web',
  },
  {
    title: t('tutorial.steps.step2.title'),
    text: t('tutorial.steps.step2.text'),
    icon: 'mdi-account-lock',
  },
  {
    title: t('tutorial.steps.step3.title'),
    text: t('tutorial.steps.step3.text'),
    icon: 'mdi-database-search',
    highlight: true,
  },
  {
    title: t('tutorial.steps.step4.title'),
    text: t('tutorial.steps.step4.text'),
    icon: 'mdi-email-check',
  },
  {
    title: t('tutorial.steps.step5.title'),
    text: t('tutorial.steps.step5.text'),
    icon: 'mdi-timer-sand',
  },
]);

const openSpotifyPrivacy = () => {
  window.open(spotifyPrivacyUrl, '_blank');
};
</script>

<template>
  <v-container class="fill-height align-start py-8 py-md-12 page-container px-4 px-md-6" fluid>
    <v-row justify="center" no-gutters>
      <v-col cols="12" md="10" lg="8">
        
        <div class="text-center mb-8 mb-md-12 animate-fade-in">
          <v-avatar color="secondary" size="80" class="mb-4 elevation-2">
            <v-icon icon="mdi-file-download-outline" size="40" class="logo-icon"></v-icon>
          </v-avatar>
          <h1 class="text-h4 text-md-h3 font-weight-bold page-title mb-2 text-wrap">
            {{ t('tutorial.title') }}
          </h1>
          <p class="subtitle-text mx-auto px-2" style="max-width: 700px">
            {{ t('tutorial.subtitle') }}
          </p>
        </div>

        <v-row class="mb-8">
          <v-col cols="12">
            <v-alert
              icon="mdi-information"
              color="primary"
              variant="tonal"
              class="mb-8 pa-4 pa-md-6 info-alert"
            >
              <h3 class="text-h6 font-weight-bold mb-2" style="color: inherit">{{ t('tutorial.important_note.title') }}</h3>
              <p 
                class="text-body-1" 
                style="color: inherit; opacity: 0.9"
                v-html="t('tutorial.important_note.text')"
              ></p>
            </v-alert>

            <div class="d-flex flex-column gap-4">
              <v-card 
                v-for="(step, index) in steps" 
                :key="index"
                class="step-card pa-4 pa-md-6" 
                :class="{ 'highlight-step': step.highlight }"
                elevation="0"
              >
                <div class="d-flex align-start">
                  <div class="step-number mr-6 hidden-sm-and-down">
                    <span>{{ index + 1 }}</span>
                  </div>
                  <div class="pt-1 mr-3 mr-md-4 flex-shrink-0">
                     <v-icon :icon="step.icon" size="32" color="primary"></v-icon>
                  </div>
                  <div class="flex-grow-1" style="min-width: 0;"> <h3 class="text-h6 font-weight-bold mb-2 card-title text-wrap">
                      <span class="hidden-md-and-up mr-2">{{ index + 1 }}.</span>
                      {{ step.title }}
                    </h3>
                    <p class="body-text text-body-1 mb-0" v-html="step.text"></p>
                  </div>
                </div>
              </v-card>
            </div>

          </v-col>
        </v-row>

        <v-divider class="my-8 my-md-10 border-opacity-25"></v-divider>

        <div class="text-center px-2">
          <p class="body-text mb-6 font-weight-medium" style="font-size: 1.1rem">
            {{ t('tutorial.cta_text') }}
          </p>
          
          <v-btn
            size="x-large"
            prepend-icon="mdi-spotify"
            variant="flat"
            class="spotify-btn text-none px-6 px-md-10 py-4 w-100 w-sm-auto"
            @click="openSpotifyPrivacy"
          >
            <span class="text-truncate">{{ t('tutorial.cta_btn') }}</span>
          </v-btn>
          <p class="text-caption text-disabled mt-4">
            {{ t('tutorial.cta_disclaimer') }}
          </p>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/colors' as *;

.page-container {
  max-width: 1920px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
  overflow-x: hidden; 
  box-sizing: border-box;
}

.logo-icon {
  color: $primaryColor;
}

.page-title {
  color: $primaryTypograhyColor;
  letter-spacing: -1px;
  word-break: break-word; 
  hyphens: auto;
}

.subtitle-text {
  color: $secondaryTypograhyColor;
  font-size: 1.1rem;
  line-height: 1.6;
}

.card-title {
  color: $primaryTypograhyColor;
  word-break: break-word;
}

.body-text {
  color: $secondaryTypograhyColor;
  line-height: 1.7;
  word-break: break-word;
}

.info-alert {
    border-color: rgba($primaryColor, 0.2) !important;
}

.step-card {
  background-color: $secondaryBackground;
  border: 1px solid $borderColor;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    border-color: rgba($primaryColor, 0.5);
    transform: translateY(-2px);
  }

  &.highlight-step {
    border-color: $primaryColor;
    background: linear-gradient(to right, rgba($primaryColor, 0.05), $secondaryBackground);

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: $primaryColor;
    }
  }
}

.step-number {
  font-size: 2.5rem;
  font-weight: 900;
  color: $borderColor;
  line-height: 1;
  opacity: 0.5;
  user-select: none;
}

.spotify-btn {
  background-color: #1DB954;
  color: #fff;
  font-weight: 700;
  font-size: 1.1rem;
  transition: all 0.2s;
  border-radius: 50px;
  max-width: 100%; 

  &:hover {
    background-color: color.scale(#1DB954, $lightness: 5%);
    transform: scale(1.02);
    box-shadow: 0 6px 20px rgba(#1DB954, 0.4);
  }
}

.gap-4 {
  gap: 16px;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 380px) {
  .page-title {
    font-size: 1.75rem !important;
  }
  .spotify-btn {
    font-size: 1rem;
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}
</style>