import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import FileUpload from '@/components/FileUpload.vue'

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}))

vi.mock('@/stores/ui', () => ({
  useUiStore: () => ({
    loading: false,
  }),
}))

describe('FileUpload.vue', () => {
  it('renders correctly', () => {
    const wrapper = mount(FileUpload)
    expect(wrapper.text()).toContain('upload.title')
    expect(wrapper.text()).toContain('upload.subtitle')
  })

  it('triggers file input click when clicked', async () => {
    const wrapper = mount(FileUpload)
    const input = wrapper.find('input[type="file"]')
    const spy = vi.spyOn(input.element, 'click')
    
    await wrapper.find('.uploadBox').trigger('click')
    
    expect(spy).toHaveBeenCalled()
  })
})