import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useSettingsStore } from '@/stores/settings';
import LanguageSwitch from '@/components/LanguageSwitch.vue';

const VListItemStub = {
  props: ['value', 'active'],
  template: '<div class="lang-item" @click="$emit(\'click\')"><slot></slot></div>'
};

describe('LanguageSwitch.vue', () => {
  const mountComponent = (initialLang = 'pt') => {
    return mount(LanguageSwitch, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              settings: {
                language: initialLang
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

  it('renders correctly with default language PT', () => {
    const wrapper = mountComponent('pt');
    expect(wrapper.find('.lang-btn').text()).toContain('PT');
  });

  it('renders correctly with language EN', () => {
    const wrapper = mountComponent('en');
    expect(wrapper.find('.lang-btn').text()).toContain('EN');
  });

  it('renders all available languages', () => {
    const wrapper = mountComponent();
    const items = wrapper.findAll('.lang-item');
    expect(items).toHaveLength(2);
    expect(items[0].text()).toContain('Português');
    expect(items[1].text()).toContain('English');
  });

  it('changes language when an item is clicked', async () => {
    const wrapper = mountComponent('pt');
    const store = useSettingsStore();

    const enItem = wrapper.findAll('.lang-item').find(item => item.text().includes('English'));
    
    expect(enItem).toBeDefined();
    await enItem?.trigger('click');

    expect(store.setLanguage).toHaveBeenCalledWith('en');
  });

  it('passes active prop to the correct list item', () => {
    const wrapper = mountComponent('en');
    const items = wrapper.findAllComponents(VListItemStub);
    
    const ptItem = items[0];
    const enItem = items[1];

    expect(ptItem.props('active')).toBe(false);
    expect(enItem.props('active')).toBe(true);
  });
});