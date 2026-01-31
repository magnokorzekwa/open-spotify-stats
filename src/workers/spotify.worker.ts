/// <reference lib="webworker" />

import type SpotifyModel from '@/models/SpotifyModel'
import type { MostSkipped, TopArtist, TopSongs } from '@/types/DataManipulation'

type WorkerInput = {
  data: SpotifyModel[]
  topArtistsQty: number
  topSongsQtd: number
  minStreamDuration: number
  timezone: string
}

type WorkerOutput = {
  actionsPerYear: [string, SpotifyModel[]][]
  artistsMostListened: Record<string, TopArtist[]>
  songsMostListened: Record<string, TopSongs[]>
  latestYear: string
  mostSkipped: Record<string, MostSkipped>
  mostUsedPlatform: Record<string, string>
  listeningPeriod: Record<string, string>
  hoursMostListened: Record<string, number[]>
}

type YearBucket = {
  valid: SpotifyModel[]
  skipped: SpotifyModel[]
}

function getYearFromTs(ts: string, formatter: Intl.DateTimeFormat): string {
  return formatter.format(new Date(ts))
}

function getHourFromTs(ts: string, formatter: Intl.DateTimeFormat): number {
  const hourStr = formatter.format(new Date(ts))
  return parseInt(hourStr, 10)
}

function groupDataByYear(
  data: SpotifyModel[], 
  thresholdMs: number, 
  yearFormatter: Intl.DateTimeFormat
): Map<string, YearBucket> {
  const grouped = new Map<string, YearBucket>()

  for (let i = 0; i < data.length; i++) {
    const entry = data[i] as SpotifyModel
    if (!entry.ts) continue

    const year = getYearFromTs(entry.ts, yearFormatter)
    
    let bucket = grouped.get(year)
    if (!bucket) {
      bucket = { valid: [], skipped: [] }
      grouped.set(year, bucket)
    }

    if (entry.ms_played >= thresholdMs) {
      bucket.valid.push(entry)
    } else {
      bucket.skipped.push(entry)
    }
  }

  return grouped
}

function getMostListenedArtists(data: SpotifyModel[], qtd: number): TopArtist[] {
  const artistCount = new Map<string, number>()

  for (const entry of data) {
    const artist = entry.master_metadata_album_artist_name
    if (artist) {
      artistCount.set(artist, (artistCount.get(artist) ?? 0) + 1)
    }
  }

  return Array.from(artistCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, qtd)
    .map(([artist, timesPlayed]) => ({ artist, timesPlayed }))
}

function getMostListenedSongs(data: SpotifyModel[], qtd: number): TopSongs[] {
  const map = new Map<string, TopSongs>()

  for (const entry of data) {
    const track = entry.master_metadata_track_name
    const artist = entry.master_metadata_album_artist_name

    if (!track || !artist) continue

    const key = `${artist}::${track}`
    const existing = map.get(key)

    if (existing) {
      existing.timesPlayed++
    } else {
      map.set(key, { artist, title: track, timesPlayed: 1 })
    }
  }

  return Array.from(map.values())
    .sort((a, b) => b.timesPlayed - a.timesPlayed)
    .slice(0, qtd)
}

function getMostSkipped(data: SpotifyModel[]): MostSkipped {
  const skipCount = new Map<string, number>()

  for (const item of data) {
    if (!item.skipped && item.reason_end !== 'fwdbtn') continue

    const track = item.master_metadata_track_name
    const artist = item.master_metadata_album_artist_name

    if (!track || !artist) continue

    const key = `${artist} — ${track}`
    skipCount.set(key, (skipCount.get(key) ?? 0) + 1)
  }

  let maxKey = ''
  let maxCount = 0

  for (const [key, count] of skipCount) {
    if (count > maxCount) {
      maxCount = count
      maxKey = key
    }
  }

  const [mostSkippedArtist, mostSkippedTrack] = maxKey.split(' — ')

  return {
    mostSkippedTrack: mostSkippedTrack ?? '',
    mostSkippedArtist: mostSkippedArtist ?? '',
    mostSkippedCount: maxCount
  }
}

