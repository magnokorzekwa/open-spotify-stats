<script setup lang="ts">
import type SpotifyModel from '@/models/SpotifyModel';
import { processFileReading } from '@/services/FileReader';
import { sortSpotifyModelByTs } from '@/services/ListIteration';
import { useUiStore } from '@/stores/ui';
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const uiStore = useUiStore();

const emit = defineEmits<{
    (e: 'handleChange', data: SpotifyModel[]): void,
    (e: 'error', error: Error): void,
}>();

const props = defineProps<{
    width?: string
    height?: string
}>();

const sizeStyle = computed(() => ({
    width: props.width || '280px',
    height: props.height || '280px',
}));

const fileInput = ref<HTMLInputElement | null>(null);
const openFileDialog = () => fileInput.value?.click();

const onFileSelected = (event: Event) => {
    uiStore.loading = true;
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    processFileReading<SpotifyModel[]>(files)
        .then((json) => emit('handleChange', sortSpotifyModelByTs(json)))
        .catch(err => emit('error', err))
        .finally(() => uiStore.loading = false);
}
</script>

<template>
    <div class="uploadBox" :style="sizeStyle" @click="openFileDialog">
        <span class="title">{{ t('upload.title') }}</span>
        <span class="subtitle">{{ t('upload.subtitle') }}</span>
    </div>
    <input ref="fileInput" multiple type="file" accept="json,application/json" class="hiddenInput" @change="onFileSelected" />
</template>

<style lang="scss" scoped>
@use '../styles/colors' as *;

.uploadBox {
    border: 2px dashed $borderColor;
    border-radius: 12px;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;

    background-color: transparent;
    cursor: pointer;

    transition: border-color 0.2s ease, background-color 0.2s ease;
}

.uploadBox:hover {
    border-color: $primaryColor;
    background-color: rgba(37, 99, 235, 0.04);
}

.title {
    font-size: 0.95rem;
    font-weight: 500;
    color: $primaryTypograhyColor;
    text-transform: uppercase;
    letter-spacing: 0.06em;
}

.subtitle {
    font-size: 0.75rem;
    font-weight: 400;
    color: $secondaryTypograhyColor;
    text-transform: uppercase;
    letter-spacing: 0.08em;
}

.hiddenInput {
    display: none;
}
</style>