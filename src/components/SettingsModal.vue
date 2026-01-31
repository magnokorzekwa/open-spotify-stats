<script setup lang="ts">
import { ref, watch } from 'vue';
import { useSettingsStore } from '@/stores/settings';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const dialog = ref(false);
const settingsStore = useSettingsStore();

const localMinStreamDuration = ref(settingsStore.minStreamDuration);
const localTimezone = ref(settingsStore.timezone);

const availableTimezones = Intl.supportedValuesOf('timeZone');

const filterTimezones = (itemTitle: string, queryText: string, item: any) => {
  const normalize = (text: string) => text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/_/g, " ");

  return normalize(itemTitle).indexOf(normalize(queryText)) > -1;
};

watch(dialog, (isOpen) => {
  if (isOpen) {
    localMinStreamDuration.value = settingsStore.minStreamDuration;
    localTimezone.value = settingsStore.timezone;
  }
});

const saveSettings = () => {
  settingsStore.minStreamDuration = localMinStreamDuration.value;
  settingsStore.timezone = localTimezone.value;
  dialog.value = false;
};
</script>

<template>
  <v-dialog v-model="dialog" max-width="500">
    <template #activator="{ props }">
      <v-btn
        v-bind="props"
        variant="flat"
        prepend-icon="mdi-cog"
        class="text-none trigger-btn"
      >
        {{ t('settings.title') }}
      </v-btn>
    </template>

    <v-card class="settings-card elevation-0">
      <v-card-title class="d-flex justify-space-between align-center header-title">
        <span>{{ t('settings.title') }}</span>
        <v-btn 
          icon="mdi-close" 
          variant="text" 
          size="small" 
          class="close-btn"
          @click="dialog = false"
        ></v-btn>
      </v-card-title>

      <v-card-text class="pt-4">
        
        <div class="mb-6">
          <p class="description-text font-weight-bold mb-2">{{ t('settings.stream_criteria') }}</p>
          <p class="description-text mb-4">
            {{ t('settings.stream_desc') }}
          </p>

          <v-row align="center" no-gutters>
            <v-col cols="12" sm="8" class="pr-sm-4">
              <v-slider
                v-model="localMinStreamDuration"
                min="0"
                max="120"
                step="1"
                show-ticks="always"
                thumb-label="always"
                hide-details
                class="custom-slider align-center"
              >
                <template #thumb-label="{ modelValue }">
                  {{ modelValue }}s
                </template>
              </v-slider>
            </v-col>

            <v-col cols="12" sm="4" class="mt-4 mt-sm-0">
              <v-text-field
                v-model.number="localMinStreamDuration"
                :label="t('settings.seconds')"
                type="number"
                variant="outlined"
                density="compact"
                hide-details
                min="0"
                suffix="s"
                class="custom-input"
              ></v-text-field>
            </v-col>
          </v-row>
        </div>

        <v-divider class="mb-6 border-opacity-25"></v-divider>

        <div>
          <p class="description-text font-weight-bold mb-2">{{ t('settings.timezone_title') }}</p>
          <p class="description-text mb-4">
            {{ t('settings.timezone_desc') }}
          </p>
          
          <v-autocomplete
            v-model="localTimezone"
            :items="availableTimezones"
            :custom-filter="filterTimezones"
            :label="t('settings.timezone_title')"
            variant="outlined"
            density="compact"
            hide-details
            class="custom-input"
            menu-icon="mdi-chevron-down"
          ></v-autocomplete>
        </div>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
          variant="text"
          class="action-btn"
          @click="saveSettings"
        >
          {{ t('settings.save') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/styles/colors' as *;

.trigger-btn {
  background-color: $primaryColor !important;
  color: #fff !important;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: $primaryColorHover !important;
  }
}

.settings-card {
  background-color: $secondaryBackground;
  border: 1px solid $borderColor;
  color: $primaryTypograhyColor;
}

.header-title {
  color: $primaryTypograhyColor;
  font-weight: 600;
}

.description-text {
  color: $secondaryTypograhyColor;
  font-size: 0.875rem;
}

.close-btn {
  color: $secondaryTypograhyColor;
  &:hover {
    color: $primaryTypograhyColor;
  }
}

.custom-slider {
  :deep(.v-slider-thumb__surface) {
    color: $primaryColor;
  }
  
  :deep(.v-slider-thumb__label) {
    background-color: $secondaryColor !important;
    color: #fff;
  }

  :deep(.v-slider-track__fill) {
    background-color: $primaryColor;
  }

  :deep(.v-slider-track__background) {
    background-color: $borderColor;
    opacity: 0.5;
  }
}

.custom-input {
  :deep(.v-field__outline) {
    color: $borderColor !important;
  }
  
  :deep(.v-field--focused .v-field__outline) {
    color: $primaryColor !important;
  }

  :deep(input) {
    color: $primaryTypograhyColor !important;
  }

  :deep(.v-label) {
    color: $secondaryTypograhyColor !important;
  }
  
  :deep(.v-icon) {
    color: $secondaryTypograhyColor !important;
  }
}

.action-btn {
  color: $contrastColor !important;
  font-weight: 600;
  transition: color 0.2s ease, background-color 0.2s ease;
  
  &:hover {
    color: $contrastColorHover !important;
    background-color: color.scale($contrastColor, $alpha: -90%) !important;
  }
}
</style>