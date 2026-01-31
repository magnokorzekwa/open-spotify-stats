import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import YearMostPlayedArtist from '@/components/YearMostPlayedArtists.vue'
import type { TopArtist } from '@/types/DataManipulation'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: any) => params ? `${key} ${JSON.stringify(params)}` : key,
  }),
}))

const generateArtists = (count: number): TopArtist[] => {
  return Array.from({ length: count }, (_, i) => ({
    artist: `Artist ${i + 1}`,
    timesPlayed: 1000 - (i * 100),
    uri: `spotify:artist:${i}`,
    image: `image-${i}.jpg`
  }))
}

const VTooltipStub = {
  props: ['location', 'text'],
  template: `
    <div class="v-tooltip-stub">
      <slot name="activator" :props="{}" />
      <div class="tooltip-content">
        <slot />
      </div>
    </div>
  `
}

describe('YearMostPlayedArtist.vue', () => {
  const mountComponent = (dados: TopArtist[]) => {
    return mount(YearMostPlayedArtist, {
      props: { dados },
      global: {
        stubs: {
          'v-tooltip': VTooltipStub
        }
      }
    })
  }

  it('renders title correctly', () => {
    const wrapper = mountComponent([])
    expect(wrapper.find('.titleDiv h1').text()).toBe('top_artists.title')
  })

  it('renders empty state when data is empty', () => {
    const wrapper = mountComponent([])
    
    expect(wrapper.find('.mainDiv .singleData').exists()).toBe(true)
    expect(wrapper.find('.singleData h1').text()).toBe('top_artists.empty')
    expect(wrapper.find('.topOne').exists()).toBe(false)
  })

  it('renders single artist layout when only one artist exists', () => {
    const artists = generateArtists(1)
    const wrapper = mountComponent(artists)

    expect(wrapper.find('.mainDiv > .singleData').exists()).toBe(true)
    expect(wrapper.find('.others').exists()).toBe(false)
    
    const card = wrapper.find('.card')
    expect(card.text()).toContain('top_artists.rank_one')
    expect(card.text()).toContain('Artist 1')

    const tooltipContent = wrapper.find('.tooltip-content')
    expect(tooltipContent.text()).toBe('top_artists.streams_count {"count":1000}')
  })

  it('renders multiple artists layout correctly', () => {
    const artists = generateArtists(5)
    const wrapper = mountComponent(artists)

    expect(wrapper.find('.topOne').exists()).toBe(true)
    expect(wrapper.find('.others').exists()).toBe(true)
    expect(wrapper.find('.mainDiv > .singleData').exists()).toBe(false)
  })

  it('displays the top one artist correctly in multiple layout', () => {
    const artists = generateArtists(5)
    const wrapper = mountComponent(artists)

    const topOneSection = wrapper.find('.topOne')
    expect(topOneSection.text()).toContain('top_artists.rank_one')
    expect(topOneSection.text()).toContain('Artist 1')
    
    const tooltip = topOneSection.find('.tooltip-content')
    expect(tooltip.text()).toBe('top_artists.streams_count {"count":1000}')
  })

  it('displays the list of other artists correctly', () => {
    const artists = generateArtists(5)
    const wrapper = mountComponent(artists)

    const othersSection = wrapper.find('.others')
    const cards = othersSection.findAll('.card')

    expect(cards).toHaveLength(4)

    expect(cards[0].text()).toBe('2. Artist 2')
    expect(cards[1].text()).toBe('3. Artist 3')
    expect(cards[3].text()).toBe('5. Artist 5')

    const tooltips = othersSection.findAll('.tooltip-content')
    expect(tooltips[0].text()).toBe('top_artists.streams_count {"count":900}')
  })

  it('limits the others list to 4 items (slice 1 to 5)', () => {
    const artists = generateArtists(10)
    const wrapper = mountComponent(artists)

    const othersSection = wrapper.find('.others')
    const cards = othersSection.findAll('.card')

    expect(cards).toHaveLength(4)
    expect(wrapper.text()).not.toContain('Artist 6')
  })
})