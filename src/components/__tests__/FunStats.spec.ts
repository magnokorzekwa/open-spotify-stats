import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FunStats from '@/components/FunStats.vue';
import { createTestingPinia } from '@pinia/testing';
import { useSettingsStore } from '@/stores/settings';

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, any>) => {
      if (params) return `${key} ${JSON.stringify(params)}`;
      return key;
    },
  }),
  createI18n: () => ({
    global: {
      locale: { value: 'pt' },
      t: (k: string) => k
    }
  })
}));

describe('FunStats.vue', () => {
  const defaultProps = {
    mostSkipped: {
      mostSkippedArtist: 'Artist A',
      mostSkippedTrack: 'Track A',
      mostSkippedCount: 10,
    },
    listeningPeriod: 'morning',
    mostUsedPlatform: 'mobile',
  };

  const mountComponent = (props = defaultProps) => {
    return mount(FunStats, {
      props,
      global: {
        plugins: [
            createTestingPinia({
                createSpy: vi.fn,
                initialState: {
                    settings: {
                        minStreamDuration: 30
                    }
                }
            })
        ]
      },
    });
  };

  it('renders title correctly', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.title-div h1').text()).toBe('curious_stats.title');
  });

  it('renders hated artist card with correct data', () => {
    const wrapper = mountComponent();
    const store = useSettingsStore();
    store.minStreamDuration = 30;

    const hatedCard = wrapper.find('.hated-artist');
    expect(hatedCard.exists()).toBe(true);
    expect(hatedCard.find('h1').text()).toBe('curious_stats.hated_artist.title');
    expect(hatedCard.find('h2').text()).toBe('Artist A - Track A');
    
    const h4Text = hatedCard.find('h4').text();
    expect(h4Text).toContain('curious_stats.hated_artist.description');
    expect(h4Text).toContain('"count":10');
    expect(h4Text).toContain('"limit":30');
  });

  it('renders day/night card correctly for morning', () => {
    const wrapper = mountComponent({ ...defaultProps, listeningPeriod: 'morning' });
    const card = wrapper.find('.day-night-person');
    
    expect(card.exists()).toBe(true);
    expect(card.classes()).not.toContain('is-night');
    expect(card.find('h1').text()).toBe('curious_stats.day_night.morning.phrase');
    expect(card.find('h3').text()).toContain('curious_stats.day_night.preference {"period":"curious_stats.day_night.morning.name"}');
    expect(card.find('iconify-icon').attributes('icon')).toBe('solar:sun-bold');
  });

  it('renders day/night card correctly for afternoon', () => {
    const wrapper = mountComponent({ ...defaultProps, listeningPeriod: 'afternoon' });
    const card = wrapper.find('.day-night-person');
    
    expect(card.find('h1').text()).toBe('curious_stats.day_night.afternoon.phrase');
    expect(card.find('iconify-icon').attributes('icon')).toBe('solar:sun-bold');
  });

  it('renders day/night card correctly for night', () => {
    const wrapper = mountComponent({ ...defaultProps, listeningPeriod: 'night' });
    const card = wrapper.find('.day-night-person');
    
    expect(card.classes()).toContain('is-night');
    expect(card.find('h1').text()).toBe('curious_stats.day_night.night.phrase');
    expect(card.find('iconify-icon').attributes('icon')).toBe('solar:moon-bold');
  });

  it('renders day/night card correctly for unknown period', () => {
    const wrapper = mountComponent({ ...defaultProps, listeningPeriod: 'unknown' });
    const card = wrapper.find('.day-night-person');
    
    expect(card.find('h1').text()).toBe('curious_stats.day_night.phrase');
    expect(card.find('h3').text()).toContain('curious_stats.day_night.name');
    expect(card.find('iconify-icon').attributes('icon')).toBe('solar:sun-bold');
  });

  it('renders platform card correctly for desktop', () => {
    const wrapper = mountComponent({ ...defaultProps, mostUsedPlatform: 'desktop' });
    const card = wrapper.find('.main-device');

    expect(card.exists()).toBe(true);
    expect(card.find('h1').text()).toBe('curious_stats.platform.desktop.phrase');
    expect(card.find('h3').text()).toContain('curious_stats.platform.preference {"device":"curious_stats.platform.desktop.name"}');
    expect(card.find('iconify-icon').attributes('icon')).toBe('jam:computer');
  });

  it('renders platform card correctly for default/mobile', () => {
    const wrapper = mountComponent({ ...defaultProps, mostUsedPlatform: 'mobile' });
    const card = wrapper.find('.main-device');

    expect(card.find('h1').text()).toBe('curious_stats.platform.default_phrase');
    expect(card.find('h3').text()).toContain('curious_stats.platform.preference {"device":"curious_stats.platform.default_name"}');
    expect(card.find('iconify-icon').attributes('icon')).toBe('jam:phone');
  });

  it('renders responsive grid layout class', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.grid-layout').exists()).toBe(true);
  });
});