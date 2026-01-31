import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import AboutView from '@/pages/AboutView.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: any) => params ? `${key} ${JSON.stringify(params)}` : key,
  }),
}))

const windowOpenSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

describe('AboutView.vue', () => {
  const mountComponent = () => {
    return mount(AboutView, {
      global: {
        stubs: {
          'v-container': { template: '<div class="v-container"><slot /></div>' },
          'v-row': { template: '<div class="v-row"><slot /></div>' },
          'v-col': { template: '<div class="v-col"><slot /></div>' },
          'v-avatar': { template: '<div class="v-avatar"><slot /></div>' },
          'v-icon': { props: ['icon'], template: '<i class="v-icon" :class="icon"></i>' },
          'v-card': { template: '<div class="v-card"><slot /></div>' },
          'v-chip': { template: '<div class="v-chip"><slot name="prepend" /><slot /></div>' },
          'v-divider': { template: '<hr class="v-divider" />' },
          'v-btn': { 
            template: '<button class="v-btn" @click="$emit(\'click\')"><slot /></button>' 
          }
        }
      }
    })
  }

  it('renders the page title and subtitle', () => {
    const wrapper = mountComponent()
    
    expect(wrapper.find('.page-title').text()).toBe('about.title')
    expect(wrapper.find('.subtitle-text').text()).toBe('about.subtitle')
  })

  it('renders the mission card', () => {
    const wrapper = mountComponent()
    const card = wrapper.find('.about-card')
    
    expect(card.exists()).toBe(true)
    expect(card.find('.card-title').text()).toBe('about.mission.title')
    expect(card.find('.body-text').text()).toBe('about.mission.text')
  })

  it('renders three feature cards correctly', () => {
    const wrapper = mountComponent()
    const featureCards = wrapper.findAll('.feature-card')
    
    expect(featureCards).toHaveLength(3)
    
    const titles = featureCards.map(c => c.find('h3').text())
    expect(titles).toEqual([
      'about.features.wrapped.title',
      'about.features.control.title',
      'about.features.opensource.title'
    ])

    const icons = featureCards.map(c => c.find('.v-icon').classes())
    expect(icons[0]).toContain('mdi-calendar-check')
    expect(icons[1]).toContain('mdi-tune-vertical')
    expect(icons[2]).toContain('mdi-github')
  })

  it('renders the tech stack chips', () => {
    const wrapper = mountComponent()
    const chips = wrapper.findAll('.v-chip')
    
    expect(chips).toHaveLength(4)
    
    const techNames = chips.map(c => c.text())
    expect(techNames).toContain('Vue.js 3')
    expect(techNames).toContain('TypeScript')
    expect(techNames).toContain('Web Workers')
    expect(techNames).toContain('Pinia')
  })

  it('renders the copyright and version section', () => {
    const wrapper = mountComponent()
    const copyrightSection = wrapper.find('.copyright-section')
    
    expect(copyrightSection.exists()).toBe(true)
    expect(copyrightSection.text()).toContain('about.footer.developed_by')
    expect(copyrightSection.text()).toContain('about.footer.copyright')
    expect(copyrightSection.text()).toContain('about.footer.version {"version":"1.0.0"}')
  })

  it('opens github repository when button is clicked', async () => {
    const wrapper = mountComponent()
    const btn = wrapper.find('.github-btn')
    
    await btn.trigger('click')
    
    expect(windowOpenSpy).toHaveBeenCalledWith('https://github.com/seu-usuario/seu-repo', '_blank')
  })

  it('renders the main logo icon', () => {
    const wrapper = mountComponent()
    const logo = wrapper.find('.logo-icon')
    
    expect(logo.exists()).toBe(true)
    expect(logo.classes()).toContain('mdi-chart-bar-stacked')
  })
})