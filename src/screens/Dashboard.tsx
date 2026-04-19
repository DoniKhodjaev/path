import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { usePrayers } from '../hooks/usePrayers'
import { useStore } from '../store/useStore'
import { getPathProgress, todayStr } from '../utils/dates'
import { QUOTES, getAllHabits } from '../utils/constants'
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

  const allHabits = useMemo(() => getAllHabits(store.customHabits), [store.customHabits])

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

  const nonPrayerHabits = allHabits.filter(h => !h.isPrayer)
  const totalHabits = nonPrayerHabits.length
  const doneHabits = dayRecord
    ? nonPrayerHabits.filter(h => dayRecord.habits[h.id]).length
    : 0

  const [habitsModalOpen, setHabitsModalOpen] = useState(false)
  const sortedHabits = [...nonPrayerHabits].sort((a, b) => {
    const aDone = dayRecord?.habits[a.id] ? 1 : 0
    const bDone = dayRecord?.habits[b.id] ? 1 : 0
    return aDone - bDone
  })
  const visibleHabits = sortedHabits.slice(0, 3)
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
      style={{
        position: 'relative',
        zIndex: 1,
        padding: 'calc(24px + env(safe-area-inset-top, 0px)) 20px 0',
        height: 'calc(100dvh - 70px - env(safe-area-inset-bottom, 0px))',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Status Bar */}
      <motion.div variants={sectionVariants}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          letterSpacing: '2px',
          color: 'var(--text-ghost)',
          marginBottom: '28px',
          paddingTop: '8px',
        }}>
          <span>{dateStr}</span>
          <span style={{ color: '#c9a84c' }}>УР. {levelInfo.level} · {xp} XP</span>
        </div>
      </motion.div>

      {/* Greeting */}
      <motion.div variants={sectionVariants}>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontWeight: 300,
          fontSize: '44px',
          lineHeight: 1.05,
          letterSpacing: '-1.2px',
          color: 'var(--text-primary)',
          margin: '0 0 16px',
        }}>
          Ассалому алайкум,<br />
          <span style={{ color: 'var(--gold-text)', fontStyle: 'italic' }}>Дониёр</span>
        </h1>

        {/* Quote */}
        <p style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontStyle: 'italic',
          fontSize: '15px',
          lineHeight: 1.55,
          color: 'var(--text-faint)',
          margin: 0,
          maxWidth: '280px',
        }}>
          {quoteText}
        </p>
        <p style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          letterSpacing: '2px',
          color: 'var(--text-ghost)',
          margin: '6px 0 0',
        }}>
          — {quoteSource}
        </p>

        {/* Gold separator */}
        <div style={{
          width: '50px',
          height: '1px',
          background: 'rgba(201,168,76,0.3)',
          margin: '14px 0',
        }} />
      </motion.div>

      {/* Path Progress */}
      <motion.div variants={sectionVariants} style={{ marginBottom: '24px' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '9px',
          letterSpacing: '2.5px',
          color: 'var(--gold-text-label)',
          marginBottom: '10px',
        }}>
          ПУТЬ ДО ТАШКЕНТА
        </div>
        <div style={{
          height: '2px',
          background: 'var(--border-muted)',
          borderRadius: '2px',
          overflow: 'hidden',
          marginBottom: '8px',
        }}>
          <motion.div
            style={{
              height: '100%',
              background: 'linear-gradient(90deg, #c9a84c, #e8c96a)',
              borderRadius: '2px',
            }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '10px',
          color: 'var(--text-subtle)',
        }}>
          <span>{daysLeft} дней</span>
          <span style={{ color: 'var(--gold-text)' }}>{percent.toFixed(1)}%</span>
        </div>
      </motion.div>

      {/* Next Prayer Hero Card */}
      {nextPrayer && (
        <motion.div variants={sectionVariants}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '9px',
            letterSpacing: '2.5px',
            color: 'var(--gold-text-label)',
            marginBottom: '12px',
          }}>
            СЛЕДУЮЩИЙ НАМАЗ · ЧЕРЕЗ {countdown.toUpperCase()}
          </div>
          <div style={{
            background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))',
            border: '1px solid rgba(201,168,76,0.18)',
            borderRadius: '20px',
            padding: '28px 24px',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* Radial glow */}
            <div style={{
              position: 'absolute',
              top: '-40px',
              right: '-40px',
              width: '140px',
              height: '140px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(201,168,76,0.15) 0%, transparent 70%)',
            }} />
            <div style={{ position: 'relative' }}>
              <div style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '22px',
                fontWeight: 400,
                color: 'var(--text-primary)',
                marginBottom: '2px',
                letterSpacing: '-0.3px',
              }}>
                {nextPrayer.label}
              </div>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 300,
                fontSize: '56px',
                color: 'var(--gold-text)',
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
      <motion.div variants={sectionVariants}>
        <div style={{ marginTop: '16px', display: 'flex', gap: '6px' }}>
          {prayers.map((p) => {
            const isDone = dayRecord?.prayers[p.name] ?? false
            const isPast = !p.isActive && !p.isNext && p.time < now
            const isActive = p.isActive || p.isNext
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
                    : isActive
                    ? '1px solid rgba(201,168,76,0.35)'
                    : '1px solid var(--border-faint)',
                  background: isDone
                    ? 'rgba(107,168,104,0.1)'
                    : isActive
                    ? 'rgba(201,168,76,0.1)'
                    : 'var(--surface-card)',
                  opacity: isPast && !isDone ? 0.5 : 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '8px',
                  letterSpacing: '1.5px',
                  textTransform: 'uppercase',
                  marginBottom: '3px',
                  color: isDone
                    ? 'rgba(107,168,104,0.9)'
                    : isActive
                    ? 'rgba(201,168,76,0.8)'
                    : 'var(--text-ghost)',
                }}>
                  {p.label}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '12px',
                  fontVariantNumeric: 'tabular-nums',
                  color: isDone
                    ? 'rgba(107,168,104,0.7)'
                    : isActive
                    ? 'var(--gold-text)'
                    : 'var(--text-subtle)',
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
      <motion.div variants={sectionVariants} style={{ marginTop: '10px' }}>
        {/* Title row */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          marginBottom: '10px',
        }}>
          <div>
            <h2 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 400,
              fontSize: '28px',
              color: 'var(--text-primary)',
              margin: 0,
              letterSpacing: '-0.5px',
            }}>
              Сегодня
            </h2>
            <div style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              letterSpacing: '1.5px',
              color: 'var(--text-faint)',
              marginTop: '6px',
            }}>
              {doneHabits} ИЗ {totalHabits} ВЫПОЛНЕНО
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#e08a3c',
              boxShadow: '0 0 12px rgba(224,138,60,0.6)',
            }} />
            <span style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '10px',
              color: '#e08a3c',
            }}>
              {mainStreak} {streakLabel}
            </span>
          </div>
        </div>

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
                    : '1.5px solid var(--text-dim)',
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
                  color: done ? 'var(--text-ghost)' : 'var(--text-secondary)',
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
                  color: 'var(--text-ghost)',
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

        {/* Show all button */}
        {hiddenCount > 0 && (
          <button
            onClick={() => setHabitsModalOpen(true)}
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
              color: 'var(--gold-text-muted)',
              textTransform: 'uppercase',
              textAlign: 'center',
            }}
          >
            Показать ещё {hiddenCount} привычек
          </button>
        )}
      </motion.div>

      {/* Habits Modal */}
      {habitsModalOpen && createPortal(
        <div
          onClick={() => setHabitsModalOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '380px',
              maxHeight: '85vh',
              background: 'var(--surface-overlay)',
              borderRadius: '20px 20px 0 0',
              padding: '20px 20px calc(32px + env(safe-area-inset-bottom, 0px))',
              overflowY: 'auto',
            }}
          >
            {/* Modal handle */}
            <div style={{
              width: '36px',
              height: '4px',
              borderRadius: '2px',
              background: 'var(--text-ghost)',
              margin: '0 auto 20px',
            }} />

            {/* Modal title */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: '16px',
            }}>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 400,
                fontSize: '28px',
                color: 'var(--text-primary)',
                margin: 0,
                letterSpacing: '-0.5px',
              }}>
                Все привычки
              </h2>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '1.5px',
                color: 'var(--text-faint)',
              }}>
                {doneHabits} ИЗ {totalHabits}
              </div>
            </div>

            {/* All habits */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {sortedHabits.map(h => {
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
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '6px',
                      border: done
                        ? '1.5px solid rgba(107,168,104,0.6)'
                        : '1.5px solid var(--text-dim)',
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
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '14px',
                      color: done ? 'var(--text-ghost)' : 'var(--text-secondary)',
                      textDecoration: done ? 'line-through' : 'none',
                      flex: 1,
                      minWidth: 0,
                    }}>
                      {h.label}
                    </span>
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '10px',
                      color: 'var(--text-ghost)',
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

            {/* Close button */}
            <button
              onClick={() => setHabitsModalOpen(false)}
              style={{
                display: 'block',
                width: '100%',
                padding: '14px 0',
                marginTop: '16px',
                background: 'var(--border-faint)',
                border: '1px solid var(--border-muted)',
                borderRadius: '12px',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '10px',
                letterSpacing: '1.5px',
                color: 'var(--text-subtle)',
                textTransform: 'uppercase',
                textAlign: 'center',
              }}
            >
              Закрыть
            </button>
          </motion.div>
        </div>,
        document.body
      )}

    </motion.div>
  )
}
