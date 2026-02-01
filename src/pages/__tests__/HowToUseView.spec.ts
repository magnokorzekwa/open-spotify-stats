import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { shallowMount } from '@vue/test-utils'
import HowToUseView from '@/pages/HowToUseView.vue'

const useHeadSpy = vi.fn()

vi.mock('@unhead/vue', () => ({
  useHead: (obj: any) => useHeadSpy(obj)
}))

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

const SlotStub = {
  template: '<div class="stub-content"><slot /></div>'
}

const BtnStub = {
  template: `
    <button
      type="button"
      class="spotify-btn"
      @click="$emit('click')"
    >
      <slot />
    </button>
  `
}

describe('HowToUseView.vue', () => {
  let wrapper: any
  const expectedUrl = 'https://www.spotify.com/account/privacy/'

  beforeEach(() => {
    useHeadSpy.mockClear()

    wrapper = shallowMount(HowToUseView, {
      global: {
        stubs: {
          'v-container': SlotStub,
          'v-row': SlotStub,
          'v-col': SlotStub,
          'v-avatar': true,
          'v-icon': true,
          'v-alert': SlotStub,
          'v-card': SlotStub,
          'v-btn': BtnStub,
          'v-divider': true,
        }
      }
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sets the page head metadata correctly', () => {
    expect(useHeadSpy).toHaveBeenCalled()

    const lastCall =
      useHeadSpy.mock.calls[useHeadSpy.mock.calls.length - 1][0]

    expect(lastCall.title.value).toBe('header.how_to_use - header.logo')

    expect(lastCall.meta).toHaveLength(1)
    expect(lastCall.meta[0].name).toBe('description')
    expect(lastCall.meta[0].content.value).toBe('tutorial.subtitle')
  })

  it('renders the component successfully', () => {
    expect(wrapper.exists()).toBe(true)
  })

  it('displays title and subtitle using correct translation keys', () => {
    expect(wrapper.text()).toContain('tutorial.title')
    expect(wrapper.text()).toContain('tutorial.subtitle')
  })

  it('computes the steps list correctly with 5 items', () => {
    const steps = wrapper.vm.steps

    expect(steps).toHaveLength(5)

    expect(steps[0]).toEqual({
      title: 'tutorial.steps.step1.title',
      text: 'tutorial.steps.step1.text',
      icon: 'mdi-web',
    })

    expect(steps[4].icon).toBe('mdi-timer-sand')
  })

  it('highlights strictly the third step', () => {
    const steps = wrapper.vm.steps

    expect(steps[2].highlight).toBe(true)
    expect(steps[0].highlight).toBeFalsy()
    expect(steps[1].highlight).toBeFalsy()
  })

  it('opens the correct Spotify privacy URL when button is clicked', async () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    const button = wrapper.find('.spotify-btn')
    await button.trigger('click')

    expect(openSpy).toHaveBeenCalledWith(expectedUrl, '_blank')
  })

  it('renders the alert with the correct title translation key', () => {
    expect(wrapper.text()).toContain('tutorial.important_note.title')
  })
})
