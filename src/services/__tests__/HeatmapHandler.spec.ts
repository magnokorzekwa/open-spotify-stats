import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processCalendarData } from '@/services/HeatmapHandler';
import type SpotifyModel from '@/models/SpotifyModel';

const mocks = vi.hoisted(() => ({
    workerInstance: {
        postMessage: vi.fn(),
        terminate: vi.fn(),
        onmessage: null as ((e: MessageEvent) => void) | null,
        onerror: null as ((e: ErrorEvent) => void) | null,
    }
}));

vi.mock('@/workers/calendarHeatmap.worker?worker', () => ({
    default: vi.fn(function() {
        return mocks.workerInstance;
    }),
}));

describe('HeatmapHandler Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.workerInstance.onmessage = null;
        mocks.workerInstance.onerror = null;
    });

    it('should transform data, send to worker, and resolve with weekSeries on success', async () => {
        const year = 2023;
        const streams = [
            { ts: '2023-01-01T10:00:00Z' },
            { ts: '2023-06-15T12:00:00Z' }
        ] as SpotifyModel[];

        const expectedWorkerPayload = {
            year,
            streams: streams.map(s => new Date(s.ts))
        };

        const mockWorkerResponse = [{ name: 'Jan', data: [] }];
        const expectedResult = { weekSeries: mockWorkerResponse };

        const promise = processCalendarData(year, streams);

        expect(mocks.workerInstance.postMessage).toHaveBeenCalledWith(expectedWorkerPayload);

        if (mocks.workerInstance.onmessage) {
            mocks.workerInstance.onmessage({ data: mockWorkerResponse } as MessageEvent);
        }

        const result = await promise;

        expect(result).toEqual(expectedResult);
        expect(mocks.workerInstance.terminate).toHaveBeenCalled();
    });

    it('should reject and terminate worker on error', async () => {
        const year = 2023;
        const streams = [] as SpotifyModel[];
        const expectedError = new Error('Heatmap calculation failed');

        const promise = processCalendarData(year, streams);

        if (mocks.workerInstance.onerror) {
            mocks.workerInstance.onerror(expectedError as unknown as ErrorEvent);
        }

        await expect(promise).rejects.toThrow('Heatmap calculation failed');
        expect(mocks.workerInstance.terminate).toHaveBeenCalled();
    });
});