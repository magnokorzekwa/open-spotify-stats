import { describe, it, expect, vi } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import Header from '@/components/Header.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
    locale: { value: 'pt' }
  }),
  createI18n: () => ({
    global: {
      locale: { value: 'pt' },
      t: (key: string) => key
    },
    install: () => {}
  })
}))

describe('Header.vue', () => {
  const mountComponent = () => {
    return mount(Header, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
          LanguageSwitch: true,
          'v-btn': {
            name: 'VBtn',
            template: '<button class="v-btn-stub" @click="$emit(\'click\')"><slot /></button>',
            props: ['icon', 'density', 'variant']
          },
          'v-navigation-drawer': {
            name: 'VNavigationDrawer',
            template: '<div class="v-navigation-drawer-stub"><slot /></div>',
            props: ['modelValue', 'location', 'temporary']
          },
          'v-list': { 
            name: 'VList',
            template: '<div class="v-list-stub"><slot /></div>' 
          },
          'v-list-item': {
            name: 'VListItem',
            template: '<div class="v-list-item-stub" @click="$emit(\'click\')"></div>',
            props: ['to', 'title', 'prependIcon']
          },
          'v-divider': true,
          'v-icon': true
        }
      }
    })
  }

  it('renders the component structure', () => {
    const wrapper = mountComponent()
    expect(wrapper.find('.header').exists()).toBe(true)
    expect(wrapper.find('.header-content').exists()).toBe(true)
  })

  it('renders the logo with correct link', () => {
    const wrapper = mountComponent()
    const logoLink = wrapper.findAllComponents(RouterLinkStub).find(link => link.props().to === '/')
    
    expect(logoLink).toBeDefined()
    expect(logoLink?.find('.logo').text()).toBe('header.logo')
  })

  it('renders desktop navigation links correctly', () => {
    const wrapper = mountComponent()
    const desktopNav = wrapper.find('.desktop-nav')
    
    expect(desktopNav.exists()).toBe(true)
    
    const links = desktopNav.findAllComponents(RouterLinkStub)
    const paths = links.map(link => link.props().to)
    
    expect(paths).toContain('/privacy')
    expect(paths).toContain('/about')
    expect(paths).toContain('/how-to-use')
  })

  it('renders mobile menu button', () => {
    const wrapper = mountComponent()
    const mobileControls = wrapper.find('.mobile-controls')
    const menuBtn = mobileControls.findComponent({ name: 'VBtn' })
    
    expect(mobileControls.exists()).toBe(true)
    expect(menuBtn.exists()).toBe(true)
    expect(menuBtn.props('icon')).toBe('mdi-menu')
  })

  it('toggles navigation drawer when menu button is clicked', async () => {
    const wrapper = mountComponent()
    const drawer = wrapper.findComponent({ name: 'VNavigationDrawer' })
    const menuBtn = wrapper.find('.mobile-controls').findComponent({ name: 'VBtn' })

    expect(drawer.props('modelValue')).toBe(false)

    await menuBtn.trigger('click')

    expect(drawer.props('modelValue')).toBe(true)
  })

  it('renders correct items inside the navigation drawer', () => {
    const wrapper = mountComponent()
    const listItems = wrapper.findAllComponents({ name: 'VListItem' })

    expect(listItems).toHaveLength(3)
    
    const titles = listItems.map(item => item.props('title'))
    expect(titles).toEqual(['header.privacy', 'header.about', 'header.how_to_use'])
  })

  it('closes the drawer when an item is clicked', async () => {
    const wrapper = mountComponent()
    const menuBtn = wrapper.find('.mobile-controls').findComponent({ name: 'VBtn' })
    
    await menuBtn.trigger('click')
    const drawer = wrapper.findComponent({ name: 'VNavigationDrawer' })
    expect(drawer.props('modelValue')).toBe(true)

    const firstItem = wrapper.findComponent({ name: 'VListItem' })
    await firstItem.trigger('click')

    expect(drawer.props('modelValue')).toBe(false)
  })

  it('renders language switcher in both desktop and mobile views', () => {
    const wrapper = mountComponent()
    const switches = wrapper.findAllComponents({ name: 'LanguageSwitch' })
    
    expect(switches.length).toBeGreaterThanOrEqual(1)
  })
})