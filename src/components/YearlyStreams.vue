<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import type { YearData } from '@/types/DataManipulation'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'YearStatsChart',
})

const props = defineProps<{
  data: YearData[]
}>()

const { t } = useI18n()
const numberFormatter = new Intl.NumberFormat('pt-BR')

const chartHeight = computed(() => {
  const minHeight = 350
  const heightPerBar = 60
  const calculated = props.data.length * heightPerBar
  return Math.max(minHeight, calculated)
})

const series = computed(() => [
  {
    name: t('year_stats.total_streams'),
    data: props.data.map((d) => d.total),
  },
])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'bar',
    fontFamily: 'Inter, system-ui, sans-serif',
    toolbar: { show: false },
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
    },
    parentHeightOffset: 0,
  },
  title: {
    text: t('year_stats.title'),
    style: {
      fontSize: '20px',
      fontWeight: 700,
      color: '#ffffff',
    },
    margin: 20,
  },
  plotOptions: {
    bar: {
      horizontal: true,
      barHeight: '50%',
      borderRadius: 6,
      borderRadiusApplication: 'end',
    },
  },
  dataLabels: {
    enabled: true,
    textAnchor: 'start',
    style: {
      colors: ['#fff'],
      fontSize: '12px',
      fontWeight: 600,
    },
    formatter: (val: number) => numberFormatter.format(val),
    offsetX: 0,
    dropShadow: { enabled: false },
  },
  stroke: {
    show: true,
    width: 0,
    colors: ['transparent'],
  },
  xaxis: {
    categories: props.data.map((d) => d.year),
    labels: {
      style: {
        colors: '#a1a1aa',
        fontSize: '12px',
      },
      formatter: (val: string) => numberFormatter.format(Number(val)),
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: {
        colors: '#ffffff',
        fontSize: '14px',
        fontWeight: 600,
      },
    },
  },
  grid: {
    borderColor: '#3f3f46',
    strokeDashArray: 4,
    xaxis: {
      lines: { show: true },
    },
    yaxis: {
      lines: { show: false },
    },
    padding: {
      top: 0,
      right: 20,
      bottom: 0,
      left: 10,
    },
  },
  fill: {
    opacity: 1,
    type: 'gradient',
    gradient: {
      shade: 'dark',
      type: 'horizontal',
      shadeIntensity: 0.5,
      gradientToColors: ['#1DB954'],
      inverseColors: true,
      opacityFrom: 1,
      opacityTo: 1,
      stops: [0, 100],
    },
  },
  colors: ['#1ed760'],
  tooltip: {
    theme: 'dark',
    y: {
      formatter: (val: number) => `${numberFormatter.format(val)} ${t('year_stats.tooltip_suffix')}`,
    },
    marker: { show: false },
    style: {
      fontSize: '12px',
    },
    fixed: {
      enabled: false,
    },
  },
}))
</script>

<template>
  <div class="chart-card">
    <div v-if="data.length > 0" class="chart-wrapper">
      <VueApexCharts
        type="bar"
        width="100%"
        :height="chartHeight"
        :options="chartOptions"
        :series="series"
      />
    </div>
    <div v-else class="empty-state">
      <span>{{ t('year_stats.empty') }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/colors' as *;

.chart-card {
  width: 100%;
  background-color: $secondaryBackground;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.chart-wrapper {
  width: 100%;
  overflow: visible;

  :deep(.apexcharts-tooltip) {
    z-index: 9999;
    overflow: visible;
  }
}

.empty-state {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $secondaryTypograhyColor;
  font-size: 0.9rem;
  font-style: italic;
}
</style>