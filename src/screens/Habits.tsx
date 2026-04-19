import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useGamification } from '../hooks/useGamification'
import { useStreaks } from '../hooks/useStreaks'
import { usePrayers } from '../hooks/usePrayers'
import { HABITS, CATEGORY_LABELS } from '../utils/constants'
import { todayStr, getLast7Days } from '../utils/dates'
import { staggerContainer, staggerItem, easeApple } from '../utils/motion'

const CATEGORY_SECTION_COLORS: Record<string, { label: string; line: string }> = {
  islam: { label: 'rgba(76,175,130,0.7)', line: 'rgba(76,175,130,0.15)' },
  health: { label: 'rgba(90,154,224,0.7)', line: 'rgba(90,154,224,0.15)' },
  development: { label: 'rgba(201,168,76,0.7)', line: 'rgba(201,168,76,0.15)' },
  work: { label: 'rgba(232,201,106,0.6)', line: 'rgba(232,201,106,0.12)' },
  finance: { label: 'rgba(201,168,76,0.7)', line: 'rgba(201,168,76,0.15)' },
}

const CHECKBOX_COLORS: Record<string, string> = {
  islam: '#4caf82',
  health: '#5a9ae0',
  development: '#c9a84c',
  finance: '#c9a84c',
  work: 'rgba(255,255,255,0.25)',
}

const DAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

