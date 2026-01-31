import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Footer from '@/components/Footer.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => {
      const messages: Record<string, string> = {
        'footer.brand': 'Test Brand',
        'footer.legal': 'Test Legal Text'
      }
      return messages[key] || key
    }
  })
}))

describe('Footer.vue', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the component structure correctly', () => {
    const wrapper = mount(Footer)
    
    expect(wrapper.find('.footer-outer').exists()).toBe(true)
    expect(wrapper.find('.footer-inner').exists()).toBe(true)
    expect(wrapper.find('.left').exists()).toBe(true)
    expect(wrapper.find('.right').exists()).toBe(true)
  })

  it('displays the correct current year', () => {
    const mockDate = new Date(2025, 0, 1)
    vi.setSystemTime(mockDate)

    const wrapper = mount(Footer)
    
    expect(wrapper.find('.left').text()).toContain('2025')
  })

  it('renders translated brand and legal text', () => {
    const wrapper = mount(Footer)
    
    const leftText = wrapper.find('.left').text()
    const rightText = wrapper.find('.right').text()

    expect(leftText).toContain('Test Brand')
    expect(rightText).toBe('Test Legal Text')
  })

  it('contains the copyright symbol', () => {
    const wrapper = mount(Footer)
    expect(wrapper.find('.left').text()).toContain('©')
  })
})