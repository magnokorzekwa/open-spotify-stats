<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import type { ApexOptions } from 'apexcharts';
import ApexChart from 'vue3-apexcharts';
import { useUiStore } from '@/stores/ui';
import { processCalendarData } from '@/services/HeatmapHandler';
import type SpotifyModel from '@/models/SpotifyModel';
import type { HeatmapSeries } from '@/types/DataManipulation';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
  year: number,
  streams: SpotifyModel[]
}>();

const uiStore = useUiStore();
const series = ref<HeatmapSeries[]>([]);
const windowWidth = ref(window.innerWidth);

const updateWidth = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => window.addEventListener('resize', updateWidth));
onUnmounted(() => window.removeEventListener('resize', updateWidth));

const isMobile = computed(() => windowWidth.value < 768);

const chartWidth = computed(() => {
  return isMobile.value ? '1000' : '100%';
});

const chartOptions = computed<ApexOptions>(() => ({
  title: {
    text: t('heatmap.title').toUpperCase(),
    align: 'left',
    style: {
      fontSize: isMobile.value ? '20px' : '28px',
      fontFamily: 'inherit',
      fontWeight: 'bold',
      color: '#e5e7eb'
    },
  },
  chart: {
    type: 'heatmap',
    background: 'transparent',
    toolbar: { show: false },
    animations: { enabled: true }
  },
  legend: { show: false },
  plotOptions: {
    heatmap: {
      enableShades: false,
      radius: 3,
      useFillColorAsStroke: false,
      colorScale: {
        ranges: [
          { from: 0, to: 0, color: '#0F172A' },
          { from: 1, to: 15, color: '#311a57' },
          { from: 16, to: 30, color: '#422472' },
          { from: 31, to: 60, color: '#532d91' },
          { from: 61, to: 10000, color: '#7C3AED' }
        ]
      }
    }
  },
  stroke: {
    width: 4,
    colors: ['#020617']
  },
  dataLabels: { enabled: false },
  xaxis: {
    type: 'category',
    labels: { show: false },
    axisBorder: { show: false },
    axisTicks: { show: false },
    tooltip: { enabled: false }
  },
  yaxis: {
    labels: {
      style: {
        fontSize: '10px',
        colors: '#E5E7EB',
        fontFamily: 'inherit'
      }
    }
  },
  grid: {
    show: false,
    padding: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 10
    }
  },
  tooltip: {
    theme: 'dark',
    x: { show: true }, 
    fillSeriesColor: false,
    marker: { show: false }
  }
}));

watch(
  () => [props.year, props.streams],
  async () => {
    try {
      uiStore.loading = true;
      const { weekSeries } = await processCalendarData(props.year, props.streams);
      series.value = weekSeries;
    } catch (error) {
      console.error(error);
    } finally {
      uiStore.loading = false;
    }
  },
  { immediate: true }
);
</script>

<template>
  <div class="heatmap-wrapper">
    <div class="scroll-container">
      <ApexChart 
        type="heatmap" 
        height="280" 
        :width="chartWidth" 
        :options="chartOptions" 
        :series="series" 
      />
    </div>
    <div v-if="isMobile" class="scroll-hint">
      {{ t('heatmap.scroll_hint') }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.heatmap-wrapper {
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.scroll-container {
  width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  -webkit-overflow-scrolling: touch;
  
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #0F172A;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #422472;
    border-radius: 4px;
  }
}

.scroll-hint {
  text-align: center;
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 4px;
  opacity: 0.7;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
</style>