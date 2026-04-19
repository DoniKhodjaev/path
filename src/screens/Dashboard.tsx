import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { usePrayers } from '../hooks/usePrayers'
import { useStore } from '../store/useStore'
import { formatDateRussian, getPathProgress, todayStr } from '../utils/dates'
import { QUOTES, HABITS } from '../utils/constants'
import { useGamification } from '../hooks/useGamification'
import { getLevelForXp } from '../utils/gamification'
import { hapticTap } from '../utils/haptic'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const } },
}

export function Dashboard() {
  const { prayers, nextPrayer, countdown } = usePrayers()
  const store = useStore()
  const { awardPoints, checkAndAwardBadges } = useGamification()
  const today = todayStr()
  const dayRecord = store.days[today]
  const { percent, daysLeft } = getPathProgress()

  const quoteOfDay = useMemo(() => {
    const dayIndex = new Date().getDate() % QUOTES.length
    return QUOTES[dayIndex]
  }, [])

  // Split quote into text and source
  const { quoteText, quoteSource } = useMemo(() => {
    const match = quoteOfDay.match(/^(«.*?»)\s*—\s*(.+)$/)
    if (match) {
      return { quoteText: match[1], quoteSource: match[2].toUpperCase() }
    }
    return { quoteText: quoteOfDay, quoteSource: 'ХАДИС' }
  }, [quoteOfDay])

  const todayPoints = useMemo(() => {
    if (!dayRecord) return 0
    let pts = 0
    HABITS.forEach(h => {
      if (h.isPrayer ? dayRecord.prayers[h.id] : dayRecord.habits[h.id]) pts += 10
    })
    return pts
  }, [dayRecord])

  const mainStreak = store.streaks.main?.current ?? 0
  const xp = store.xp ?? 0
  const levelInfo = getLevelForXp(xp)

  const handlePrayerToggle = (prayerId: string) => {
    hapticTap()
    const wasDone = dayRecord?.prayers[prayerId]
    store.togglePrayer(today, prayerId)
    if (!wasDone) {
      awardPoints(10)
      const updatedPrayers = { ...(dayRecord?.prayers || {}), [prayerId]: true }
      const allDone = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].every(p => updatedPrayers[p])
      if (allDone) awardPoints(30)
    }
    setTimeout(() => checkAndAwardBadges(), 100)
  }

  const nonPrayerHabits = HABITS.filter(h => !h.isPrayer)
  const totalHabits = nonPrayerHabits.length
  const doneHabits = dayRecord
    ? nonPrayerHabits.filter(h => dayRecord.habits[h.id]).length
    : 0

  const [habitsExpanded, setHabitsExpanded] = useState(false)
  const visibleHabits = habitsExpanded ? nonPrayerHabits : nonPrayerHabits.slice(0, 3)
  const hiddenCount = nonPrayerHabits.length - 3

  const streakLabel = mainStreak === 1 ? 'день' : mainStreak < 5 ? 'дня' : 'дней'

  const now = new Date()
  // Format date as "ВОСКРЕСЕНЬЕ · 19 АПР"
  const dayOfWeek = now.toLocaleDateString('ru-RU', { weekday: 'long' }).toUpperCase()
  const dayNum = now.getDate()
  const monthShort = now.toLocaleDateString('ru-RU', { month: 'short' }).replace('.', '').toUpperCase()
  const dateStr = `${dayOfWeek} · ${dayNum} ${monthShort}`

  return (
    <motion.div
      className="pb-24"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Status Bar */}
      <motion.div
        variants={sectionVariants}
        className="px-5 pt-8"
        style={{ marginBottom: '48px' }}
      >
        <div className="flex items-center justify-between">
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.35)',
          }}>
            {dateStr}
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '10px',
            letterSpacing: '2px',
            color: 'rgba(255,255,255,0.35)',
          }}>
            УР. {levelInfo.level} · {xp} XP
          </span>
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div variants={sectionVariants} className="px-5">
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 300,
          fontSize: 'clamp(36px, 11vw, 44px)',
          lineHeight: 1.05,
          letterSpacing: '-1.2px',
          color: 'var(--color-ink)',
          margin: 0,
          maxWidth: '100%',
        }}>
          Ассалому<br />
          алайкум,<br />
          <span style={{ color: '#e8c96a', fontStyle: 'italic' }}>Дониёр</span>
        </h1>

        {/* Quote */}
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '15px',
          lineHeight: 1.55,
          color: 'rgba(255,255,255,0.42)',
          margin: '24px 0 0',
          maxWidth: '280px',
        }}>
          {quoteText}
        </p>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          letterSpacing: '2px',
          color: 'rgba(255,255,255,0.3)',
          margin: '6px 0 0',
        }}>
          — {quoteSource}
        </p>

        {/* Gold separator */}
        <div style={{
          width: '40px',
          height: '1px',
          background: 'rgba(201,168,76,0.3)',
          margin: '40px 0',
        }} />
      </motion.div>

      {/* Path Progress */}
      <motion.div variants={sectionVariants} className="px-5">
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          letterSpacing: '2.5px',
          color: 'rgba(201,168,76,0.6)',
          margin: '0 0 10px',
          textTransform: 'uppercase',
        }}>
          ПУТЬ ДО ТАШКЕНТА
        </p>
        <div style={{
          height: '2px',
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '1px',
          overflow: 'hidden',
        }}>
          <motion.div
            style={{
              height: '100%',
              borderRadius: '1px',
              background: 'linear-gradient(90deg, var(--color-gold), var(--color-sunray))',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <div className="flex justify-between" style={{ marginTop: '6px' }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            letterSpacing: '1px',
            color: 'rgba(255,255,255,0.3)',
          }}>
            {daysLeft} дней осталось
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            letterSpacing: '1px',
            color: 'rgba(255,255,255,0.3)',
          }}>
            {percent.toFixed(1)}%
          </span>
        </div>
      </motion.div>

      {/* Next Prayer Hero Card */}
      {nextPrayer && (
        <motion.div variants={sectionVariants} className="px-5" style={{ marginTop: '40px' }}>
          <p style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            letterSpacing: '2.5px',
            color: 'rgba(201,168,76,0.6)',
            margin: '0 0 12px',
            textTransform: 'uppercase',
          }}>
            СЛЕДУЮЩИЙ НАМАЗ · ЧЕРЕЗ {countdown.toUpperCase()}
          </p>
          <div className="relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: '20px',
            padding: '32px 24px',
          }}>
            {/* Radial glow */}
            <div className="absolute pointer-events-none" style={{
              top: '-40px', right: '-40px', width: '140px', height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
            }} />
            <div className="relative">
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '24px',
                fontWeight: 400,
                color: 'var(--color-txt)',
                marginBottom: '2px',
                letterSpacing: '-0.3px',
              }}>
                {nextPrayer.label}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 300,
                fontSize: '64px',
                color: '#e8c96a',
                letterSpacing: '-2.5px',
                lineHeight: 1,
              }}>
                {nextPrayer.timeStr}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Prayer Row - 5 pills */}
      <motion.div variants={sectionVariants} className="px-5 mt-6">
        <div className="flex" style={{ gap: '6px' }}>
          {prayers.map((p) => {
            const isDone = dayRecord?.prayers[p.name] ?? false
            const isPast = !p.isActive && !p.isNext && p.time < now
            return (
              <button
                key={p.name}
                onClick={() => handlePrayerToggle(p.name)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  padding: '10px 6px',
                  textAlign: 'center',
                  borderRadius: '10px',
                  border: isDone
                    ? '1px solid rgba(107,168,104,0.4)'
                    : p.isActive || p.isNext
                    ? '1px solid rgba(201,168,76,0.35)'
                    : '1px solid rgba(255,255,255,0.08)',
                  background: isDone
                    ? 'rgba(107,168,104,0.1)'
                    : p.isActive || p.isNext
                    ? 'rgba(201,168,76,0.1)'
                    : 'rgba(255,255,255,0.03)',
                  opacity: isPast && !isDone ? 0.5 : 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '8px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  marginBottom: '3px',
                  color: isDone
                    ? 'rgba(107,168,104,0.9)'
                    : p.isActive || p.isNext
                    ? 'rgba(201,168,76,0.8)'
                    : 'rgba(255,255,255,0.35)',
                }}>
                  {p.label}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  fontVariantNumeric: 'tabular-nums',
                  color: isDone
                    ? 'rgba(107,168,104,0.7)'
                    : p.isActive || p.isNext
                    ? '#e8c96a'
                    : 'rgba(255,255,255,0.5)',
                }}>
                  {p.timeStr}
                </div>
                {isDone && (
                  <div style={{ color: 'rgba(107,168,104,0.9)', fontSize: '10px', marginTop: '2px' }}>✓</div>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Habits "Сегодня" */}
      <motion.div variants={sectionVariants} className="px-5" style={{ marginTop: '48px' }}>
        {/* Title row */}
        <div className="flex justify-between items-center" style={{ marginBottom: '6px' }}>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: '28px',
            fontWeight: 400,
            color: 'var(--color-ink)',
            margin: 0,
          }}>
            Сегодня
          </h2>
          <div className="flex items-center" style={{ gap: '8px' }}>
            {/* Streak dot */}
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#e08a3c',
              boxShadow: '0 0 8px rgba(224,138,60,0.5)',
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '9px',
              letterSpacing: '1px',
              color: 'rgba(255,255,255,0.4)',
            }}>
              {mainStreak} {streakLabel}
            </span>
          </div>
        </div>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          letterSpacing: '2px',
          color: 'rgba(255,255,255,0.3)',
          margin: '0 0 20px',
          textTransform: 'uppercase',
        }}>
          {doneHabits} ИЗ {totalHabits} ВЫПОЛНЕНО
        </p>

        {/* Habit rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          {visibleHabits.map(h => {
            const done = dayRecord?.habits[h.id] ?? false
            return (
              <button
                key={h.id}
                onClick={() => {
                  hapticTap()
                  store.toggleHabit(today, h.id)
                  if (!done) {
                    awardPoints(10)
                    setTimeout(() => checkAndAwardBadges(), 100)
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 0',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                {/* Checkbox */}
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '6px',
                  border: done
                    ? '1.5px solid rgba(107,168,104,0.6)'
                    : '1.5px solid rgba(255,255,255,0.15)',
                  background: done
                    ? 'rgba(107,168,104,0.15)'
                    : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}>
                  {done && (
                    <span style={{ color: 'rgba(107,168,104,0.9)', fontSize: '12px', lineHeight: 1 }}>✓</span>
                  )}
                </div>
                {/* Label */}
                <span style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '14px',
                  color: done ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.8)',
                  textDecoration: done ? 'line-through' : 'none',
                  flex: 1,
                  minWidth: 0,
                }}>
                  {h.label}
                </span>
                {/* Category label */}
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '10px',
                  color: 'rgba(255,255,255,0.2)',
                  letterSpacing: '0.5px',
                  flexShrink: 0,
                  textTransform: 'uppercase',
                }}>
                  {h.category === 'islam' ? 'ислам'
                    : h.category === 'health' ? 'здоровье'
                    : h.category === 'development' ? 'развитие'
                    : h.category === 'finance' ? 'финансы'
                    : 'работа'}
                </span>
              </button>
            )
          })}
        </div>

        {/* Expand button */}
        {!habitsExpanded && hiddenCount > 0 && (
          <button
            onClick={() => setHabitsExpanded(true)}
            style={{
              display: 'block',
              width: '100%',
              padding: '14px 0',
              marginTop: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              letterSpacing: '1.5px',
              color: 'rgba(201,168,76,0.5)',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            Показать ещё {hiddenCount} привычек
          </button>
        )}
        {habitsExpanded && (
          <button
            onClick={() => setHabitsExpanded(false)}
            style={{
              display: 'block',
              width: '100%',
              padding: '14px 0',
              marginTop: '8px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              letterSpacing: '1.5px',
              color: 'rgba(201,168,76,0.5)',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            Скрыть
          </button>
        )}
      </motion.div>

    </motion.div>
  )
}
