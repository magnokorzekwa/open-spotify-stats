/// <reference lib="webworker" />

import type { HeatmapSeries, WeekDay } from "@/types/DataManipulation"

function getDaysOfYear(year: number) {
    const start = new Date(year, 0, 1)
    const end = new Date(year, 11, 31)
    const days: Date[] = []
    const current = new Date(start)

    while (current <= end) {
        days.push(new Date(current))
        current.setDate(current.getDate() + 1)
    }

    return days
}

function getWeekNumber(date: Date) {
    const firstDay = new Date(date.getFullYear(), 0, 1)
    const pastDays = Math.floor((date.getTime() - firstDay.getTime()) / 86400000)
    return Math.ceil((pastDays + firstDay.getDay() + 1) / 7)
}

self.onmessage = (e: MessageEvent) => {
    const { year, streams } = e.data as {
        year: number
        streams: string[]
    }

    const weekSeries: Record<WeekDay, HeatmapSeries> = {
        0: { name: 'Dom', data: [] },
        1: { name: 'Seg', data: [] },
        2: { name: 'Ter', data: [] },
        3: { name: 'Qua', data: [] },
        4: { name: 'Qui', data: [] },
        5: { name: 'Sex', data: [] },
        6: { name: 'Sab', data: [] }
    }

    getDaysOfYear(year).forEach(date => {
        const dayIndex = date.getDay() as WeekDay;
        const week = getWeekNumber(date);
        const countDays = streams.map(stream => new Date(stream))
            .filter(date => dayIndex === date.getDay()
                && getWeekNumber(date) == week).length;

        weekSeries[dayIndex].data.push({
            x: `${week}ª semana do ano.`,
            y: countDays
        })
    })

    postMessage(Object.values(weekSeries))
}
