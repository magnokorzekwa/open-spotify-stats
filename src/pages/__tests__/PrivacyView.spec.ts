import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PrivacyView from '@/pages/PrivacyView.vue'

const useHeadSpy = vi.fn()

vi.mock('@unhead/vue', () => ({
  useHead: (obj: any) => useHeadSpy(obj)
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const VIconStub = {
  name: 'VIcon',
  props: ['icon'],
  template: '<i class="v-icon" :class="icon"></i>'
}

describe('PrivacyView.vue', () => {

  beforeEach(() => {
    useHeadSpy.mockClear()
  })

  const mountComponent = () => {
    return mount(PrivacyView, {
      global: {
        stubs: {
          'v-container': { template: '<div class="v-container"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-icon': VIconStub,
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-alert': { template: '<div class="v-alert"><slot /></div>' }
        }
      }
    })
  }

  it('sets the page head metadata correctly', () => {
    mountComponent()

    expect(useHeadSpy).toHaveBeenCalled()

    const lastCall =
      useHeadSpy.mock.calls[useHeadSpy.mock.calls.length - 1][0]

    expect(lastCall.title.value).toBe('header.privacy - header.logo')

    expect(lastCall.meta).toHaveLength(1)
    expect(lastCall.meta[0].name).toBe('description')
    expect(lastCall.meta[0].content.value).toBe('privacy.subtitle')
  })

  it('renders the page header correctly', () => {
    const wrapper = mountComponent()

    expect(wrapper.find('.page-title').text()).toBe('privacy.title')
    expect(wrapper.find('.subtitle-text').text()).toBe('privacy.subtitle')

    const headerIcon = wrapper.findComponent(VIconStub)
    expect(headerIcon.props('icon')).toBe('mdi-shield-lock-outline')
  })

  it('renders the zero upload section with alert', () => {
    const wrapper = mountComponent()
    const section = wrapper.find('.privacy-card')

    expect(section.find('h2').text()).toBe('privacy.zero_upload.title')
    expect(section.find('.body-text').text()).toBe('privacy.zero_upload.text')

    const alert = wrapper.find('.v-alert')
    expect(alert.exists()).toBe(true)
    expect(alert.text()).toContain('privacy.zero_upload.guarantee_title')
    expect(alert.text()).toContain('privacy.zero_upload.guarantee_text')
  })

  it('renders secondary privacy cards', () => {
    const wrapper = mountComponent()
    const cards = wrapper.findAll('.privacy-card')

    expect(cards).toHaveLength(3)

    expect(cards[1].find('h3').text()).toBe('privacy.volatile_storage.title')
    expect(cards[1].find('.body-text').text()).toBe('privacy.volatile_storage.text')

    expect(cards[2].find('h3').text()).toBe('privacy.auditability.title')
    expect(cards[2].find('.body-text').text()).toBe('privacy.auditability.text')
  })

  it('renders legal footer with affiliation notes', () => {
    const wrapper = mountComponent()
    const footer = wrapper.find('.legal-footer')

    expect(footer.exists()).toBe(true)
    expect(footer.text()).toContain('privacy.footer.no_affiliation')
    expect(footer.text()).toContain('privacy.footer.data_usage')
  })

  it('applies correct icons for each section', () => {
    const wrapper = mountComponent()
    const icons = wrapper.findAllComponents(VIconStub)

    const iconNames = icons.map(i => i.props('icon'))

    expect(iconNames).toContain('mdi-server-off')
    expect(iconNames).toContain('mdi-database-remove')
    expect(iconNames).toContain('mdi-scale-balance')
  })
})
