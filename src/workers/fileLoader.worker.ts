/// <reference lib="webworker" />

import type SpotifyModel from '@/models/SpotifyModel'

self.onmessage = async (e: MessageEvent<File[]>) => {
    try {
        const files = e.data
        const result: SpotifyModel[] = []

        for (const file of files) {
            const text = await file.text()
            const json = JSON.parse(text) as SpotifyModel[]
            result.push(...json)
        }

        result.sort(
            (a, b) => Number(a.ts) - Number(b.ts)
        )

        self.postMessage(result)
    } catch (err) {
        self.postMessage({ error: (err as Error).message })
    }
}
