import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createTestingPinia } from '@pinia/testing';
import * as vueRouter from 'vue-router';
import MainView from '@/pages/MainView.vue';
import { useSpotifyStore } from '@/stores/spotify';
import { useUiStore } from '@/stores/ui';

vi.mock('vue-router', () => ({
  useRouter: vi.fn(),
}));

vi.mock('vue-i18n', () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

const FileUploadStub = {
  name: 'FileUpload',
  props: ['width'],
  template: '<div class="file-upload-stub"></div>',
};

describe('MainView.vue', () => {
  const pushMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (vueRouter.useRouter as any).mockReturnValue({
      push: pushMock,
    });
  });

  const mountComponent = (piniaConfig = {}) => {
    return mount(MainView, {
      global: {
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
            stubActions: false,
            ...piniaConfig
          }),
        ],
        stubs: {
          FileUpload: FileUploadStub,
        },
      },
    });
  };

  it('renders the hero section with translated text', () => {
    const wrapper = mountComponent();
    
    expect(wrapper.find('h1').text()).toBe('home.hero.title');
    expect(wrapper.find('h2').text()).toBe('home.hero.subtitle');
    expect(wrapper.find('h3').text()).toBe('home.hero.footer');
  });

  it('renders the aurora background elements', () => {
    const wrapper = mountComponent();
    expect(wrapper.find('.aurora-bg').exists()).toBe(true);
  });

  it('renders the FileUpload component', () => {
    const wrapper = mountComponent();
    expect(wrapper.findComponent(FileUploadStub).exists()).toBe(true);
  });

  it('handles file change correctly: updates store, sets loading and redirects', async () => {
    const wrapper = mountComponent();
    
    const spotifyStore = useSpotifyStore();
    const uiStore = useUiStore();
    
    const mockJson = [{ ts: '2023-01-01', msPlayed: 1000 }] as any;
    
    const fileUpload = wrapper.findComponent(FileUploadStub);
    await fileUpload.vm.$emit('handle-change', mockJson);

    expect(uiStore.loading).toBe(true);
    expect(spotifyStore.data).toEqual(mockJson);
    expect(pushMock).toHaveBeenCalledWith({ name: 'Dashboard' });
  });

  it('applies the correct width prop to FileUpload', () => {
    const wrapper = mountComponent();
    const fileUpload = wrapper.findComponent(FileUploadStub);
    expect(fileUpload.props('width')).toBe('100%');
  });
});