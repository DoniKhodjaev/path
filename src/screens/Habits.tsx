import { useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useGamification } from '../hooks/useGamification'
import { useStreaks } from '../hooks/useStreaks'
import { usePrayers } from '../hooks/usePrayers'
import { HABITS, CATEGORY_LABELS, DEFAULT_HABIT_IDS, getAllHabits } from '../utils/constants'
import { todayStr, getLast7Days } from '../utils/dates'
import type { HabitDefinition } from '../types'

const CATEGORY_SECTION_COLORS: Record<string, { label: string; line: string }> = {
  islam: { label: 'rgba(76,175,130,0.7)', line: 'rgba(76,175,130,0.15)' },
  health: { label: 'rgba(90,154,224,0.7)', line: 'rgba(90,154,224,0.15)' },
  development: { label: 'rgba(201,168,76,0.7)', line: 'rgba(201,168,76,0.15)' },
  work: { label: 'var(--gold-text-muted)', line: 'rgba(232,201,106,0.12)' },
  finance: { label: 'rgba(201,168,76,0.7)', line: 'rgba(201,168,76,0.15)' },
}

const CHECKBOX_COLORS: Record<string, string> = {
  islam: '#4caf82',
  health: '#5a9ae0',
  development: '#c9a84c',
  finance: '#c9a84c',
  work: 'var(--text-ghost)',
}

const DAY_LABELS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС']