function getListeningPeriod(
  data: SpotifyModel[], 
  thresholdMs: number, 
  hourFormatter: Intl.DateTimeFormat
): string {
  const periods = { morning: 0, afternoon: 0, night: 0 }

  for (const item of data) {
    if (!item.ts) continue
    
    if (item.ms_played < thresholdMs) continue

    const hour = getHourFromTs(item.ts, hourFormatter)

    if (hour >= 5 && hour < 12) periods.morning += item.ms_played
    else if (hour >= 12 && hour < 18) periods.afternoon += item.ms_played
    else periods.night += item.ms_played
  }

  if (periods.afternoon > periods.morning && periods.afternoon > periods.night) return 'afternoon'
  if (periods.night > periods.morning && periods.night > periods.afternoon) return 'night'
  return 'morning'
}

function normalizePlatform(platform: string): string {
  const p = platform.toLowerCase()
  if (p.includes('android') || p.includes('ios') || p.includes('iphone')) return 'mobile'
  if (p.includes('windows') || p.includes('mac') || p.includes('linux')) return 'desktop'
  if (p.includes('web')) return 'web'
  if (p.includes('tv') || p.includes('cast')) return 'tv'
  return 'other'
}

function getMostUsedPlatform(data: SpotifyModel[]): string {
  const platformCount = new Map<string, number>()

  for (const item of data) {
    if (!item.platform) continue
    const normalized = normalizePlatform(item.platform)
    platformCount.set(normalized, (platformCount.get(normalized) ?? 0) + 1)
  }

  let maxPlatform = ''
  let maxCount = 0

  for (const [platform, count] of platformCount) {
    if (count > maxCount) {
      maxCount = count
      maxPlatform = platform
    }
  }

  return maxPlatform
}

function getHoursListened(data: SpotifyModel[], hourFormatter: Intl.DateTimeFormat): number[] {
  const hours = new Array(24).fill(0)

  for (const item of data) {
    if (!item.ts) continue
    
    const hour = getHourFromTs(item.ts, hourFormatter)
    
    if (hour >= 0 && hour < 24) {
      hours[hour]++
    }
  }

  return hours
}

self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const { data, topArtistsQty, topSongsQtd, minStreamDuration, timezone } = event.data
  
  const thresholdMs = minStreamDuration * 1000
  const validTimezone = timezone || 'UTC'

  const yearFormatter = new Intl.DateTimeFormat('en-GB', { 
    timeZone: validTimezone, 
    year: 'numeric' 
  })

  const hourFormatter = new Intl.DateTimeFormat('en-GB', { 
    timeZone: validTimezone, 
    hour: 'numeric', 
    hour12: false 
  })

  const groupedData = groupDataByYear(data, thresholdMs, yearFormatter)

  const output: WorkerOutput = {
    actionsPerYear: [],
    artistsMostListened: {},
    songsMostListened: {},
    mostSkipped: {},
    listeningPeriod: {},
    mostUsedPlatform: {},
    hoursMostListened: {},
    latestYear: '0'
  }

  let maxYear = 0

  for (const [year, bucket] of groupedData) {
    const yearNum = parseInt(year, 10)
    if (yearNum > maxYear) maxYear = yearNum

    output.actionsPerYear.push([year, bucket.valid])

    output.artistsMostListened[year] = getMostListenedArtists(bucket.valid, topArtistsQty)
    output.songsMostListened[year] = getMostListenedSongs(bucket.valid, topSongsQtd)
    output.listeningPeriod[year] = getListeningPeriod(bucket.valid, thresholdMs, hourFormatter)
    output.mostUsedPlatform[year] = getMostUsedPlatform(bucket.valid)
    output.hoursMostListened[year] = getHoursListened(bucket.valid, hourFormatter)
    output.mostSkipped[year] = getMostSkipped(bucket.skipped)
  }

  output.latestYear = maxYear.toString()
  output.actionsPerYear.sort((a, b) => b[0].localeCompare(a[0]))

  self.postMessage(output)
}