export function Habits() {
  const store = useStore()
  const { awardPoints, checkAndAwardBadges } = useGamification()
  const { recalculateStreaks, getCategoryStreak, getMainStreak } = useStreaks()
  const { prayers: prayerInfos } = usePrayers()
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
  const mainStreak = getMainStreak()

  // Progress
  const totalHabits = HABITS.length
  const doneCount = HABITS.filter(h =>
    h.isPrayer ? dayRecord?.prayers[h.id] : dayRecord?.habits[h.id]
  ).length
  const progressPct = totalHabits > 0 ? (doneCount / totalHabits) * 100 : 0

  // Format header date
  const monthNames = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
  const now = new Date()
  const headerDate = `${now.getDate()} ${monthNames[now.getMonth()]}`

  // Active prayer lookup
  const activePrayerId = useMemo(() => {
    const active = prayerInfos.find(p => p.isActive)
    return active ? active.name : null
  }, [prayerInfos])

  // Week dots data
  const weekData = useMemo(() => {
    return last7.map(dateStr => {
      const d = new Date(dateStr)
      // getDay: 0=Sun, we need Mon=0
      const dayIdx = (d.getDay() + 6) % 7
      const label = DAY_LABELS[dayIdx]
      const isToday = dateStr === today
      const rec = store.days[dateStr]

      let status: 'today' | 'good' | 'bad' | 'neutral' = 'neutral'
      if (isToday) {
        status = 'today'
      } else if (rec) {
        const done = HABITS.filter(h => h.isPrayer ? rec.prayers[h.id] : rec.habits[h.id]).length
        const ratio = done / HABITS.length
        if (ratio >= 0.8) status = 'good'
        else if (ratio < 0.3 && done > 0) status = 'bad'
        else if (done > 0) status = 'neutral'
      }

      return { label, status, isToday }
    })
  }, [last7, today, store.days])

  return (
    <motion.div
      style={{ padding: '16px 16px 96px', minHeight: '100vh' }}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* Status bar header */}
      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.35, ease: easeApple }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          paddingTop: 8,
        }}
      >
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          letterSpacing: 2,
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
        }}>
          ПРИВЫЧКИ · {headerDate}
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace',
          fontSize: 10,
          letterSpacing: 2,
          color: '#e8913a',
        }}>
          🔥 {mainStreak} ДНЕЙ
        </span>
      </motion.div>

      {/* Title */}
      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.35, ease: easeApple }}
        style={{ marginBottom: 20 }}
      >
        <h1 style={{
          fontFamily: 'Cormorant, serif',
          fontWeight: 300,
          fontSize: 40,
          lineHeight: 1.1,
          color: '#ffffff',
          margin: 0,
        }}>
          Привычки{'\n'}
          <span style={{ color: '#e8c96a', fontStyle: 'italic' }}>сегодня</span>
        </h1>
      </motion.div>

      {/* Counter row */}
      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.35, ease: easeApple }}
        style={{ marginBottom: 8 }}
      >
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 6 }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontWeight: 300,
            fontSize: 36,
            color: '#e8c96a',
          }}>
            {doneCount}
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
            marginLeft: 6,
          }}>
            из {totalHabits}
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 14,
            color: 'rgba(255,255,255,0.4)',
            marginLeft: 'auto',
          }}>
            {Math.round(progressPct)}%
          </span>
        </div>
        {/* Progress bar */}
        <div style={{
          height: 2,
          width: '100%',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: 1,
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              background: '#e8c96a',
              borderRadius: 1,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: easeApple }}
          />
        </div>
      </motion.div>

      {/* Week dots row */}
      <motion.div
        variants={staggerItem}
        transition={{ duration: 0.35, ease: easeApple }}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 40,
          marginTop: 20,
        }}
      >
        {weekData.map((day, i) => {
          let dotBg: string
          let dotShadow: string | undefined
          if (day.status === 'today') {
            dotBg = '#e8c96a'
            dotShadow = '0 0 8px rgba(232,201,106,0.5)'
          } else if (day.status === 'good') {
            dotBg = '#4caf82'
          } else if (day.status === 'bad') {
            dotBg = 'rgba(224,90,90,0.5)'
          } else {
            dotBg = 'rgba(76,175,130,0.4)'
          }

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                color: 'rgba(255,255,255,0.3)',
                letterSpacing: 1,
              }}>
                {day.label}
              </span>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: dotBg,
                boxShadow: dotShadow,
              }} />
            </div>
          )
        })}
      </motion.div>

      {/* Category sections */}
      {Array.from(categories.entries()).map(([category, habits]) => {
        const colors = CATEGORY_SECTION_COLORS[category] || CATEGORY_SECTION_COLORS.work
        const checkColor = CHECKBOX_COLORS[category] || CHECKBOX_COLORS.work
        const catDoneCount = habits.filter(h =>
          h.isPrayer ? dayRecord?.prayers[h.id] : dayRecord?.habits[h.id]
        ).length

        return (
          <motion.div
            key={category}
            variants={staggerItem}
            transition={{ duration: 0.35, ease: easeApple }}
            style={{ marginBottom: 24 }}
          >
            {/* Category divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 4,
            }}>
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                letterSpacing: 3,
                color: colors.label,
                textTransform: 'uppercase',
                whiteSpace: 'nowrap',
              }}>
                {(CATEGORY_LABELS[category] || category).toUpperCase()}
              </span>
              <div style={{
                flex: 1,
                height: 1,
                background: colors.line,
              }} />
              <span style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 9,
                letterSpacing: 1,
                color: colors.label,
                whiteSpace: 'nowrap',
              }}>
                {catDoneCount}/{habits.length}
              </span>
            </div>

            {/* Habit rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {habits.map(h => {
                const checked = h.isPrayer
                  ? dayRecord?.prayers[h.id] ?? false
                  : dayRecord?.habits[h.id] ?? false

                const isActivePrayer = h.isPrayer && activePrayerId === h.id

                // Prayer time string for metadata
                const prayerInfo = h.isPrayer
                  ? prayerInfos.find(p => p.name === h.id)
                  : null

                return (
                  <motion.div
                    key={h.id}
                    onClick={() => handleToggle(h)}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 14,
                      padding: '14px 4px',
                      cursor: 'pointer',
                      userSelect: 'none',
                      borderRadius: isActivePrayer ? 8 : 0,
                      background: isActivePrayer ? 'rgba(201,168,76,0.04)' : 'transparent',
                      opacity: checked ? 0.45 : 1,
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: checked
                        ? 'none'
                        : isActivePrayer
                          ? `1.5px solid #c9a84c`
                          : '1.5px solid rgba(255,255,255,0.18)',
                      background: checked ? checkColor : 'transparent',
                    }}>
                      {checked && (
                        <span style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: '#0a0f1e',
                          lineHeight: 1,
                        }}>
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Label */}
                    <span style={{
                      fontSize: 14,
                      color: '#ffffff',
                      textDecoration: checked ? 'line-through' : 'none',
                      flex: 1,
                    }}>
                      {h.label}
                    </span>

                    {/* Right-side metadata */}
                    {isActivePrayer && !checked && (
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        color: '#c9a84c',
                        letterSpacing: 1,
                      }}>
                        сейчас
                      </span>
                    )}
                    {prayerInfo && !isActivePrayer && (
                      <span style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 10,
                        color: 'rgba(255,255,255,0.25)',
                      }}>
                        {prayerInfo.timeStr}
                      </span>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
