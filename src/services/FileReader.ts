import FileLoaderWorker from '@/workers/fileLoader.worker?worker';

export function processFileReading<T>(fileList: FileList): Promise<T> {
    return new Promise((resolve, reject) => {
        const worker = new FileLoaderWorker();
        const files: File[] = Array.from(fileList);
        
        worker.postMessage(files);
        worker.onmessage = (event) => {
            resolve(event.data);
            worker.terminate();
        }
        worker.onerror = (err) => {
            reject(err);
            worker.terminate();
        }
    })
}