<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useHead } from '@unhead/vue';
import { computed } from 'vue';

const { t } = useI18n();

useHead({
  title: computed(() => `${t('header.privacy')} - ${t('header.logo')}`),
  meta: [
    {
      name: 'description',
      content: computed(() => t('privacy.subtitle'))
    }
  ]
})
</script>

<template>
  <v-container class="fill-height align-start py-12 page-container" fluid>
    <v-row justify="center">
      <v-col cols="12" md="10" lg="8">
        
        <div class="text-center mb-12">
          <v-icon icon="mdi-shield-lock-outline" size="64" class="privacy-icon mb-4"></v-icon>
          <h1 class="text-h3 font-weight-bold page-title mb-2">{{ t('privacy.title') }}</h1>
          <p class="subtitle-text">
            {{ t('privacy.subtitle') }}
          </p>
        </div>

        <v-row>
          <v-col cols="12">
            <v-card class="privacy-card pa-6" elevation="0">
              <div class="d-flex align-start">
                <v-icon icon="mdi-server-off" size="32" class="section-icon mr-4 mt-1"></v-icon>
                <div>
                  <h2 class="text-h5 font-weight-bold mb-3 card-title">{{ t('privacy.zero_upload.title') }}</h2>
                  <p class="body-text mb-4" v-html="t('privacy.zero_upload.text')"></p>
                  <v-alert
                    color="rgba(var(--v-theme-primary), 0.1)"
                    border="start"
                    border-color="primary"
                    class="info-alert"
                  >
                    <span class="font-weight-medium">{{ t('privacy.zero_upload.guarantee_title') }}</span> 
                    {{ t('privacy.zero_upload.guarantee_text') }}
                  </v-alert>
                </div>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="privacy-card pa-6 h-100" elevation="0">
              <div class="d-flex flex-column h-100">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-database-remove" size="28" class="section-icon mr-3"></v-icon>
                  <h3 class="text-h6 font-weight-bold card-title">{{ t('privacy.volatile_storage.title') }}</h3>
                </div>
                <p class="body-text flex-grow-1" v-html="t('privacy.volatile_storage.text')"></p>
              </div>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card class="privacy-card pa-6 h-100" elevation="0">
              <div class="d-flex flex-column h-100">
                <div class="d-flex align-center mb-4">
                  <v-icon icon="mdi-scale-balance" size="28" class="section-icon mr-3"></v-icon>
                  <h3 class="text-h6 font-weight-bold card-title">{{ t('privacy.auditability.title') }}</h3>
                </div>
                <p class="body-text flex-grow-1" v-html="t('privacy.auditability.text')"></p>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <div class="text-center mt-12 legal-footer">
          <p class="mb-2">
            {{ t('privacy.footer.no_affiliation') }}
          </p>
          <p>
            {{ t('privacy.footer.data_usage') }}
          </p>
        </div>

      </v-col>
    </v-row>
  </v-container>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/colors' as *;

.privacy-icon {
  color: $primaryColor;
}

.page-title {
  color: $primaryTypograhyColor;
  letter-spacing: -1px;
}

.subtitle-text {
  color: $secondaryTypograhyColor;
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

.privacy-card {
  background-color: $secondaryBackground;
  border: 1px solid $borderColor;
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: $primaryColor;
    transform: translateY(-2px);
  }
}

.card-title {
  color: $primaryTypograhyColor;
}

.section-icon {
  color: $secondaryColor;
}

.body-text {
  color: $secondaryTypograhyColor;
  line-height: 1.6;
  font-size: 0.95rem;

  strong {
    color: $primaryTypograhyColor;
  }
}

.info-alert {
  background-color: color.scale($primaryColor, $alpha: -90%) !important;
  color: $primaryTypograhyColor !important;
  border-color: $primaryColor !important;
  font-size: 0.9rem;
  
  :deep(.v-alert__prepend) {
    color: $primaryColor;
  }
}

.page-container {
  max-width: 1920px;
  width: 100%;
  margin-left: auto;
  margin-right: auto;
}

.legal-footer {
  color: color.scale($secondaryTypograhyColor, $lightness: -20%);
  font-size: 0.8rem;
  border-top: 1px solid $borderColor;
  padding-top: 2rem;
}
</style>