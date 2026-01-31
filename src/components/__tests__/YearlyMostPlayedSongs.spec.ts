import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import YearlyMostPlayedSongs from '@/components/YearlyMostPlayedSongs.vue';
import type { TopSongs } from '@/types/DataManipulation';

vi.mock('vue-i18n', () => ({
    useI18n: () => ({
        t: (key: string, params?: any) => params ? `${key} ${JSON.stringify(params)}` : key,
    }),
}));

const mockSongs: TopSongs[] = Array.from({ length: 15 }, (_, i) => ({
    title: `Song ${i + 1}`,
    artist: `Artist ${i + 1}`,
    timesPlayed: 100 - i,
    uri: `spotify:track:${i}`,
    image: `image-${i}.jpg`
}));

const VTooltipStub = {
    props: ['text'],
    template: `
    <div class="v-tooltip-stub" :data-text="text">
      <slot name="activator" :props="{}" />
      <slot />
    </div>
  `
};

describe('YearlyMostPlayedSongs.vue', () => {
    const mountComponent = (dados: TopSongs[]) => {
        return mount(YearlyMostPlayedSongs, {
            props: { dados },
            global: {
                stubs: {
                    'v-tooltip': VTooltipStub
                }
            }
        });
    };

    it('renders empty state when no data is provided', () => {
        const wrapper = mountComponent([]);
        
        expect(wrapper.find('.mainDiv.empty').exists()).toBe(true);
        expect(wrapper.find('.mainDiv.empty h1').text()).toBe('top_songs.empty');
        expect(wrapper.find('.topOne').exists()).toBe(false);
    });

    it('renders the top one song correctly', () => {
        const topSong = [mockSongs[0]];
        const wrapper = mountComponent(topSong);

        expect(wrapper.find('.mainDiv.empty').exists()).toBe(false);
        expect(wrapper.find('.topOne').exists()).toBe(true);
        expect(wrapper.find('.title').text()).toBe('1. Song 1');
        expect(wrapper.find('.subtitle').text()).toBe('Artist 1');
        
        const tooltip = wrapper.find('.v-tooltip-stub');
        expect(tooltip.text()).toContain('top_songs.count {"count":100}');
    });

    it('renders the visualizer spans in the top card', () => {
        const wrapper = mountComponent([mockSongs[0]]);
        const spans = wrapper.findAll('.visualizer span');
        expect(spans).toHaveLength(64);
    });

    it('does not render others list if only one song exists', () => {
        const wrapper = mountComponent([mockSongs[0]]);
        expect(wrapper.find('.others').exists()).toBe(false);
    });

    it('renders the others list when more than one song is provided', () => {
        const threeSongs = mockSongs.slice(0, 3);
        const wrapper = mountComponent(threeSongs);

        expect(wrapper.find('.others').exists()).toBe(true);
        
        const listItems = wrapper.findAll('.list-item');
        expect(listItems).toHaveLength(2);

        expect(listItems[0].find('.rank').text()).toBe('2.');
        expect(listItems[0].find('.text').text()).toContain('Song 2 - Artist 2');

        expect(listItems[1].find('.rank').text()).toBe('3.');
        expect(listItems[1].find('.text').text()).toContain('Song 3 - Artist 3');
    });

    it('limits the others list to 9 items (indices 1 to 9)', () => {
        const wrapper = mountComponent(mockSongs); 
        
        const listItems = wrapper.findAll('.list-item');
        expect(listItems).toHaveLength(9);

        expect(listItems[0].find('.rank').text()).toBe('2.');
        expect(listItems[8].find('.rank').text()).toBe('10.');
        
        expect(wrapper.text()).not.toContain('Song 11');
    });

    it('displays the correct title', () => {
        const wrapper = mountComponent([]);
        expect(wrapper.find('.titleDiv h1').text()).toBe('top_songs.title');
    });

    it('passes correct text to tooltips', () => {
        const wrapper = mountComponent(mockSongs.slice(0, 2));
        
        const tooltips = wrapper.findAllComponents(VTooltipStub);
        
        expect(tooltips[0].props('text')).toBe('top_songs.streams');
        expect(tooltips[1].props('text')).toBe('top_songs.streams');
    });
});