import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('spotify.worker.ts', () => {
  const mockData = [
    {
      ts: '2023-01-01T10:00:00Z',
      ms_played: 40000,
      master_metadata_album_artist_name: 'Artist A',
      master_metadata_track_name: 'Track A',
      platform: 'Android',
      skipped: false
    }
  ]

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
      // @ts-ignore
      self.onmessage(event)
    }
  }

  it('should process data correctly via postMessage', async () => {
    await runWorker({
      data: mockData,
      topArtistsQty: 5,
      topSongsQtd: 10,
      minStreamDuration: 30,
      timezone: 'UTC'
    })

    expect(self.postMessage).toHaveBeenCalled()
    const result = (self.postMessage as any).mock.calls[0][0]
    
    expect(result.latestYear).toBe('2023')
    expect(result.artistsMostListened['2023'][0].artist).toBe('Artist A')
  })

  it('should filter songs by minimum duration (thresholdMs)', async () => {
    await runWorker({
      data: mockData,
      topArtistsQty: 5,
      topSongsQtd: 10,
      minStreamDuration: 60,
      timezone: 'UTC'
    })

    const result = (self.postMessage as any).mock.calls[0][0]
    expect(result.artistsMostListened['2023']).toHaveLength(0)
  })

  it('should correctly calculate the most skipped song', async () => {
    await runWorker({
      data: [
        {
          ts: '2023-01-01T10:00:00Z',
          ms_played: 500,
          master_metadata_album_artist_name: 'Skipper',
          master_metadata_track_name: 'I hate this song',
          reason_end: 'fwdbtn'
        }
      ],
      topArtistsQty: 5,
      topSongsQtd: 10,
      minStreamDuration: 30,
      timezone: 'UTC'
    })

    const result = (self.postMessage as any).mock.calls[0][0]
    expect(result.mostSkipped['2023']).toEqual({
      mostSkippedArtist: 'Skipper',
      mostSkippedTrack: 'I hate this song',
      mostSkippedCount: 1
    })
  })

  it('should normalize platforms correctly', async () => {
    await runWorker({
      data: [
        { ts: '2023-01-01T10:00:00Z', ms_played: 50000, platform: 'iOS 15.1' }
      ],
      topArtistsQty: 5,
      topSongsQtd: 10,
      minStreamDuration: 10,
      timezone: 'UTC'
    })

    const result = (self.postMessage as any).mock.calls[0][0]
    expect(result.mostUsedPlatform['2023']).toBe('mobile')
  })

  it('should identify the correct listening period based on timezone', async () => {
    await runWorker({
      data: [
        { ts: '2023-01-01T10:00:00Z', ms_played: 100000, platform: 'mobile' }
      ],
      topArtistsQty: 5,
      topSongsQtd: 10,
      minStreamDuration: 10,
      timezone: 'UTC'
    })

    const result = (self.postMessage as any).mock.calls[0][0]
    expect(result.listeningPeriod['2023']).toBe('morning')
  })
})