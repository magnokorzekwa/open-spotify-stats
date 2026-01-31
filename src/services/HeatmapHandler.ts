import type SpotifyModel from '@/models/SpotifyModel';
import type { HeatmapSeries } from '@/types/DataManipulation';
import CalendarHeatmapWorker from '@/workers/calendarHeatmap.worker?worker';

export type CalendarHeatmapResult = {
    weekSeries: HeatmapSeries[]
}

export function processCalendarData(year: number, streams: SpotifyModel[]): Promise<CalendarHeatmapResult> {
    return new Promise((resolve, reject) => {
        const worker = new CalendarHeatmapWorker();

        worker.postMessage({
            year: year,
            streams: streams.map(stream => new Date(stream.ts)),
        });

        worker.onmessage = (event) => {
            resolve({weekSeries: event.data});
            worker.terminate();
        }

        worker.onerror = (err) => {
            reject(err);
            worker.terminate();
        }
    })
}