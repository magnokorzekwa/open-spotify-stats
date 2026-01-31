import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import YearMostListenedHours from '@/components/YearMostListenedHours.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('vue3-apexcharts', () => ({
  default: {
    name: 'VueApexCharts',
    props: ['type', 'height', 'width', 'options', 'series'],
    template: '<div class="apex-charts-stub" :style="{ height }"></div>'
  }
}))

describe('YearMostListenedHours.vue', () => {
  const mockHoursData = Array.from({ length: 24 }, (_, i) => i * 10)

  const mountComponent = (hoursData = mockHoursData) => {
    return mount(YearMostListenedHours, {
      props: { hoursData }
    })
  }

  it('renders the component structure correctly', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.clock-card').exists()).toBe(true)
    expect(wrapper.find('.chart-title h1').text()).toBe('biological_clock.title')
    expect(wrapper.find('.chart-wrapper').exists()).toBe(true)
  })

  it('renders the ApexCharts component', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    expect(chart.exists()).toBe(true)
    expect(chart.props('type')).toBe('radar')
  })

  it('passes correct series data to the chart', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    
    const series = chart.props('series')
    expect(series).toHaveLength(1)
    expect(series[0].name).toBe('biological_clock.streams')
    expect(series[0].data).toEqual(mockHoursData)
  })

  it('generates 24 labels for the X-axis (00h to 23h)', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    const options = chart.props('options')

    const categories = options.xaxis.categories
    expect(categories).toHaveLength(24)
    expect(categories[0]).toBe('00h')
    expect(categories[12]).toBe('12h')
    expect(categories[23]).toBe('23h')
  })

  it('formats tooltip values correctly', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    const options = chart.props('options')
    
    const formatter = options.tooltip.y.formatter
    const result = formatter(50)
    
    expect(result).toBe('50 biological_clock.plays')
  })

  it('updates chart when props change', async () => {
    const wrapper = mountComponent()
    const newHoursData = Array.from({ length: 24 }, () => 0)
    
    await wrapper.setProps({ hoursData: newHoursData })
    
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    expect(chart.props('series')[0].data).toEqual(newHoursData)
  })

  it('configures responsive options for mobile', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    const options = chart.props('options')

    expect(options.responsive).toBeDefined()
    expect(options.responsive[0].breakpoint).toBe(480)
    expect(options.responsive[0].options.plotOptions.radar.size).toBe(90)
  })

  it('has correct static chart configuration', () => {
    const wrapper = mountComponent()
    const chart = wrapper.findComponent({ name: 'VueApexCharts' })
    const options = chart.props('options')

    expect(options.chart.type).toBe('radar')
    expect(options.chart.toolbar.show).toBe(false)
    expect(options.stroke.colors).toEqual(['#1ed760'])
    expect(options.fill.opacity).toBe(0.2)
  })
})