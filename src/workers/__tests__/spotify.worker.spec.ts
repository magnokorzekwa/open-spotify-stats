import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('spotify.worker.ts', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    
    global.self = {
      postMessage: vi.fn(),
      onmessage: null
    } as any
  })

  const runWorker = async (input: any) => {
    await import('@/workers/spotify.worker')
    if (self.onmessage) {
      const event = { data: input } as MessageEvent
      self.onmessage(event)
    }
  }

  describe('Basic Functionality', () => {
    it('should process single entry correctly', async () => {
      await runWorker({
        data: [{
          ts: '2023-01-01T10:00:00Z',
          ms_played: 40000,
          master_metadata_album_artist_name: 'Artist A',
          master_metadata_track_name: 'Track A',
          platform: 'Android',
          skipped: false
        }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      expect(self.postMessage).toHaveBeenCalled()
      const result = (self.postMessage as any).mock.calls[0][0]
      
      expect(result.latestYear).toBe('2023')
      expect(result.actionsPerYear).toHaveLength(1)
      expect(result.artistsMostListened['2023'][0]).toEqual({
        artist: 'Artist A',
        timesPlayed: 1
      })
    })

    it('should handle empty data array', async () => {
      await runWorker({
        data: [],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.actionsPerYear).toHaveLength(0)
      expect(result.latestYear).toBe('0')
    })
  })

  describe('Year Grouping', () => {
    it('should group data from multiple years separately', async () => {
      await runWorker({
        data: [
          { ts: '2022-06-15T14:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Old Artist' },
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'New Artist' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.actionsPerYear).toHaveLength(2)
      expect(result.latestYear).toBe('2023')
      expect(result.artistsMostListened['2022'][0].artist).toBe('Old Artist')
      expect(result.artistsMostListened['2023'][0].artist).toBe('New Artist')
    })

    it('should sort years descending in actionsPerYear', async () => {
      await runWorker({
        data: [
          { ts: '2021-01-01T00:00:00Z', ms_played: 60000 },
          { ts: '2023-01-01T00:00:00Z', ms_played: 60000 },
          { ts: '2022-01-01T00:00:00Z', ms_played: 60000 }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.actionsPerYear[0][0]).toBe('2023')
      expect(result.actionsPerYear[1][0]).toBe('2022')
      expect(result.actionsPerYear[2][0]).toBe('2021')
    })

    it('should handle entries without ts field', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Valid' },
          { ms_played: 60000, master_metadata_album_artist_name: 'No Timestamp' } as any
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.artistsMostListened['2023']).toHaveLength(1)
      expect(result.artistsMostListened['2023'][0].artist).toBe('Valid')
    })
  })

  describe('Duration Threshold (ms_played)', () => {
    it('should exclude entries below threshold from valid data', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 29000, master_metadata_album_artist_name: 'Too Short' },
          { ts: '2023-01-01T10:00:00Z', ms_played: 31000, master_metadata_album_artist_name: 'Long Enough' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.artistsMostListened['2023']).toHaveLength(1)
      expect(result.artistsMostListened['2023'][0].artist).toBe('Long Enough')
    })

    it('should include short entries in skipped bucket for mostSkipped calculation', async () => {
      await runWorker({
        data: [
          { 
            ts: '2023-01-01T10:00:00Z', 
            ms_played: 500, 
            master_metadata_album_artist_name: 'Skipped Artist',
            master_metadata_track_name: 'Skipped Track',
            reason_end: 'fwdbtn'
          }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostSkipped['2023'].mostSkippedCount).toBe(1)
      expect(result.artistsMostListened['2023']).toHaveLength(0)
    })

    it('should handle zero minStreamDuration', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 1, master_metadata_album_artist_name: 'Tiny' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 0,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.artistsMostListened['2023']).toHaveLength(1)
    })
  })

  describe('Top Artists Logic', () => {
    it('should limit artists to topArtistsQty', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Artist 1' },
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Artist 2' },
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Artist 3' }
        ],
        topArtistsQty: 2,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.artistsMostListened['2023']).toHaveLength(2)
    })

    it('should sort artists by play count descending', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Rare' },
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Popular' },
          { ts: '2023-01-01T11:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Popular' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.artistsMostListened['2023'][0].artist).toBe('Popular')
      expect(result.artistsMostListened['2023'][0].timesPlayed).toBe(2)
      expect(result.artistsMostListened['2023'][1].artist).toBe('Rare')
    })

    it('should handle entries without artist name', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: null },
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Valid Artist' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.artistsMostListened['2023']).toHaveLength(1)
      expect(result.artistsMostListened['2023'][0].artist).toBe('Valid Artist')
    })
  })

  describe('Top Songs Logic', () => {
    it('should aggregate plays by artist+track combination', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Artist A', master_metadata_track_name: 'Song X' },
          { ts: '2023-01-01T11:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Artist A', master_metadata_track_name: 'Song X' },
          { ts: '2023-01-01T12:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Artist B', master_metadata_track_name: 'Song X' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.songsMostListened['2023']).toHaveLength(2)
      const topSong = result.songsMostListened['2023'][0]
      expect(topSong.timesPlayed).toBe(2)
      expect(topSong.artist).toBe('Artist A')
    })

    it('should handle same track name by different artists', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Artist A', master_metadata_track_name: 'Hit Song' },
          { ts: '2023-01-01T11:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Artist B', master_metadata_track_name: 'Hit Song' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.songsMostListened['2023']).toHaveLength(2)
    })

    it('should skip entries missing track or artist name', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Artist', master_metadata_track_name: null },
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: null, master_metadata_track_name: 'Track' },
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Valid', master_metadata_track_name: 'Valid' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.songsMostListened['2023']).toHaveLength(1)
    })
  })

  describe('Most Skipped Logic', () => {
    it('should track skips via skipped flag or fwdbtn reason', async () => {
      await runWorker({
        data: [
          { 
            ts: '2023-01-01T10:00:00Z', 
            ms_played: 500, 
            master_metadata_album_artist_name: 'Flag Skip',
            master_metadata_track_name: 'Track 1',
            skipped: true
          },
          { 
            ts: '2023-01-01T10:00:00Z', 
            ms_played: 500, 
            master_metadata_album_artist_name: 'Button Skip',
            master_metadata_track_name: 'Track 2',
            reason_end: 'fwdbtn'
          },
          { 
            ts: '2023-01-01T10:00:00Z', 
            ms_played: 500, 
            master_metadata_album_artist_name: 'Not Skipped',
            master_metadata_track_name: 'Track 3',
            skipped: false,
            reason_end: 'trackdone'
          }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostSkipped['2023'].mostSkippedCount).toBe(1)
    })

    it('should find most skipped track with multiple skips', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 500, master_metadata_album_artist_name: 'Popular Skip', master_metadata_track_name: 'Annoying Song', reason_end: 'fwdbtn' },
          { ts: '2023-01-01T11:00:00Z', ms_played: 500, master_metadata_album_artist_name: 'Popular Skip', master_metadata_track_name: 'Annoying Song', reason_end: 'fwdbtn' },
          { ts: '2023-01-01T12:00:00Z', ms_played: 500, master_metadata_album_artist_name: 'Rare Skip', master_metadata_track_name: 'Okay Song', reason_end: 'fwdbtn' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostSkipped['2023'].mostSkippedArtist).toBe('Popular Skip')
      expect(result.mostSkipped['2023'].mostSkippedTrack).toBe('Annoying Song')
      expect(result.mostSkipped['2023'].mostSkippedCount).toBe(2)
    })

    it('should return empty strings when no skips exist', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, master_metadata_album_artist_name: 'Good', master_metadata_track_name: 'Song', reason_end: 'trackdone' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostSkipped['2023']).toEqual({
        mostSkippedTrack: '',
        mostSkippedArtist: '',
        mostSkippedCount: 0
      })
    })
  })

  describe('Listening Period Logic', () => {
    it('should identify morning (5-12)', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T08:00:00Z', ms_played: 60000 }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.listeningPeriod['2023']).toBe('morning')
    })

    it('should identify afternoon (12-18)', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T14:00:00Z', ms_played: 60000 }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.listeningPeriod['2023']).toBe('afternoon')
    })

    it('should identify night (18-5)', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T20:00:00Z', ms_played: 60000 },
          { ts: '2023-01-01T23:00:00Z', ms_played: 60000 },
          { ts: '2023-01-01T04:00:00Z', ms_played: 60000 }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.listeningPeriod['2023']).toBe('night')
    })

    it('should use ms_played as weight for period calculation', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T08:00:00Z', ms_played: 1000 },
          { ts: '2023-01-01T14:00:00Z', ms_played: 100000 }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.listeningPeriod['2023']).toBe('afternoon')
    })

    it('should default to morning when tied', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T08:00:00Z', ms_played: 60000 },
          { ts: '2023-01-01T20:00:00Z', ms_played: 60000 }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.listeningPeriod['2023']).toBe('morning')
    })
  })

  describe('Platform Normalization', () => {
    it('should normalize iOS to mobile', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000, platform: 'iOS 16.0' }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostUsedPlatform['2023']).toBe('mobile')
    })

    it('should normalize Android to mobile', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000, platform: 'Android OS 13' }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostUsedPlatform['2023']).toBe('mobile')
    })

    it('should normalize Windows to desktop', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000, platform: 'Windows 10' }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostUsedPlatform['2023']).toBe('desktop')
    })

    it('should normalize web player to web', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000, platform: 'Web Player (Chrome)' }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostUsedPlatform['2023']).toBe('web')
    })

    it('should normalize TV to tv', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000, platform: 'Chromecast' }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostUsedPlatform['2023']).toBe('tv')
    })

    it('should return other for unknown platforms', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000, platform: 'Unknown Device' }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostUsedPlatform['2023']).toBe('other')
    })

    it('should find most frequent platform', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, platform: 'iPhone' },
          { ts: '2023-01-01T11:00:00Z', ms_played: 60000, platform: 'iPhone' },
          { ts: '2023-01-01T12:00:00Z', ms_played: 60000, platform: 'Windows' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostUsedPlatform['2023']).toBe('mobile')
    })

    it('should handle null platform', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T10:00:00Z', ms_played: 60000, platform: null },
          { ts: '2023-01-01T11:00:00Z', ms_played: 60000, platform: 'Android' }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.mostUsedPlatform['2023']).toBe('mobile')
    })
  })

  describe('Hours Listened', () => {
    it('should count plays per hour', async () => {
      await runWorker({
        data: [
          { ts: '2023-01-01T08:00:00Z', ms_played: 60000 },
          { ts: '2023-01-01T08:30:00Z', ms_played: 60000 },
          { ts: '2023-01-01T14:00:00Z', ms_played: 60000 }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.hoursMostListened['2023'][8]).toBe(2)
      expect(result.hoursMostListened['2023'][14]).toBe(1)
      expect(result.hoursMostListened['2023'][0]).toBe(0)
    })

    it('should return array of 24 hours', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000 }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.hoursMostListened['2023']).toHaveLength(24)
    })
  })

  describe('Timezone Handling', () => {
    it('should handle UTC timezone', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000 }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.listeningPeriod['2023']).toBe('morning')
    })

    it('should handle America/New_York timezone', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000 }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'America/New_York'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.latestYear).toBe('2023')
    })

    it('should default to UTC when timezone is empty', async () => {
      await runWorker({
        data: [{ ts: '2023-01-01T10:00:00Z', ms_played: 60000 }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: ''
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.latestYear).toBe('2023')
    })
  })

  describe('Edge Cases', () => {
    it('should handle very large datasets efficiently', async () => {
      const largeData = Array(10000).fill(null).map((_, i) => ({
        ts: `2023-01-01T${String(i % 24).padStart(2, '0')}:00:00Z`,
        ms_played: 60000,
        master_metadata_album_artist_name: `Artist ${i % 100}`,
        master_metadata_track_name: `Track ${i % 200}`,
        platform: ['iOS', 'Android', 'Windows'][i % 3]
      }))

      await runWorker({
        data: largeData,
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      expect(self.postMessage).toHaveBeenCalled()
    })

    it('should handle entries with special characters in strings', async () => {
      await runWorker({
        data: [{
          ts: '2023-01-01T10:00:00Z',
          ms_played: 60000,
          master_metadata_album_artist_name: 'Artist & "Featured" <Script>',
          master_metadata_track_name: 'Track: Test | Pipe',
          platform: 'iOS'
        }],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.artistsMostListened['2023'][0].artist).toBe('Artist & "Featured" <Script>')
    })

    it('should handle negative or zero timestamps gracefully', async () => {
      await runWorker({
        data: [
          { ts: '1970-01-01T00:00:00Z', ms_played: 60000 },
          { ts: '1969-12-31T23:59:59Z', ms_played: 60000 }
        ],
        topArtistsQty: 5,
        topSongsQtd: 10,
        minStreamDuration: 30,
        timezone: 'UTC'
      })

      const result = (self.postMessage as any).mock.calls[0][0]
      expect(result.actionsPerYear.some(([year]: [string]) => year === '1970')).toBe(true)
    })
  })
})