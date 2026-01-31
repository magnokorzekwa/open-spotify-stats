import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import YearlyStreams from '@/components/YearlyStreams.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('vue3-apexcharts', () => ({
  default: {
    name: 'VueApexCharts',
    props: ['height', 'width', 'options', 'series'],
    template: '<div class="apex-charts-stub" :style="{ height }"></div>'
  }
}))

describe('YearlyStreams.vue', () => {
  const mockData = [
    { year: '2023', total: 1500 },
    { year: '2022', total: 1200 },
    { year: '2021', total: 900 }
  ]

  const mountComponent = (data = mockData) => {
    return mount(YearlyStreams, {
      props: { data }
    })
  }

  it('renders the chart wrapper when data is provided', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.chart-wrapper').exists()).toBe(true)
    expect(wrapper.find('.empty-state').exists()).toBe(false)
  })

  it('renders the empty state when data is empty', () => {
    const wrapper = mountComponent([])
    expect(wrapper.find('.chart-wrapper').exists()).toBe(false)
    expect(wrapper.find('.empty-state').exists()).toBe(true)
    expect(wrapper.find('.empty-state').text()).toBe('year_stats.empty')
  })

  it('calculates minimum chart height correctly', () => {
    const singleYearData = [{ year: '2023', total: 100 }]
    const wrapper = mountComponent(singleYearData)
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    
    expect(chart.props('height')).toBe(350)
  })

  it('calculates dynamic chart height for large datasets', () => {
    const largeData = Array.from({ length: 10 }, (_, i) => ({
      year: `${2020 + i}`,
      total: 1000
    }))
    
    const wrapper = mountComponent(largeData)
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    
    expect(chart.props('height')).toBe(600)
  })

  it('passes correct series data to the chart', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    
    const series = chart.props('series')
    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('year_stats.total_streams')
    expect(series[0].data).toEqual([1500, 1200, 900])
  })

  it('configures chart options correctly', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    const options = chart.props('options')

    expect(options.chart.type).toBe('bar')
    expect(options.title.text).toBe('year_stats.title')
    expect(options.xaxis.categories).toEqual(['2023', '2022', '2021'])
    expect(options.plotOptions.bar.horizontal).toBe(true)
  })

  it('formats tooltips correctly', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    const options = chart.props('options')
    
    const formatter = options.tooltip.y.formatter
    const result = formatter(1500)
    
    expect(result).toContain('1.500')
    expect(result).toContain('year_stats.tooltip_suffix')
  })

  it('formats data labels correctly', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    const options = chart.props('options')
    
    const formatter = options.dataLabels.formatter
    expect(formatter(1234)).toBe('1.234')
  })
})