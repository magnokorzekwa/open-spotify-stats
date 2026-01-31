import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import * as vueRouter from 'vue-router';
import DashboardView from '@/pages/DashboardView.vue';
import { useSpotifyStore } from '@/stores/spotify';
import { useUiStore } from '@/stores/ui';
import { useSettingsStore } from '@/stores/settings';
import { processSpotifyData } from '@/services/SpotifyContentManager';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/services/SpotifyContentManager', () => ({
  processSpotifyData: vi.fn(),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
  createI18n: () => ({
    global: { t: (key: string) => key }
  })
}));

describe('DashboardView.vue', () => {
  const mockSpotifyData = [{ ts: '2023-01-01', msPlayed: 10000 }];
  const mockProcessedData = {
    actionsPerYear: [['2023', mockSpotifyData]],
    artistsMostListened: { '2023': [] },
    songsMostListened: { '2023': [] },
    latestYear: '2023',
    mostSkipped: { '2023': {} },
    listeningPeriod: { '2023': 'morning' },
    mostUsedPlatform: { '2023': 'desktop' },
    hoursMostListened: { '2023': Array(24).fill(0) }
  };

  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (vueRouter.useRouter as any).mockReturnValue({
      push: pushMock,
    });
    (processSpotifyData as any).mockResolvedValue(mockProcessedData);
  });

  const mountComponent = (pinia: any) => {
    return mount(DashboardView, {
      global: {
        plugins: [pinia],
        stubs: {
          YearDashboard: { template: '<div class="year-stats-stub" />' },
          YearResume: true,
          YearMostPlayedArtists: true,
          YearlyMostPlayedSongs: true,
          FunStats: true,
          YearMostListenedHours: true,
          SettingsModal: true,
          'v-sheet': { template: '<div><slot /></div>' },
          'v-tabs': { props: ['modelValue'], template: '<div><slot /></div>' },
          'v-tab': { template: '<div class="v-tab-stub"><slot /></div>' },
          'v-divider': true,
          'v-tabs-window': { props: ['modelValue'], template: '<div><slot /></div>' },
          'v-tabs-window-item': { props: ['value'], template: '<div v-if="$parent.modelValue === value"><slot /></div>' },
        },
      },
    });
  };

  it('redirects to Main if no spotify data is present', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    const spotifyStore = useSpotifyStore(pinia);
    spotifyStore.data = [];

    mountComponent(pinia);
    await flushPromises();

    expect(pushMock).toHaveBeenCalledWith({ name: 'Main' });
  });

  it('calls generateDashboardData on mount and manages loading state', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    const spotifyStore = useSpotifyStore(pinia);
    const uiStore = useUiStore(pinia);
    spotifyStore.data = mockSpotifyData as any;

    mountComponent(pinia);
    
    expect(uiStore.loading).toBe(true);
    await flushPromises();
    expect(uiStore.loading).toBe(false);
    expect(processSpotifyData).toHaveBeenCalled();
  });

  it('updates dashboard data when settings change', async () => {
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    const spotifyStore = useSpotifyStore(pinia);
    const settingsStore = useSettingsStore(pinia);
    spotifyStore.data = mockSpotifyData as any;

    mountComponent(pinia);
    await flushPromises();
    vi.clearAllMocks();

    settingsStore.minStreamDuration = 60;
    await flushPromises();
    
    expect(processSpotifyData).toHaveBeenCalled();
  });

  it('sorts year entries chronologically', async () => {
    (processSpotifyData as any).mockResolvedValue({
      ...mockProcessedData,
      actionsPerYear: [['2023', []], ['2021', []], ['2022', []]],
      latestYear: '2023'
    });

    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    const spotifyStore = useSpotifyStore(pinia);
    spotifyStore.data = mockSpotifyData as any;

    const wrapper = mountComponent(pinia);
    await flushPromises();

    const tabs = wrapper.findAll('.v-tab-stub');
    expect(tabs[0].text()).toBe('2021');
    expect(tabs[1].text()).toBe('2022');
    expect(tabs[2].text()).toBe('2023');
  });

  it('handles error in processSpotifyData gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (processSpotifyData as any).mockRejectedValue(new Error('Process error'));
    
    const pinia = createTestingPinia({ createSpy: vi.fn, stubActions: false });
    const spotifyStore = useSpotifyStore(pinia);
    const uiStore = useUiStore(pinia);
    spotifyStore.data = mockSpotifyData as any;

    mountComponent(pinia);
    await flushPromises();

    expect(consoleSpy).toHaveBeenCalled();
    expect(uiStore.loading).toBe(false);
    consoleSpy.mockRestore();
  });
});