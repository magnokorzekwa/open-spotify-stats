import { setActivePinia, createPinia } from 'pinia'
import { describe, it, expect, beforeEach } from 'vitest'
import { useSettingsStore } from '@/stores/settings'

describe('Settings Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('initializes with default values', () => {
    const store = useSettingsStore()
    expect(store.minStreamDuration).toBe(30)
    expect(store.language).toBeDefined()
  })

  it('updates language correctly', () => {
    const store = useSettingsStore()
    store.setLanguage('en')
    expect(store.language).toBe('en')
  })
})
