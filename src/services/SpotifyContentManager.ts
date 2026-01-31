import type SpotifyModel from '@/models/SpotifyModel'
import type { MostSkipped, TopArtist, TopSongs } from '@/types/DataManipulation'
import SpotifyWorker from '@/workers/spotify.worker?worker'

export type SpotifyWorkerResult = {
  actionsPerYear: [string, SpotifyModel[]][]
  artistsMostListened: Record<string, TopArtist[]>,
  songsMostListened: Record<string, TopSongs[]>,
  latestYear: string,
  mostSkipped: Record<string, MostSkipped>,
  mostUsedPlatform: Record<string, string>,
  listeningPeriod: Record<string, string>,
  hoursMostListened: Record<string, number[]>,
}

export function processSpotifyData(
  data: SpotifyModel[],
  topArtistsQty = 5,
  topSongsQtd = 10,
  minStreamDuration: number,
  userTimezone: string,
): Promise<SpotifyWorkerResult> {
  return new Promise((resolve, reject) => {
    const worker = new SpotifyWorker()

    worker.postMessage({
      data,
      topArtistsQty,
      topSongsQtd,
      minStreamDuration,
      timezone: userTimezone
    })

    worker.onmessage = (event) => {
      resolve(event.data)
      worker.terminate()
    }

    worker.onerror = (err) => {
      reject(err)
      worker.terminate()
    }
  })
}

