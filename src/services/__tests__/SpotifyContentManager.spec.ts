import { describe, it, expect, vi, beforeEach } from 'vitest'
import { processSpotifyData } from '@/services/SpotifyContentManager'
import type SpotifyModel from '@/models/SpotifyModel'

const mocks = vi.hoisted(() => ({
    workerInstance: {
        postMessage: vi.fn(),
        terminate: vi.fn(),
        onmessage: null as ((e: MessageEvent) => void) | null,
        onerror: null as ((e: ErrorEvent) => void) | null,
    }
}));

vi.mock('@/workers/spotify.worker?worker', () => ({
  default: vi.fn(function() {
      return mocks.workerInstance;
  }),
}))

describe('SpotifyDataProcessor Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.workerInstance.onmessage = null
    mocks.workerInstance.onerror = null
  })

  it('should initialize worker, send correct configuration, and resolve data on success', async () => {
    const mockData = [{ ts: '2023-01-01' }] as SpotifyModel[]
    const topArtistsQty = 10
    const topSongsQtd = 20
    const minStreamDuration = 30000
    const userTimezone = 'America/Sao_Paulo'

    const expectedPayload = {
      data: mockData,
      topArtistsQty,
      topSongsQtd,
      minStreamDuration,
      timezone: userTimezone
    }

    const mockResult = { latestYear: '2023' }
    
    const promise = processSpotifyData(
      mockData, 
      topArtistsQty, 
      topSongsQtd, 
      minStreamDuration, 
      userTimezone
    )

    expect(mocks.workerInstance.postMessage).toHaveBeenCalledWith(expectedPayload)

    if (mocks.workerInstance.onmessage) {
      mocks.workerInstance.onmessage({ data: mockResult } as MessageEvent)
    }

    const result = await promise

    expect(result).toEqual(mockResult)
    expect(mocks.workerInstance.terminate).toHaveBeenCalled()
  })

  it('should use default values for optional parameters', async () => {
    const mockData = [] as SpotifyModel[]
    const minStreamDuration = 30
    const userTimezone = 'UTC'

    const promise = processSpotifyData(mockData, undefined, undefined, minStreamDuration, userTimezone)

    expect(mocks.workerInstance.postMessage).toHaveBeenCalledWith(expect.objectContaining({
      topArtistsQty: 5,
      topSongsQtd: 10
    }))

    if (mocks.workerInstance.onmessage) {
        mocks.workerInstance.onmessage({ data: {} } as MessageEvent)
    }

    await promise
  })

  it('should reject promise and terminate worker on error', async () => {
    const mockData = [] as SpotifyModel[]
    const expectedError = new Error('Worker processing failed')

    const promise = processSpotifyData(mockData, 5, 10, 30, 'UTC')

    if (mocks.workerInstance.onerror) {
      mocks.workerInstance.onerror(expectedError as unknown as ErrorEvent)
    }

    await expect(promise).rejects.toThrow('Worker processing failed')
    expect(mocks.workerInstance.terminate).toHaveBeenCalled()
  })
})