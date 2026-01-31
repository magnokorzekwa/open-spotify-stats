import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useSettingsStore } from '@/stores/settings';
import SettingsModal from '@/components/SettingsModal.vue';

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
}));

Object.defineProperty(Intl, 'supportedValuesOf', {
  value: () => ['America/Sao_Paulo', 'UTC', 'Europe/London'],
  writable: true
});

const VAutocompleteStub = {
  name: 'VAutocomplete',
  props: ['modelValue', 'items', 'customFilter'],
  template: '<select :value="modelValue" @change="$emit(\'update:modelValue\', $event.target.value)" class="mock-select"><option v-for="i in items" :key="i" :value="i">{{i}}</option></select>',
};

describe('SettingsModal.vue', () => {
  const mountComponent = () => {
    return mount(SettingsModal, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              settings: {
                minStreamDuration: 30,
                timezone: 'UTC',
              },
            },
            stubActions: false,
          }),
        ],
        stubs: {
          'v-dialog': {
            props: ['modelValue'],
            template: `
              <div>
                <slot name="activator" :props="{ onClick: () => $emit('update:modelValue', true) }" />
                <div v-if="modelValue" class="dialog-content">
                  <slot />
                </div>
              </div>
            `,
          },
          'v-card': { template: '<div><slot /></div>' },
          'v-card-title': { template: '<div><slot /></div>' },
          'v-card-text': { template: '<div><slot /></div>' },
          'v-card-actions': { template: '<div><slot /></div>' },
          'v-row': { template: '<div><slot /></div>' },
          'v-col': { template: '<div><slot /></div>' },
          'v-spacer': true,
          'v-divider': true,
          'v-btn': {
            props: ['prependIcon'],
            template: '<button class="v-btn-stub" @click="$emit(\'click\')"><slot /></button>',
          },
          'v-slider': {
            props: ['modelValue'],
            template: '<input type="range" :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" class="mock-slider" />',
          },
          'v-text-field': {
            props: ['modelValue'],
            template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', Number($event.target.value))" class="mock-input" />',
          },
          'v-autocomplete': VAutocompleteStub,
          'v-icon': true,
        },
      },
    });
  };

  it('renders the trigger button correctly', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.v-btn-stub').text()).toBe('settings.title');
  });

  it('opens dialog when trigger button is clicked', async () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.dialog-content').exists()).toBe(false);
    await wrapper.find('.v-btn-stub').trigger('click');
    expect(wrapper.find('.dialog-content').exists()).toBe(true);
  });

  it('initializes local state from store when dialog opens', async () => {
    const wrapper = mountComponent();
    const store = useSettingsStore();
    store.minStreamDuration = 45;
    store.timezone = 'America/Sao_Paulo';

    await wrapper.find('.v-btn-stub').trigger('click');

    const slider = wrapper.find('.mock-slider');
    const select = wrapper.find('.mock-select');

    expect((slider.element as HTMLInputElement).value).toBe('45');
    expect((select.element as HTMLSelectElement).value).toBe('America/Sao_Paulo');
  });

  it('updates store and closes dialog when save is clicked', async () => {
    const wrapper = mountComponent();
    const store = useSettingsStore();

    await wrapper.find('.v-btn-stub').trigger('click');

    await wrapper.find('.mock-slider').setValue(60);
    await wrapper.find('.mock-select').setValue('Europe/London');

    const saveBtn = wrapper.findAll('.v-btn-stub').find(b => b.text() === 'settings.save');
    await saveBtn?.trigger('click');

    expect(store.minStreamDuration).toBe(60);
    expect(store.timezone).toBe('Europe/London');
    expect(wrapper.find('.dialog-content').exists()).toBe(false);
  });

  it('closes dialog without saving when close icon is clicked', async () => {
    const wrapper = mountComponent();
    const store = useSettingsStore();
    const initialDuration = store.minStreamDuration;

    await wrapper.find('.v-btn-stub').trigger('click');

    await wrapper.find('.mock-slider').setValue(100);

    const allBtns = wrapper.findAll('.v-btn-stub');
    await allBtns[1].trigger('click');

    expect(store.minStreamDuration).toBe(initialDuration);
    expect(wrapper.find('.dialog-content').exists()).toBe(false);
  });

  it('filters timezones correctly ignoring accents and case', async () => {
    const wrapper = mountComponent();
    await wrapper.find('.v-btn-stub').trigger('click');
    
    const autocomplete = wrapper.findComponent(VAutocompleteStub);
    const filterFn = autocomplete.props('customFilter');

    expect(filterFn('America/Sao_Paulo', 'sao', {})).toBe(true);
    expect(filterFn('America/Sao_Paulo', 'SAO', {})).toBe(true);
    expect(filterFn('America/Sao_Paulo', 'São', {})).toBe(true);
    expect(filterFn('Europe/London', 'sao', {})).toBe(false);
  });
});