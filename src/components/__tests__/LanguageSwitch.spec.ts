import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useSettingsStore } from '@/stores/settings';
import LanguageSwitch from '@/components/LanguageSwitch.vue';
import { ref, nextTick } from 'vue';

const locale = ref('pt');

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    locale
  }),
  createI18n: () => ({
    global: {
      locale: { value: 'pt' },
      t: (key: string) => key
    },
    install: () => {}
  })
}));

const VListItemStub = {
  props: ['value', 'active'],
  template: '<div class="lang-item" @click="$emit(\'click\')"><slot></slot></div>'
};

describe('LanguageSwitch.vue', () => {
  beforeEach(() => {
    locale.value = 'pt';
    vi.clearAllMocks();
  });

  const mountComponent = (initialStoreLang = 'pt') => {
    return mount(LanguageSwitch, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              settings: {
                language: initialStoreLang
              }
            }
          })
        ],
        stubs: {
          'v-menu': {
            template: '<div><slot name="activator" :props="{}"></slot><slot></slot></div>'
          },
          'v-btn': {
            template: '<button class="lang-btn"><slot></slot></button>'
          },
          'v-list': {
            template: '<div class="lang-list"><slot></slot></div>'
          },
          'v-list-item': VListItemStub,
          'v-list-item-title': {
            template: '<span><slot></slot></span>'
          },
          'v-icon': true
        }
      }
    });
  };

  it('renders correctly based on i18n locale', async () => {
    locale.value = 'pt';
    const wrapper = mountComponent('pt');
    expect(wrapper.find('.lang-btn').text()).toContain('PT');

    locale.value = 'en';
    await nextTick();
    expect(wrapper.find('.lang-btn').text()).toContain('EN');
  });

  it('syncs i18n locale to match store on mount if store has value', () => {
    locale.value = 'pt';
    mountComponent('en');
    
    expect(locale.value).toBe('en');
  });

  it('syncs store to match i18n locale on mount if store is empty or different', () => {
    locale.value = 'en';
    mountComponent(''); 
    
    const store = useSettingsStore();
    expect(store.setLanguage).toHaveBeenCalledWith('en');
  });

  it('updates i18n locale when store changes', async () => {
    const wrapper = mountComponent('pt');
    const store = useSettingsStore();
    
    store.language = 'en';
    await nextTick();

    expect(locale.value).toBe('en');
  });

  it('updates both store and i18n when an item is clicked', async () => {
    const wrapper = mountComponent('pt');
    const store = useSettingsStore();

    const enItem = wrapper.findAll('.lang-item').find(item => item.text().includes('English'));
    
    await enItem?.trigger('click');

    expect(store.setLanguage).toHaveBeenCalledWith('en');
    expect(locale.value).toBe('en');
  });

  it('passes active prop correctly based on current locale', () => {
    locale.value = 'en';
    const wrapper = mountComponent('en');
    const items = wrapper.findAllComponents(VListItemStub);
    
    const ptItem = items[0];
    const enItem = items[1];

    expect(ptItem.props('active')).toBe(false);
    expect(enItem.props('active')).toBe(true);
  });
});