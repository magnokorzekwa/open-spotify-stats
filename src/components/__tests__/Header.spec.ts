import { describe, it, expect, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import Header from '@/components/Header.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
  createI18n: () => ({
    global: {
      locale: { value: 'pt' },
      t: (k: string) => k
    }
  })
}))

describe('Header.vue', () => {
  const mountComponent = () => {
    return mount(Header, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          LanguageSwitch: true
        }
      }
    })
  }

  it('renders the component structure', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('.header-content').exists()).toBe(true)
  })

  it('renders the logo with correct link and translation', () => {
    const wrapper = mountComponent()
    
    const logoLink = wrapper.findAllComponents(RouterLinkStub).find(link => link.props().to === '/')
    
    expect(logoLink).toBeDefined()
    expect(logoLink?.find('.logo').text()).toBe('header.logo')
    expect(logoLink?.classes()).toContain('logo-link')
  })

  it('renders the language switcher', () => {
    const wrapper = mountComponent()
    const languageSwitch = wrapper.findComponent({ name: 'LanguageSwitch' }) 
    
    expect(languageSwitch.exists()).toBe(true)
  })

  it('renders navigation links with correct paths and text', () => {
    const wrapper = mountComponent()
    const links = wrapper.findAllComponents(RouterLinkStub)

    const privacyLink = links.find(link => link.props().to === '/privacidade')
    expect(privacyLink).toBeDefined()
    expect(privacyLink?.text()).toBe('header.privacy')

    const aboutLink = links.find(link => link.props().to === '/sobre')
    expect(aboutLink).toBeDefined()
    expect(aboutLink?.text()).toBe('header.about')
  })
})