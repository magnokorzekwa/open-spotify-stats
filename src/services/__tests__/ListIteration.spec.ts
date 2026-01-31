import { describe, it, expect } from 'vitest'
import { sortSpotifyModelByTs } from '@/services/ListIteration'
import type SpotifyModel from '@/models/SpotifyModel'

describe('ListIteration Service', () => {
  it('sorts spotify models by timestamp in descending order', () => {
    const mockData = [
      { ts: '2025-01-01T10:00:00Z' },
      { ts: '2026-01-01T10:00:00Z' },
      { ts: '2024-01-01T10:00:00Z' }
    ] as SpotifyModel[]

    const sorted = sortSpotifyModelByTs(mockData)

    expect(sorted[0].ts).toBe('2024-01-01T10:00:00Z')
    expect(sorted[2].ts).toBe('2026-01-01T10:00:00Z')
  })
})