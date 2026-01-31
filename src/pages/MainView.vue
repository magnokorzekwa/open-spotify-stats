<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSpotifyStore } from '@/stores/spotify';
import { useUiStore } from '@/stores/ui';
import type SpotifyModel from '@/models/SpotifyModel';
import FileUpload from '../components/FileUpload.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const router = useRouter();
const spotifyStore = useSpotifyStore();
const uiStore = useUiStore();

const handleFileChange = (json: SpotifyModel[]) => {
    uiStore.loading = true;
    spotifyStore.data = json;
    router.push({ name: 'Dashboard' });
};
</script>

<template>
    <main class="page-container">
        <section class="hero-section">
            <div class="content-constraint">
                <div class="text-wrapper">
                    <h1>{{ t('home.hero.title') }}</h1>
                    <h2>{{ t('home.hero.subtitle') }}</h2>
                    <h3>{{ t('home.hero.footer') }}</h3>
                </div>
            </div>
            
            <div class="aurora-bg"></div>
        </section>

        <section class="action-section">
            <div class="content-constraint">
                <div class="upload-wrapper">
                    <FileUpload @handle-change="handleFileChange" width="100%" />
                </div>
            </div>
        </section>
    </main>
</template>

<style lang="scss" scoped>
@use '@/styles/colors' as *;

.page-container {
    width: 100%;
    display: flex;
    flex-direction: column;
}

.hero-section {
    position: relative;
    width: 100%;
    min-height: 60vh;
    padding-block: 80px;
    background-color: $secondaryBackground;
    display: flex;
    justify-content: center;
    overflow: hidden; 
}

.aurora-bg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    z-index: 1;

    &::before,
    &::after {
        content: '';
        position: absolute;
        width: 200%;
        height: 200%;
        top: -50%;
        left: -50%;
        filter: blur(80px);
        opacity: 0.4;
    }

    &::before {
        background: radial-gradient(circle at center, $primaryColor 0%, rgba(0,0,0,0) 40%);
        animation: liquidMove 18s ease-in-out infinite alternate;
    }

    &::after {
        background: radial-gradient(circle at center, $secondaryColor 0%, rgba(0,0,0,0) 40%);
        animation: liquidMove 25s ease-in-out infinite alternate-reverse;
        opacity: 0.3;
    }
}

.content-constraint {
    width: 100%;
    max-width: 1920px;
    margin-inline: auto;
    padding-inline: 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 2;
}

.text-wrapper {
    display: flex;
    flex-direction: column;
    gap: 24px;
    max-width: 800px;
    text-align: center;
    text-shadow: 0 2px 10px rgba(0,0,0,0.3);

    h1 {
        text-transform: uppercase;
        font-size: 3rem;
        line-height: 1.1;
        font-weight: 800;
        color: $primaryTypograhyColor;
        margin: 0;
        letter-spacing: -1.5px;
    }

    h2 {
        font-weight: 500;
        font-size: 1.35rem;
        color: $secondaryTypograhyColor;
        margin: 0;
        line-height: 1.5;
    }

    h3 {
        font-weight: 400;
        font-size: 1rem;
        color: $secondaryTypograhyColor;
        margin: 0;
        opacity: 0.8;
    }
}

.action-section {
    padding-block: 60px;
    width: 100%;
    display: flex;
    justify-content: center;
}

.upload-wrapper {
    width: 100%;
    max-width: 500px;
    display: flex;
    justify-content: center;
    position: relative;
    z-index: 10;
}

@keyframes liquidMove {
    0% {
        transform: translate(0, 0) scale(0.2);
    }
    33% {
        transform: translate(10%, -10%) scale(1.4);
    }
    66% {
        transform: translate(-5%, 5%) scale(0.6);
    }
    100% {
        transform: translate(5%, 10%) scale(1);
    }
}

@media (max-width: 768px) {
    .text-wrapper {
        gap: 16px;
        h1 { font-size: 2rem; }
        h2 { font-size: 1.1rem; }
    }
    .content-constraint {
        padding-inline: 16px;
    }
}
</style>