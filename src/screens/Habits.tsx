import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { HabitItem } from '../components/HabitItem'
import { StreakGrid } from '../components/StreakGrid'
import { useGamification } from '../hooks/useGamification'
import { useStreaks } from '../hooks/useStreaks'
import { HABITS, CATEGORY_LABELS } from '../utils/constants'
import { todayStr, getLast7Days } from '../utils/dates'

export function Habits() {
  const store = useStore()
  const { awardPoints, checkAndAwardBadges } = useGamification()
  const { recalculateStreaks, getCategoryStreak, getMainStreak } = useStreaks()
  const today = todayStr()
  const dayRecord = store.days[today]

  const categories = useMemo(() => {
    const cats = new Map<string, typeof HABITS>()
    for (const h of HABITS) {
      const list = cats.get(h.category) || []
      list.push(h)
      cats.set(h.category, list)
    }
    return cats
  }, [])

  const handleToggle = (habit: typeof HABITS[0]) => {
    const wasDone = habit.isPrayer
      ? dayRecord?.prayers[habit.id]
      : dayRecord?.habits[habit.id]

    if (habit.isPrayer) {
      store.togglePrayer(today, habit.id)
    } else {
      store.toggleHabit(today, habit.id)
    }

    if (!wasDone) {
      awardPoints(10)
      setTimeout(() => {
        const updated = useStore.getState().days[today]
        if (updated) {
          const allDone = HABITS.every(h =>
            h.isPrayer ? updated.prayers[h.id] : updated.habits[h.id]
          )
          if (allDone) awardPoints(50)
          recalculateStreaks(today)
          checkAndAwardBadges()
        }
      }, 100)
    }
  }

  const last7 = getLast7Days()
  const streakGridData: Record<string, boolean> = {}
  for (const date of last7) {
    const d = store.days[date]
    if (d) {
      const total = HABITS.length
      const done = HABITS.filter(h => h.isPrayer ? d.prayers[h.id] : d.habits[h.id]).length
      streakGridData[date] = done / total >= 0.8
    }
  }

  const mainStreak = getMainStreak()

  return (
    <div className="p-4 pb-20 space-y-6">
      <h1 className="font-heading text-2xl text-gold">Привычки</h1>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="font-mono text-sm text-txt">Дней без пропусков</p>
            <p className="font-heading text-3xl text-gold mt-1">🔥 {mainStreak}</p>
          </div>
        </div>
        <StreakGrid days={streakGridData} />
      </div>

      {Array.from(categories.entries()).map(([category, habits]) => (
        <div key={category}>
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-heading text-base text-txt/80">{CATEGORY_LABELS[category] || category}</h2>
            <span className="font-mono text-xs text-gold/60">🔥 {getCategoryStreak(category)}</span>
          </div>
          <div className="bg-navy-2 rounded-xl border border-navy-3 divide-y divide-navy-3">
            {habits.map((h) => (
              <HabitItem key={h.id} label={h.label}
                checked={h.isPrayer ? dayRecord?.prayers[h.id] ?? false : dayRecord?.habits[h.id] ?? false}
                onToggle={() => handleToggle(h)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
