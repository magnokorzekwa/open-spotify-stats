import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processFileReading } from '@/services/FileReader';

const mocks = vi.hoisted(() => ({
    workerInstance: {
        postMessage: vi.fn(),
        terminate: vi.fn(),
        onmessage: null as ((e: MessageEvent) => void) | null,
        onerror: null as ((e: ErrorEvent) => void) | null,
    }
}));

vi.mock('@/workers/fileLoader.worker?worker', () => ({
    default: vi.fn(function() {
        return mocks.workerInstance;
    }),
}));

describe('FileReader Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mocks.workerInstance.onmessage = null;
        mocks.workerInstance.onerror = null;
    });

    it('should resolve the promise with data when worker processes files successfully', async () => {
        const mockFile = new File(['{"content": "test"}'], 'test.json', { type: 'application/json' });
        const mockFileList = [mockFile] as unknown as FileList;
        const expectedData = { content: 'test' };

        const promise = processFileReading(mockFileList);

        expect(mocks.workerInstance.postMessage).toHaveBeenCalledWith([mockFile]);

        if (mocks.workerInstance.onmessage) {
            mocks.workerInstance.onmessage({ data: expectedData } as MessageEvent);
        }

        const result = await promise;

        expect(result).toEqual(expectedData);
        expect(mocks.workerInstance.terminate).toHaveBeenCalled();
    });

    it('should reject the promise when worker encounters an error', async () => {
        const mockFile = new File(['error'], 'error.json');
        const mockFileList = [mockFile] as unknown as FileList;
        const expectedError = new Error('Worker error');

        const promise = processFileReading(mockFileList);

        if (mocks.workerInstance.onerror) {
            mocks.workerInstance.onerror(expectedError as unknown as ErrorEvent);
        }

        await expect(promise).rejects.toThrow('Worker error');
        expect(mocks.workerInstance.terminate).toHaveBeenCalled();
    });
});