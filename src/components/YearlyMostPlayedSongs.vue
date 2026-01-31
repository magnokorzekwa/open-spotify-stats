<script setup lang="ts">
import { computed } from 'vue';
import type { TopSongs } from '@/types/DataManipulation';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
    dados: TopSongs[]
}>();

const hasData = computed(() => props.dados.length > 0);
const hasOthers = computed(() => props.dados.length > 1);

const topOne = computed(() => props.dados[0]);
const menu = computed(() => props.dados.slice(1, 10));
</script>

<template>
    <div class="titleDiv">
        <h1>{{ t('top_songs.title') }}</h1>
    </div>

    <div class="mainDiv" v-if="hasData">
        <v-tooltip location="top" :text="t('top_songs.streams')">
            <template #activator="{ props: activatorProps }">
                <div class="topOne">
                    <div class="card" v-bind="activatorProps">
                        <div class="visualizer">
                            <span v-for="i in 64" :key="i"></span>
                        </div>
                        <div class="info-container">
                            <h1 class="title">1. {{ topOne?.title }}</h1>
                            <h2 class="subtitle">{{ topOne?.artist }}</h2>
                        </div>
                    </div>
                </div>
            </template>
            <span>{{ t('top_songs.count', { count: topOne?.timesPlayed }) }}</span>
        </v-tooltip>

        <div class="others" v-if="hasOthers">
            <v-tooltip 
                v-for="(song, idx) in menu" 
                :key="song.title" 
                location="start"
                :text="t('top_songs.streams')"
            >
                <template #activator="{ props: itemProps }">
                    <div class="card list-item" v-bind="itemProps">
                        <span class="rank">{{ idx + 2 }}.</span>
                        <span class="text">{{ song.title }} - {{ song.artist }}</span>
                    </div>
                </template>
                <span>{{ t('top_songs.count', { count: song.timesPlayed }) }}</span>
            </v-tooltip>
        </div>
    </div>

    <div class="mainDiv empty" v-else>
        <h1>{{ t('top_songs.empty') }}</h1>
    </div>
</template>

<style scoped lang="scss">
@use "sass:math";
@use "sass:color";
@use '../styles/colors' as *;

.titleDiv {
    display: flex;
    margin-top: 65px;
    justify-content: start;
    user-select: none;
    padding: 0 4px;

    @media (max-width: 768px) {
        margin-top: 30px;
        justify-content: center;
        
        h1 {
            font-size: 1.5rem;
            text-align: center;
        }
    }
}

.mainDiv {
    user-select: none;
    display: grid;
    grid-template-columns: 1fr 1fr; 
    gap: 20px;
    margin-top: 25px;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
        gap: 16px;
    }

    &.empty {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 200px;
    }
}

.card {
    border-radius: 12px;
    border: 2px solid $borderColor;
    background-color: $primaryBackground;
    overflow: hidden;
}

.topOne {
    height: 100%;
    min-height: 300px;
    width: 100%;

    @media (max-width: 768px) {
        min-height: 250px;
        order: -1; 
    }

    .card {
        position: relative;
        height: 100%;
        width: 100%;
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        transition: transform 0.3s ease, border-color 0.3s ease;
        cursor: default;

        &:hover {
            border-color: color.adjust($borderColor, $lightness: 10%);
            transform: scale(1.02);
        }
    }

    .info-container {
        z-index: 2;
        text-align: center;
        color: #fff;
        text-shadow: 0 4px 12px rgba(0, 0, 0, 0.9);
        width: 100%;
    }

    .title {
        margin: 0;
        font-size: 2rem;
        line-height: 1.2;
        word-break: break-word;
        
        @media (max-width: 768px) {
            font-size: 1.5rem;
        }
    }

    .subtitle {
        margin: 8px 0 0;
        font-size: 1.2rem;
        font-weight: 400;
        opacity: 0.9;
        word-break: break-word;
        
        @media (max-width: 768px) {
            font-size: 1rem;
        }
    }
}

.others {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
    min-width: 0; 

    .list-item {
        padding: 16px;
        display: flex;
        align-items: center;
        gap: 12px;
        transition: transform 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
        cursor: pointer;
        width: 100%;

        &:hover {
            border-color: color.adjust($borderColor, $lightness: 10%);
            transform: translateX(5px);
            background-color: color.adjust($primaryBackground, $lightness: 5%);
        }

        .rank {
            font-weight: bold;
            font-size: 1.1rem;
            color: color.adjust($borderColor, $lightness: 20%);
            flex-shrink: 0;
        }

        .text {
            flex: 1; 
            min-width: 0; 
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: block; 
        }
    }
}

.visualizer {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: flex-end;
    gap: 2px;
    padding: 0 10px;
    opacity: 0.4;
    pointer-events: none;
    z-index: 1;

    span {
        flex: 1;
        height: 50%;
        transform-origin: bottom;
        border-radius: 4px 4px 0 0;
        background: linear-gradient(to top, #22c55e, #3b82f6, #a855f7);
        will-change: transform;
        animation: spectrogram 1.2s ease-in-out infinite alternate;

        @for $i from 1 through 64 {
            &:nth-child(#{$i}) {
                animation-duration: #{0.5 + math.div(math.random(15), 10)}s;
                animation-delay: -#{math.div(math.random(20), 10)}s;
                opacity: #{0.2 + math.div(math.random(6), 10)};
                height: (20 + math.random(60)) * 1%;
            }
        }
    }
}

@keyframes spectrogram {
    0%   { transform: scaleY(0.1); }
    50%  { transform: scaleY(0.6); }
    100% { transform: scaleY(1); }
}
</style>