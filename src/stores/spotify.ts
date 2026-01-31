import { defineStore } from 'pinia'
import type SpotifyModel from '@/models/SpotifyModel'

export const useSpotifyStore = defineStore('spotify', {
  state: () => ({
    data: null as SpotifyModel[] | null,
  }),
})
