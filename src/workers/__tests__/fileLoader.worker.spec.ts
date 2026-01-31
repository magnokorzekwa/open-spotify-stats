import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('fileLoader.worker.ts', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    global.self = {
      postMessage: vi.fn(),
      onmessage: null
    } as any
  })

  const runWorker = async (files: any[]) => {
    await import('@/workers/fileLoader.worker')
    if (self.onmessage) {
      const event = { data: files } as MessageEvent
      // @ts-ignore
      await self.onmessage(event)
    }
  }

  it('should read multiple files, merge them, and sort by timestamp', async () => {
    const file1Content = JSON.stringify([
      { ts: '1704067200000', master_metadata_track_name: 'Song B' }, // Newer
    ])
    const file2Content = JSON.stringify([
      { ts: '1672531200000', master_metadata_track_name: 'Song A' }, // Older
    ])

    const mockFiles = [
      { text: vi.fn().mockResolvedValue(file1Content) },
      { text: vi.fn().mockResolvedValue(file2Content) }
    ]

    await runWorker(mockFiles)

    expect(self.postMessage).toHaveBeenCalledTimes(1)
    const result = (self.postMessage as any).mock.calls[0][0]

    expect(result).toHaveLength(2)
    expect(result[0].master_metadata_track_name).toBe('Song A')
    expect(result[1].master_metadata_track_name).toBe('Song B')
  })

  it('should return an error message if JSON parsing fails', async () => {
    const invalidContent = 'invalid json'
    const mockFiles = [
      { text: vi.fn().mockResolvedValue(invalidContent) }
    ]

    await runWorker(mockFiles)

    expect(self.postMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.any(String)
      })
    )
  })

  it('should handle empty file lists gracefully', async () => {
    await runWorker([])

    expect(self.postMessage).toHaveBeenCalledWith([])
  })

  it('should handle large amounts of records correctly', async () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => ({
      ts: (2000 - i).toString(),
      track: `Track ${i}`
    }))

    const mockFiles = [
      { text: vi.fn().mockResolvedValue(JSON.stringify(largeData)) }
    ]

    await runWorker(mockFiles)

    const result = (self.postMessage as any).mock.calls[0][0]
    expect(result).toHaveLength(1000)
    expect(result[0].ts).toBe('1001')
  })
})