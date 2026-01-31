import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoaderOverlay from '@/components/LoaderOverlay.vue'

describe('LoaderOverlay.vue', () => {
  const mountComponent = (open: boolean) => {
    return mount(LoaderOverlay, {
      props: { open },
      global: {
        stubs: {
          'v-overlay': {
            props: ['modelValue', 'persistent'],
            template: `
              <div 
                class="v-overlay-stub" 
                :data-open="modelValue"
                :data-persistent="persistent !== undefined && persistent !== false"
              >
                <slot />
              </div>
            `
          },
          'v-progress-circular': {
            template: '<div class="v-progress-circular-stub" />'
          }
        }
      }
    })
  }

  it('renders the overlay with correct model value when open is true', () => {
    const wrapper = mountComponent(true)
    const overlay = wrapper.find('.v-overlay-stub')

    expect(overlay.exists()).toBe(true)
    expect(overlay.attributes('data-open')).toBe('true')
  })

  it('renders the overlay with correct model value when open is false', () => {
    const wrapper = mountComponent(false)
    const overlay = wrapper.find('.v-overlay-stub')

    expect(overlay.attributes('data-open')).toBe('false')
  })

  it('renders the content wrapper and progress circular', () => {
    const wrapper = mountComponent(true)
    
    expect(wrapper.find('.loader-content').exists()).toBe(true)
    expect(wrapper.find('.v-progress-circular-stub').exists()).toBe(true)
  })

  it('has persistent attribute enabled', () => {
    const wrapper = mountComponent(true)
    const overlay = wrapper.find('.v-overlay-stub')
    
    expect(overlay.attributes('data-persistent')).toBe('true')
  })
})