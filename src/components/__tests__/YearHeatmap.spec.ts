import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import { useUiStore } from '@/stores/ui';
import YearHeatmap from '@/components/YearHeatmap.vue';
import { processCalendarData } from '@/services/HeatmapHandler';

vi.mock('@/services/HeatmapHandler', () => ({
  processCalendarData: vi.fn(),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock('vue3-apexcharts', () => ({
  default: {
    name: 'ApexChart',
    props: ['width', 'options', 'series'],
    template: '<div class="apex-chart-mock"></div>'
  }
}));

const resizeWindow = (width: number) => {
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });
  window.dispatchEvent(new Event('resize'));
};

describe('YearHeatmap.vue', () => {
  const mockStreams = [{ ts: '2023-01-01' }];
  const mockSeries = [{ name: 'Jan', data: [] }];

  beforeEach(() => {
    vi.clearAllMocks();
    (processCalendarData as any).mockResolvedValue({ weekSeries: mockSeries });
  });

  const mountComponent = () => {
    return mount(YearHeatmap, {
      props: {
        year: 2023,
        streams: mockStreams as any,
      },
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            initialState: {
              ui: { loading: false },
            },
            stubActions: false, 
          }),
        ],
      },
    });
  };

  it('renders correctly and calls data processing on mount', async () => {
    const wrapper = mountComponent();
    
    expect(processCalendarData).toHaveBeenCalledWith(2023, mockStreams);
    expect(wrapper.find('.heatmap-wrapper').exists()).toBe(true);
    expect(wrapper.find('.apex-chart-mock').exists()).toBe(true);
  });

  it('manages loading state correctly', async () => {
    const wrapper = mountComponent();
    const store = useUiStore();
    
    expect(store.loading).toBe(true);
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(store.loading).toBe(false);
  });

  it('updates series data after processing', async () => {
    const wrapper = mountComponent();
    await new Promise(resolve => setTimeout(resolve, 0));

    const chartStub = wrapper.findComponent({ name: 'ApexChart' }); 
    expect(chartStub.props('series')).toEqual(mockSeries);
  });

  it('handles desktop layout correctly', async () => {
    resizeWindow(1024);
    const wrapper = mountComponent();
    
    const chartStub = wrapper.findComponent({ name: 'ApexChart' });
    expect(chartStub.props('width')).toBe('100%');
    
    const options = chartStub.props('options');
    expect(options.title.style.fontSize).toBe('28px');
    
    expect(wrapper.find('.scroll-hint').exists()).toBe(false);
  });

  it('handles mobile layout correctly', async () => {
    resizeWindow(500);
    const wrapper = mountComponent();
    
    const chartStub = wrapper.findComponent({ name: 'ApexChart' });
    expect(chartStub.props('width')).toBe('1000');
    
    const options = chartStub.props('options');
    expect(options.title.style.fontSize).toBe('20px');
    
    expect(wrapper.find('.scroll-hint').exists()).toBe(true);
  });

  it('updates layout on window resize', async () => {
    resizeWindow(1024);
    const wrapper = mountComponent();
    
    expect(wrapper.find('.scroll-hint').exists()).toBe(false);

    resizeWindow(500);
    await wrapper.vm.$nextTick();

    expect(wrapper.find('.scroll-hint').exists()).toBe(true);
  });

  it('reacts to prop changes', async () => {
    const wrapper = mountComponent();
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(processCalendarData).toHaveBeenCalledTimes(1);

    await wrapper.setProps({ year: 2024 });
    await new Promise(resolve => setTimeout(resolve, 0));

    expect(processCalendarData).toHaveBeenCalledTimes(2);
    expect(processCalendarData).toHaveBeenCalledWith(2024, mockStreams);
  });

  it('handles errors during data processing', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (processCalendarData as any).mockRejectedValueOnce(new Error('Process failed'));
    
    const wrapper = mountComponent();
    const store = useUiStore();
    
    await new Promise(resolve => setTimeout(resolve, 0));
    
    expect(consoleSpy).toHaveBeenCalled();
    expect(store.loading).toBe(false);
    consoleSpy.mockRestore();
  });
});