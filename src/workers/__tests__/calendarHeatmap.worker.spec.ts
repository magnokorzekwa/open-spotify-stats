import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('calendarHeatmap.worker.ts', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    const mockPostMessage = vi.fn()
    global.self = {
      postMessage: mockPostMessage,
      onmessage: null
    } as any
    global.postMessage = mockPostMessage
  })

  const runWorker = async (year: number, streams: string[]) => {
    await import('@/workers/calendarHeatmap.worker')
    if (self.onmessage) {
      const event = { data: { year, streams } } as MessageEvent
      // @ts-ignore
      self.onmessage(event)
    }
  }

  it('should generate a full year heatmap series with 7 rows (days of the week)', async () => {
    await runWorker(2023, [])

    expect(self.postMessage).toHaveBeenCalledTimes(1)
    const result = (self.postMessage as any).mock.calls[0][0]

    expect(result).toHaveLength(7)
    expect(result[0].name).toBe('Dom')
    expect(result[1].name).toBe('Seg')
    expect(result[0].data.length).toBeGreaterThanOrEqual(52)
  })

  it('should correctly count streams occurring on specific dates', async () => {
    const streams = [
      '2023-01-01T10:00:00Z',
      '2023-01-01T15:00:00Z',
      '2023-01-02T10:00:00Z'
    ]

    await runWorker(2023, streams)

    const result = (self.postMessage as any).mock.calls[0][0]

    const sundayWeek1 = result[0].data.find((d: any) => d.x.includes('1ª semana'))
    expect(sundayWeek1.y).toBe(2)

    const mondayWeek1 = result[1].data.find((d: any) => d.x.includes('1ª semana'))
    expect(mondayWeek1.y).toBe(1)
  })

  it('should format the x-axis label correctly', async () => {
    await runWorker(2023, [])

    const result = (self.postMessage as any).mock.calls[0][0]
    expect(result[0].data[0].x).toMatch(/\d+ª semana do ano\./)
  })

  it('should handle leap years correctly (e.g., 2024)', async () => {
    const leapDayStream = ['2024-02-29T12:00:00Z']
    
    await runWorker(2024, leapDayStream)

    const result = (self.postMessage as any).mock.calls[0][0]
    const thursdaySeries = result[4]
    const leapDayPoint = thursdaySeries.data.find((d: any) => d.y === 1)
    
    expect(leapDayPoint).toBeDefined()
  })
})