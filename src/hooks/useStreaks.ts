import { useCallback } from 'react'
import { useStore } from '../store/useStore'
import { HABITS } from '../utils/constants'

export function useStreaks() {
  const { days, streaks, updateStreak } = useStore()

  const recalculateStreaks = useCallback((date: string) => {
    const day = days[date]
    if (!day) return

    const categories = ['islam', 'health', 'development', 'finance', 'work'] as const
    for (const cat of categories) {
      const catHabits = HABITS.filter(h => h.category === cat && !h.isPrayer)
      const prayerHabits = HABITS.filter(h => h.category === cat && h.isPrayer)
      const allDone =
        catHabits.every(h => day.habits[h.id]) &&
        prayerHabits.every(h => day.prayers[h.id])
      if (allDone && (catHabits.length + prayerHabits.length) > 0) {
        updateStreak(cat, date)
      }
    }

    const total = HABITS.length
    const doneCount =
      HABITS.filter(h => h.isPrayer ? day.prayers[h.id] : day.habits[h.id]).length
    if (doneCount / total >= 0.8) {
      updateStreak('main', date)
    }

    if (day.prayers.fajr) {
      updateStreak('fajr', date)
    }
  }, [days, updateStreak])

  const getMainStreak = useCallback((): number => {
    return streaks.main?.current ?? 0
  }, [streaks])

  const getCategoryStreak = useCallback((category: string): number => {
    return streaks[category]?.current ?? 0
  }, [streaks])

  return { recalculateStreaks, getMainStreak, getCategoryStreak, streaks }
}
