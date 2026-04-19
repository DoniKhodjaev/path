import { useMemo, useState, useEffect } from 'react'
import { Coordinates, PrayerTimes, CalculationMethod, Prayer } from 'adhan'
import { useStore } from '../store/useStore'
import { formatTime } from '../utils/dates'
import type { PrayerName } from '../types'

interface PrayerInfo {
  name: PrayerName
  label: string
  time: Date
  timeStr: string
  isActive: boolean
  isNext: boolean
}

interface PrayerData {
  prayers: PrayerInfo[]
  nextPrayer: PrayerInfo | null
  countdown: string
}

const PRAYER_MAP: { prayer: Prayer; name: PrayerName; label: string }[] = [
  { prayer: Prayer.Fajr, name: 'fajr', label: 'Фаджр' },
  { prayer: Prayer.Dhuhr, name: 'dhuhr', label: 'Зухр' },
  { prayer: Prayer.Asr, name: 'asr', label: 'Аср' },
  { prayer: Prayer.Maghrib, name: 'maghrib', label: 'Магриб' },
  { prayer: Prayer.Isha, name: 'isha', label: 'Иша' },
]

function getMethodParams(method: string) {
  switch (method) {
    case 'Egyptian': return CalculationMethod.Egyptian()
    case 'Karachi': return CalculationMethod.Karachi()
    case 'Tehran': return CalculationMethod.Tehran()
    case 'MoonsightingCommittee': return CalculationMethod.MoonsightingCommittee()
    default: return CalculationMethod.MuslimWorldLeague()
  }
}

export function usePrayers(): PrayerData {
  const { lat, lon, calculationMethod } = useStore()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(interval)
  }, [])

  return useMemo(() => {
    const coords = new Coordinates(lat, lon)
    const params = getMethodParams(calculationMethod)
    const pt = new PrayerTimes(coords, now, params)

    const currentPrayer = pt.currentPrayer()
    const nextPrayerEnum = pt.nextPrayer()

    const prayers: PrayerInfo[] = PRAYER_MAP.map(({ prayer, name, label }) => {
      const time = pt.timeForPrayer(prayer)!
      return {
        name,
        label,
        time,
        timeStr: formatTime(time),
        isActive: currentPrayer === prayer,
        isNext: nextPrayerEnum === prayer,
      }
    })

    const nextPrayer = prayers.find(p => p.isNext) || null

    let countdown = ''
    if (nextPrayer) {
      const diff = nextPrayer.time.getTime() - now.getTime()
      if (diff > 0) {
        const h = Math.floor(diff / 3_600_000)
        const m = Math.floor((diff % 3_600_000) / 60_000)
        countdown = h > 0 ? `${h}ч ${m}м` : `${m}м`
      }
    }

    return { prayers, nextPrayer, countdown }
  }, [lat, lon, calculationMethod, now])
}