export function Habits() {
  const store = useStore()
  const { awardPoints, checkAndAwardBadges } = useGamification()
  const { recalculateStreaks, getMainStreak } = useStreaks()
  const { prayers: prayerInfos } = usePrayers()
  const today = todayStr()
  const dayRecord = store.days[today]
  const allHabits = useMemo(() => getAllHabits(store.customHabits), [store.customHabits])

  const [manageOpen, setManageOpen] = useState(false)
  const [addOpen, setAddOpen] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newCategory, setNewCategory] = useState<HabitDefinition['category']>('health')

  const categories = useMemo(() => {
    const cats = new Map<string, typeof HABITS>()
    for (const h of allHabits) {
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
          const currentAll = getAllHabits(useStore.getState().customHabits)
          const allDone = currentAll.every(h =>
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
  const totalHabits = allHabits.length
  const doneCount = allHabits.filter(h =>
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
      const dayIdx = (d.getDay() + 6) % 7
      const label = DAY_LABELS[dayIdx]
      const isToday = dateStr === today
      const rec = store.days[dateStr]

      let status: 'today' | 'good' | 'bad' | 'neutral' = 'neutral'
      if (isToday) {
        status = 'today'
      } else if (rec) {
        const done = allHabits.filter(h => h.isPrayer ? rec.prayers[h.id] : rec.habits[h.id]).length
        const ratio = done / allHabits.length
        if (ratio >= 0.8) status = 'good'
        else if (ratio < 0.3 && done > 0) status = 'bad'
        else if (done > 0) status = 'neutral'
      }

      return { label, status, isToday }
    })
  }, [last7, today, store.days])

  return (
    <div style={{
      position: 'relative',
      zIndex: 1,
      padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 0',
      height: 'calc(100dvh - 70px - env(safe-area-inset-bottom, 0px))',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Status bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 10,
        letterSpacing: 2,
        color: 'var(--text-ghost)',
        marginBottom: 16,
        paddingTop: 4,
        flexShrink: 0,
      }}>
        <span>ПРИВЫЧКИ · {headerDate}</span>
        <span style={{ color: '#e08a3c' }}>🔥 {mainStreak} ДНЕЙ</span>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 300,
        fontSize: 36,
        lineHeight: 1.05,
        letterSpacing: -1,
        color: 'var(--text-primary)',
        margin: '0 0 10px',
        flexShrink: 0,
      }}>
        Привычки {' '}
        <span style={{ color: 'var(--gold-text)', fontStyle: 'italic' }}>сегодня</span>
      </h1>

      {/* Counter row */}
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 8, flexShrink: 0 }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 300,
          fontSize: 32,
          color: 'var(--gold-text)',
          letterSpacing: -1,
          lineHeight: 1,
        }}>
          {doneCount}
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 13,
          color: 'var(--text-faint)',
          letterSpacing: 1,
        }}>
          из {totalHabits}
        </span>
        <span style={{
          marginLeft: 'auto',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          color: 'var(--gold-text)',
        }}>
          {Math.round(progressPct)}%
        </span>
      </div>

      {/* Progress bar */}
      <div style={{
        height: 2,
        background: 'var(--surface-elevated)',
        borderRadius: 2,
        overflow: 'hidden',
        marginBottom: 14,
        flexShrink: 0,
      }}>
        <div style={{
          height: '100%',
          width: `${progressPct}%`,
          background: 'linear-gradient(90deg, #c9a84c, #e8c96a)',
          borderRadius: 2,
        }} />
      </div>

      {/* Week dots */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: 14,
        padding: '0 4px',
        flexShrink: 0,
      }}>
        {weekData.map((day, i) => {
          let dotBg: string
          let dotShadow: string | undefined
          if (day.status === 'today') {
            dotBg = 'var(--gold-text)'
            dotShadow = '0 0 8px rgba(232,201,106,0.5)'
          } else if (day.status === 'good') {
            dotBg = '#4caf82'
          } else if (day.status === 'bad') {
            dotBg = 'rgba(224,90,90,0.5)'
          } else {
            dotBg = 'rgba(76,175,130,0.4)'
          }

          const isToday = day.status === 'today'

          return (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                color: isToday ? 'var(--gold-text)' : 'var(--text-ghost)',
                letterSpacing: 1,
                marginBottom: 6,
              }}>
                {day.label}
              </div>
              <div style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                margin: '0 auto',
                background: dotBg,
                boxShadow: dotShadow,
              }} />
            </div>
          )
        })}
      </div>

      {/* Manage button */}
      <button
        onClick={() => setManageOpen(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          width: '100%',
          padding: '10px 0',
          marginBottom: 12,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-muted)',
          borderRadius: 10,
          cursor: 'pointer',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: 1.5,
          color: 'var(--gold-text-label)',
          textTransform: 'uppercase' as const,
          flexShrink: 0,
        }}
      >
        ＋ Управление привычками
      </button>

      {/* Category sections — scrollable */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        marginRight: -4,
        paddingRight: 4,
        paddingBottom: 16,
      }}>
      {Array.from(categories.entries()).map(([category, habits]) => {
        const colors = CATEGORY_SECTION_COLORS[category] || CATEGORY_SECTION_COLORS.work

        return (
          <div key={category}>
            {/* Category divider */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              marginBottom: 8,
            }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: 3,
                color: colors.label,
              }}>
                {(CATEGORY_LABELS[category] || category).toUpperCase()}
              </span>
              <div style={{
                flex: 1,
                height: 1,
                background: colors.line,
              }} />
            </div>

            {/* Habit rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 18 }}>
              {habits.map(h => {
                const checked = h.isPrayer
                  ? dayRecord?.prayers[h.id] ?? false
                  : dayRecord?.habits[h.id] ?? false

                const isActivePrayer = h.isPrayer && activePrayerId === h.id
                const checkColor = CHECKBOX_COLORS[category] || CHECKBOX_COLORS.work

                const prayerInfo = h.isPrayer
                  ? prayerInfos.find(p => p.name === h.id)
                  : null

                const rowStyle: React.CSSProperties = {
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  padding: '10px 4px',
                  cursor: 'pointer',
                  ...(checked ? { opacity: 0.45 } : {}),
                  ...(isActivePrayer ? {
                    background: 'rgba(201,168,76,0.04)',
                    borderRadius: 8,
                    margin: '0 -8px',
                    paddingLeft: 12,
                    paddingRight: 12,
                  } : {}),
                }

                const checkboxStyle: React.CSSProperties = {
                  width: 20,
                  height: 20,
                  borderRadius: 6,
                  flexShrink: 0,
                  ...(checked
                    ? {
                        background: checkColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }
                    : {
                        border: isActivePrayer
                          ? '1.5px solid rgba(232,201,106,0.5)'
                          : '1.5px solid var(--text-dim)',
                        ...(isActivePrayer ? { boxShadow: '0 0 8px rgba(201,168,76,0.15)' } : {}),
                      }
                  ),
                }

                const labelStyle: React.CSSProperties = {
                  fontSize: 14,
                  color: checked ? 'var(--text-muted)' : 'var(--text-secondary)',
                  flex: 1,
                  ...(checked ? { textDecoration: 'line-through' } : {}),
                }

                return (
                  <div
                    key={h.id}
                    onClick={() => handleToggle(h)}
                    style={rowStyle}
                  >
                    {/* Checkbox */}
                    <div style={checkboxStyle}>
                      {checked && (
                        <span style={{ color: 'var(--surface-dot)', fontSize: 12, fontWeight: 600 }}>✓</span>
                      )}
                    </div>

                    {/* Label */}
                    <span style={labelStyle}>
                      {h.label}
                    </span>

                    {/* Right text */}
                    {isActivePrayer && !checked && (
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: 'var(--text-ghost)',
                      }}>
                        сейчас
                      </span>
                    )}
                    {prayerInfo && !isActivePrayer && (
                      <span style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: 'var(--text-ghost)',
                      }}>
                        {prayerInfo.timeStr}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
      </div>

      {/* Manage Habits Modal */}
      {manageOpen && createPortal(
        <div
          onClick={() => { setManageOpen(false); setAddOpen(false) }}
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
            transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 380,
              maxHeight: '85vh',
              background: 'var(--surface-overlay)',
              borderRadius: '20px 20px 0 0',
              padding: '20px 20px calc(32px + env(safe-area-inset-bottom, 0px))',
              overflowY: 'auto',
            }}
          >
            {/* Handle */}
            <div style={{
              width: 36, height: 4, borderRadius: 2,
              background: 'var(--text-dim)',
              margin: '0 auto 16px',
            }} />

            {/* Title */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 16,
            }}>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontWeight: 400, fontSize: 24, color: 'var(--text-primary)', margin: 0,
              }}>
                Управление
              </h2>
              <button
                onClick={() => setAddOpen(true)}
                style={{
                  padding: '6px 14px',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.3)',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10, letterSpacing: 1,
                  color: 'var(--gold-text)',
                }}
              >
                + ДОБАВИТЬ
              </button>
            </div>

            {/* Habit list */}
            {allHabits.map(h => {
              const isDefault = DEFAULT_HABIT_IDS.has(h.id)
              const isPrayer = h.isPrayer
              return (
                <div key={h.id} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 0',
                  borderBottom: '1px solid var(--border-faint)',
                }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: CHECKBOX_COLORS[h.category] || 'var(--text-ghost)',
                    flexShrink: 0,
                  }} />
                  <span style={{
                    flex: 1, fontSize: 14,
                    color: 'var(--text-secondary)',
                  }}>
                    {h.label}
                  </span>
                  <span style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9, letterSpacing: 1,
                    color: 'var(--text-ghost)',
                    textTransform: 'uppercase',
                  }}>
                    {CATEGORY_LABELS[h.category] || h.category}
                  </span>
                  {!isDefault && !isPrayer && (
                    <button
                      onClick={() => store.removeCustomHabit(h.id)}
                      style={{
                        padding: '4px 10px',
                        background: 'rgba(224,90,90,0.1)',
                        border: '1px solid rgba(224,90,90,0.25)',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9, color: '#e05a5a',
                      }}
                    >
                      ✕
                    </button>
                  )}
                  {isDefault && (
                    <span style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8, color: 'var(--text-dim)',
                      letterSpacing: 1,
                    }}>
                      БАЗОВАЯ
                    </span>
                  )}
                </div>
              )
            })}

            {/* Close */}
            <button
              onClick={() => { setManageOpen(false); setAddOpen(false) }}
              style={{
                display: 'block', width: '100%',
                padding: '14px 0', marginTop: 16,
                background: 'var(--border-faint)',
                border: '1px solid var(--border-muted)',
                borderRadius: 12, cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10, letterSpacing: 1.5,
                color: 'var(--text-subtle)',
                textTransform: 'uppercase' as const,
                textAlign: 'center' as const,
              }}
            >
              Закрыть
            </button>
          </motion.div>
        </div>,
        document.body
      )}

      {/* Add Habit Modal */}
      {addOpen && createPortal(
        <div
          onClick={() => setAddOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1100,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2 }}
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: 340,
              background: 'var(--surface-overlay)',
              border: '1px solid var(--border-muted)',
              borderRadius: 16,
              padding: 24,
            }}
          >
            <h3 style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 400, fontSize: 22, color: 'var(--text-primary)',
              margin: '0 0 20px',
            }}>
              Новая привычка
            </h3>

            {/* Name input */}
            <div style={{ marginBottom: 16 }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, letterSpacing: 2,
                color: 'var(--text-ghost)',
                marginBottom: 8,
              }}>
                НАЗВАНИЕ
              </div>
              <input
                value={newLabel}
                onChange={e => setNewLabel(e.target.value)}
                placeholder="Например: Медитация 10 мин"
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  background: 'var(--border-faint)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 10,
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  fontFamily: "'Inter', sans-serif",
                  outline: 'none',
                }}
              />
            </div>

            {/* Category selector */}
            <div style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9, letterSpacing: 2,
                color: 'var(--text-ghost)',
                marginBottom: 8,
              }}>
                КАТЕГОРИЯ
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {(['islam', 'health', 'development', 'finance', 'work'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setNewCategory(cat)}
                    style={{
                      padding: '7px 12px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      fontSize: 12,
                      fontFamily: "'JetBrains Mono', monospace",
                      letterSpacing: 0.5,
                      border: newCategory === cat
                        ? `1.5px solid ${CHECKBOX_COLORS[cat]}`
                        : '1px solid rgba(255,255,255,0.08)',
                      background: newCategory === cat
                        ? `${CHECKBOX_COLORS[cat]}15`
                        : 'var(--surface-card)',
                      color: newCategory === cat
                        ? CHECKBOX_COLORS[cat]
                        : 'var(--text-subtle)',
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                ))}
              </div>
            </div>

            {/* Buttons */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => setAddOpen(false)}
                style={{
                  flex: 1, padding: '12px 0',
                  background: 'var(--border-faint)',
                  border: '1px solid var(--border-muted)',
                  borderRadius: 10, cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, color: 'var(--text-subtle)',
                }}
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  if (!newLabel.trim()) return
                  const id = `custom-${Date.now()}`
                  store.addCustomHabit({
                    id,
                    label: newLabel.trim(),
                    category: newCategory,
                  })
                  setNewLabel('')
                  setAddOpen(false)
                }}
                style={{
                  flex: 1, padding: '12px 0',
                  background: 'rgba(201,168,76,0.15)',
                  border: '1px solid rgba(201,168,76,0.35)',
                  borderRadius: 10, cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11, color: 'var(--gold-text)',
                }}
              >
                Добавить
              </button>
            </div>
          </motion.div>
        </div>,
        document.body
      )}
    </div>
  )
}
