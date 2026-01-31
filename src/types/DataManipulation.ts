export type YearData = {
    year: string
    total: number
}

export type TopArtist = {
    artist: string,
    timesPlayed: number,
}

export type TopSongs = {
    artist: string,
    title: string,
    timesPlayed: number,
}

export type FunStats = {
    mostSkipped: MostSkipped,
    timeOfTheDay: string,
    mostUsedPlatform: string
}

export type MostSkipped = {
    mostSkippedArtist: string,
    mostSkippedTrack: string,
    mostSkippedCount: number,
}

export type HeatmapPoint = {
    x: string
    y: number
}

export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type HeatmapSeries = {
    name: string
    data: HeatmapPoint[]
}
