<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import type { ApexOptions } from 'apexcharts'
import { useI18n } from 'vue-i18n'

defineOptions({
  name: 'YearMostListenedHours',
})

const props = defineProps<{
  hoursData: number[]
}>()

const { t } = useI18n()

const chartLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}h`)

const series = computed(() => [
  {
    name: t('biological_clock.streams'),
    data: props.hoursData,
  },
])

const chartOptions = computed<ApexOptions>(() => ({
  chart: {
    type: 'radar',
    fontFamily: 'Inter, system-ui, sans-serif',
    toolbar: { show: false },
    animations: {
      enabled: true,
      speed: 800,
    },
    dropShadow: {
      enabled: true,
      blur: 4,
      left: 1,
      top: 1,
      opacity: 0.2
    }
  },
  xaxis: {
    categories: chartLabels,
    labels: {
      show: true,
      style: {
        colors: Array(24).fill('#a1a1aa'),
        fontSize: '11px',
        fontFamily: 'inherit',
      },
    },
  },
  yaxis: {
    show: false,
    tickAmount: 4,
  },
  stroke: {
    width: 2,
    colors: ['#1ed760'],
    dashArray: 0,
  },
  fill: {
    opacity: 0.2,
    colors: ['#1ed760'],
  },
  markers: {
    size: 4,
    colors: ['#fff'],
    strokeColors: '#1ed760',
    strokeWidth: 2,
    hover: {
      size: 7,
    }
  },
  plotOptions: {
    radar: {
      size: 120,
      polygons: {
        strokeColors: 'rgba(255, 255, 255, 0.1)',
        connectorColors: 'rgba(255, 255, 255, 0.1)',
      }
    }
  },
  tooltip: {
    theme: 'dark',
    enabled: true,
    intersect: true,
    shared: false,
    followCursor: true,
    fixed: {
        enabled: false,
        position: 'topRight',
        offsetX: 0,
        offsetY: 0,
    },
    y: {
      formatter: (val: number) => `${val} ${t('biological_clock.plays')}`,
    },
    style: {
      fontSize: '12px',
    },
    marker: {
        show: false
    }
  },
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
            height: 350
        },
        plotOptions: {
          radar: {
            size: 90,
          }
        },
        xaxis: {
            labels: {
                style: {
                    fontSize: '9px'
                }
            }
        }
      }
    }
  ]
}))
</script>

<template>
  <div class="clock-card">
    <div class="chart-title">
        <h1>{{ t('biological_clock.title') }}</h1>
    </div>
    <div class="chart-wrapper">
      <VueApexCharts
        type="radar"
        height="400"
        width="100%"
        :options="chartOptions"
        :series="series"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '@/styles/colors' as *;

.clock-card {
  width: 100%;
  background-color: $secondaryBackground;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: visible;
}

.chart-title{
    text-align: center;
}

.chart-wrapper {
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;

  :deep(.apexcharts-tooltip) {
    background: #191414;
    border: 1px solid #1ed760;
    box-shadow: 0 4px 15px rgba(0,0,0,0.5);
    z-index: 9999;
    
    .apexcharts-tooltip-title {
        background: #000;
        border-bottom: 1px solid #333;
        font-family: inherit;
    }
    
    .apexcharts-tooltip-text {
        color: #fff;
        font-family: inherit;
    }
  }
}
</style>