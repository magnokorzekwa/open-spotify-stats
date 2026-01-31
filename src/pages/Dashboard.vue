<script setup lang="ts">
import { computed, onMounted, ref, toRaw, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useSpotifyStore } from '@/stores/spotify';
import { useUiStore } from '@/stores/ui';
import { processSpotifyData } from '@/services/SpotifyContentManager';
import FunStats from '@/components/FunStats.vue';
import YearResume from '@/components/YearHeatmap.vue';
import YearMostPlayedArtists from '@/components/YearMostPlayedArtists.vue';
import YearlyMostPlayedSongs from '@/components/YearlyMostPlayedSongs.vue';
import YearDashboard from '@/components/YearlyStreams.vue';
import type SpotifyModel from '@/models/SpotifyModel';
import type { MostSkipped, TopArtist, TopSongs, YearData } from '@/types/DataManipulation';
import YearMostListenedHours from '@/components/YearMostListenedHours.vue';
import { useSettingsStore } from '@/stores/settings';
import SettingsModal from '@/components/SettingsModal.vue';

const router = useRouter();
const spotifyStore = useSpotifyStore();
const uiStore = useUiStore();
const settingsStore = useSettingsStore();

const tab = ref<string | null>(null);
const data = ref<Map<string, SpotifyModel[]>>(new Map());
const dataTotal = ref<YearData[]>([]);

const mostListenedByYear = ref<Record<string, TopArtist[]>>({});
const songsMostListened = ref<Record<string, TopSongs[]>>({});
const mostSkippedRef = ref<Record<string, MostSkipped>>({});
const listeningPeriodRef = ref<Record<string, string>>({});
const mostUsedPlatformRef = ref<Record<string, string>>({});
const mostListenedHours = ref<Record<string, number[]>>({});

const sortedYearEntries = computed(() => {
  return Array.from(data.value.entries()).sort(([yearA], [yearB]) => 
    yearA.localeCompare(yearB)
  );
});

const generateDashboardData = async () => {
  if (!spotifyStore.data || spotifyStore.data.length === 0) return;

  try {
    uiStore.loading = true;
    const rawData = toRaw(spotifyStore.data);

    const {
      actionsPerYear,
      artistsMostListened,
      songsMostListened: songsMostListenedResult,
      latestYear,
      mostSkipped,
      listeningPeriod,
      mostUsedPlatform,
      hoursMostListened
    } = await processSpotifyData(rawData, 5, 10, settingsStore.minStreamDuration, settingsStore.timezone);

    data.value = new Map(actionsPerYear);
    
    dataTotal.value = actionsPerYear
      .map(([year, actions]) => ({
        year,
        total: actions.length
      }))
      .sort((a, b) => a.year.localeCompare(b.year));

    mostListenedByYear.value = artistsMostListened;
    songsMostListened.value = songsMostListenedResult;
    mostSkippedRef.value = mostSkipped;
    listeningPeriodRef.value = listeningPeriod;
    mostUsedPlatformRef.value = mostUsedPlatform;
    mostListenedHours.value = hoursMostListened;

    if (!tab.value) {
      tab.value = latestYear;
    }

  } catch (error) {
    console.error(error);
  } finally {
    uiStore.loading = false;
  }
};

watch(
  () => [settingsStore.minStreamDuration, settingsStore.timezone],
  async () => {
    await generateDashboardData();
  }
);

onMounted(async () => {
  if (!spotifyStore.data || spotifyStore.data.length === 0) {
    router.push({ name: 'Main' });
    return;
  }

  await generateDashboardData();
});
</script>

<template>
  <div class="dashboard-container">
    <div class="settings-section">
      <div class="settings-modal">
        <SettingsModal/>
      </div>
    </div>

    <div class="section main-dashboard">
      <YearDashboard :data="dataTotal" />
    </div>

    <div class="section detail-dashboard">
      <v-sheet elevation="4" rounded="lg" class="tabs-sheet">
        <v-tabs 
          v-model="tab"
          show-arrows 
          center-active
          align-tabs="center" 
          bg-color="transparent"
          class="year-tabs"
        >
          <v-tab 
            v-for="[year] in sortedYearEntries" 
            :key="year" 
            :value="year"
          >
            {{ year }}
          </v-tab>
        </v-tabs>

        <v-divider />

        <v-tabs-window v-model="tab">
          <v-tabs-window-item 
            v-for="[year, streams] in sortedYearEntries" 
            :key="year"
            :value="year"
            class="tab-content"
          >
            <div class="content-grid">
              <YearResume 
                :year="Number(year)" 
                :streams="streams" 
              />
              
              <YearMostPlayedArtists 
                :dados="mostListenedByYear[year] ?? []" 
              />
              
              <YearlyMostPlayedSongs 
                :dados="songsMostListened[year] ?? []" 
              />
              
              <FunStats 
                :most-skipped="mostSkippedRef[year] ?? {} as MostSkipped"
                :listening-period="listeningPeriodRef[year] ?? ''"
                :most-used-platform="mostUsedPlatformRef[year] ?? ''" 
              />

              <YearMostListenedHours :hours-data="mostListenedHours[year] ?? []"/>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
      </v-sheet>
    </div>
  </div>
</template>

<style lang="scss" scoped>
@use '../styles/colors' as *;

.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  padding: 50px 5%;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 20px 16px;
    gap: 24px;
  }
}

.section {
  width: 100%;
}

.main-dashboard {
  border: 2px solid $borderColor;
  border-radius: 12px;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }
}

.tabs-sheet {
  overflow: hidden;
  
  .year-tabs {
    
    :deep(.v-slide-group__prev),
    :deep(.v-slide-group__next) {
      display: flex !important; 
      visibility: visible !important;
      opacity: 1 !important;
      background: transparent !important;
      min-width: 48px; 
    }

    :deep(.v-slide-group__prev--disabled),
    :deep(.v-slide-group__next--disabled) {
      opacity: 0.3 !important; 
      pointer-events: none;
      display: flex !important; 
    }

    :deep(.v-icon) {
      color: #ffffff !important;
      font-size: 2rem !important; 
      opacity: 1 !important;
    }
    
    :deep(.mdi-chevron-right),
    :deep(.mdi-chevron-left) {
      color: #ffffff !important;
    }
  }
}

.tab-content {
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
}

.content-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
}
</style>