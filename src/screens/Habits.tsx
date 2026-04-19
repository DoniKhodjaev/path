import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { HabitItem } from '../components/HabitItem'
import { StreakGrid } from '../components/StreakGrid'
import { useGamification } from '../hooks/useGamification'
import { useStreaks } from '../hooks/useStreaks'
import { HABITS, CATEGORY_LABELS } from '../utils/constants'
import { todayStr, getLast7Days } from '../utils/dates'
import { staggerContainer, staggerItem, easeApple } from '../utils/motion'

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

  // Progress calculation
  const totalHabits = HABITS.length
  const doneCount = HABITS.filter(h =>
    h.isPrayer ? dayRecord?.prayers[h.id] : dayRecord?.habits[h.id]
  ).length
  const progressPct = totalHabits > 0 ? (doneCount / totalHabits) * 100 : 0

  return (
    <motion.div
      className="p-4 pb-24 space-y-6 ambient-mesh min-h-screen"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Header */}
      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.35, ease: easeApple }}
        className="pt-2 space-y-3"
      >
        <h1 className="text-h1 text-gold">Привычки сегодня</h1>

        <div className="space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-sm text-gold tabular-nums">
              {doneCount} из {totalHabits}
            </span>
            {doneCount === totalHabits && totalHabits > 0 && (
              <span className="text-micro text-sacred">все выполнены</span>
            )}
          </div>
          {/* Progress bar */}
          <div className="h-[3px] w-full bg-dusk rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.6, ease: easeApple }}
            />
          </div>
        </div>
      </motion.div>

      {/* Streak card */}
      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.35, ease: easeApple }}
        className="bg-dusk rounded-2xl p-5 glow-soft"
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-micro text-ink-mute mb-1">Дней без пропусков</p>
            <p className="text-h1 text-gold tabular-nums">{mainStreak}</p>
          </div>
          <span className="text-2xl leading-none mt-1" aria-hidden="true">🔥</span>
        </div>
        <StreakGrid days={streakGridData} />
      </motion.div>

      {/* Category sections */}
      {Array.from(categories.entries()).map(([category, habits]) => {
        const catStreak = getCategoryStreak(category)
        return (
          <motion.div
            key={category}
            variants={staggerItem}
            transition={{ duration: 0.35, ease: easeApple }}
            className="space-y-2"
          >
            {/* Category divider with ornament style */}
            <div className="separator-ornament">
              <span className="text-micro text-gold/60 px-2">
                {CATEGORY_LABELS[category] || category}
              </span>
              {catStreak > 0 && (
                <span className="text-micro text-gold/40 tabular-nums pr-1">
                  🔥 {catStreak}
                </span>
              )}
            </div>

            {/* Habit cards */}
            <div className="bg-twilight rounded-xl border border-dusk divide-y divide-dusk overflow-hidden">
              {habits.map((h) => (
                <HabitItem
                  key={h.id}
                  label={h.label}
                  checked={
                    h.isPrayer
                      ? dayRecord?.prayers[h.id] ?? false
                      : dayRecord?.habits[h.id] ?? false
                  }
                  onToggle={() => handleToggle(h)}
                />
              ))}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
