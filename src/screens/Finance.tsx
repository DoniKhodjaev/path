import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useGamification } from '../hooks/useGamification'
import { DEPOSIT_MONTHS, SPECIAL_PAYMENTS, FINANCIAL_GOAL_USD } from '../utils/constants'
import { hapticTap } from '../utils/haptic'
import { staggerContainer } from '../utils/motion'

/* ─── motion variants ──────────────────────────────────────────────────── */
const barVariants = {
  initial: { width: '0%' },
  animate: (pct: number) => ({
    width: `${Math.min(pct, 100)}%`,
    transition: { duration: 1.1, ease: [0.32, 0.72, 0, 1] as const, delay: 0.25 },
  }),
}

const heroVariants = {
  initial: { opacity: 0, y: 22 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.32, 0.72, 0, 1] as const },
  },
}

const sectionVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const },
  },
}

/* ─── status config ────────────────────────────────────────────────────── */
type PaymentStatus = 'waiting' | 'received' | 'deposited'

const STATUS_LABELS: Record<PaymentStatus, string> = {
  waiting: 'ОЖИДАЕТСЯ',
  received: 'ПОЛУЧЕНО',
  deposited: 'НА ДЕПОЗИТЕ',
}

const NEXT_STATUS: Record<PaymentStatus, PaymentStatus> = {
  waiting: 'received',
  received: 'deposited',
  deposited: 'waiting',
}

/* ─── helpers ──────────────────────────────────────────────────────────── */
function getCurrentMonth(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

function getDateHeader(): string {
  const now = new Date()
  const day = now.getDate()
  const months = ['ЯНВ', 'ФЕВ', 'МАР', 'АПР', 'МАЙ', 'ИЮН', 'ИЮЛ', 'АВГ', 'СЕН', 'ОКТ', 'НОЯ', 'ДЕК']
  return `${day} ${months[now.getMonth()]}`
}

function getStatusStyle(status: PaymentStatus) {
  switch (status) {
    case 'waiting':
      return {
        bg: 'rgba(224,138,60,0.12)',
        color: '#e08a3c',
        border: 'rgba(224,138,60,0.25)',
      }
    case 'received':
      return {
        bg: 'rgba(90,154,224,0.12)',
        color: '#5a9ae0',
        border: 'rgba(90,154,224,0.25)',
      }
    case 'deposited':
      return {
        bg: 'rgba(201,168,76,0.12)',
        color: '#e8c96a',
        border: 'rgba(201,168,76,0.25)',
      }
  }
}

/* ─── component ────────────────────────────────────────────────────────── */
export function Finance() {
  const store = useStore()
  const { awardPoints, checkAndAwardBadges } = useGamification()
  const [editingSaved, setEditingSaved] = useState(false)
  const [savedInput, setSavedInput] = useState(String(store.currentSaved))

  const currentMonth = getCurrentMonth()
  const lastMonth = DEPOSIT_MONTHS[DEPOSIT_MONTHS.length - 1]

  const totalFromDeposits = DEPOSIT_MONTHS
    .filter(m => store.deposits[m.month])
    .reduce((sum, m) => sum + m.amount, 0)
  const totalFromSpecial = SPECIAL_PAYMENTS
    .filter(p => store.specialPayments[p.id] === 'deposited')
    .reduce((sum, p) => sum + p.amount, 0)
  const totalSaved = store.currentSaved || (totalFromDeposits + totalFromSpecial)
  const inUsd = totalSaved / store.exchangeRate
  const progressPct = (inUsd / FINANCIAL_GOAL_USD) * 100

  const monthsDone = DEPOSIT_MONTHS.filter(m => store.deposits[m.month]).length
  const monthsLeft = DEPOSIT_MONTHS.length - monthsDone
  const forecast =
    totalSaved +
    monthsLeft * 100000 +
    SPECIAL_PAYMENTS
      .filter(p => store.specialPayments[p.id] === 'waiting')
      .reduce((s, p) => s + p.amount, 0)
  const forecastUsd = (forecast / store.exchangeRate).toLocaleString('en-US', {
    maximumFractionDigits: 0,
  })

  const handleDepositToggle = (month: string) => {
    hapticTap()
    const wasDone = store.deposits[month]
    store.toggleDeposit(month)
    if (!wasDone) {
      awardPoints(100)
      setTimeout(() => checkAndAwardBadges(), 100)
    }
  }

  const handleSaveSaved = () => {
    store.setCurrentSaved(Number(savedInput) || 0)
    setEditingSaved(false)
  }

  const usdDisplay = inUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })
  const rubDisplay = totalSaved.toLocaleString('ru-RU')

  return (
    <motion.div
      style={{
        height: 'calc(100dvh - 70px - env(safe-area-inset-bottom, 0px))',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* ── Status Bar ───────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 8px',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: 2,
          flexShrink: 0,
        }}
      >
        <span style={{ color: 'var(--text-faint)' }}>
          ФИНАНСЫ · {getDateHeader()}
        </span>
        <span style={{ color: 'var(--text-faint)' }}>
          КУРС {store.exchangeRate.toFixed(2)}
        </span>
      </div>

      {/* ── Container ────────────────────────────────────────────────── */}
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: '8px 20px 0',
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>

        {/* ── Hero Section ─────────────────────────────────────────────── */}
        <motion.section style={{ marginBottom: 16, flexShrink: 0 }} variants={heroVariants}>
          {/* НАКОПЛЕНО label */}
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: 2.5,
              color: 'var(--gold-text-label)',
              marginBottom: 10,
            }}
          >
            НАКОПЛЕНО
          </p>

          {/* Dollar amount + goal */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 8 }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 300,
                fontSize: 48,
                color: 'var(--gold-text)',
                letterSpacing: -3,
                lineHeight: 1,
              }}
            >
              ${usdDisplay}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 18,
                color: 'var(--text-ghost)',
                letterSpacing: -0.5,
              }}
            >
              / {FINANCIAL_GOAL_USD.toLocaleString('en-US')}
            </span>
          </div>

          {/* Rub + percentage */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--text-faint)',
              marginBottom: 10,
            }}
          >
            <span>₽ {rubDisplay}</span>
            <span style={{ color: 'var(--gold-text)' }}>{progressPct.toFixed(1)}%</span>
          </div>

          {/* Progress bar */}
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              height: 2,
              backgroundColor: 'var(--surface-elevated)',
              borderRadius: 1,
            }}
          >
            <motion.div
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                background: 'linear-gradient(90deg, #c9a84c, #e8c96a)',
                borderRadius: 1,
              }}
              variants={barVariants}
              initial="initial"
              animate="animate"
              custom={progressPct}
            />
          </div>

          {/* Forecast */}
          <div
            style={{
              marginTop: 10,
              padding: '10px 14px',
              borderLeft: '2px solid rgba(201,168,76,0.4)',
              background: 'rgba(201,168,76,0.03)',
            }}
          >
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontStyle: 'italic',
                fontSize: 13,
                color: 'var(--text-subtle)',
                lineHeight: 1.5,
              }}
            >
              При текущем темпе к 31 октября:{' '}
            </span>
            <span
              style={{
                color: 'var(--gold-text)',
                fontStyle: 'normal',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
              }}
            >
              ${forecastUsd}
            </span>
          </div>
        </motion.section>

        {/* ── Scrollable area ──────────────────────────────────────────── */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginRight: -4,
          paddingRight: 4,
          paddingBottom: 16,
        }}>

        {/* ── Deposits ─────────────────────────────────────────────────── */}
        <motion.section variants={sectionVariants}>
          {/* Section divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: 3,
                color: 'rgba(201,168,76,0.7)',
                whiteSpace: 'nowrap',
              }}
            >
              ДЕПОЗИТЫ
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(201,168,76,0.15)' }} />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: 3,
                color: 'rgba(201,168,76,0.7)',
                whiteSpace: 'nowrap',
              }}
            >
              {monthsDone} / {DEPOSIT_MONTHS.length}
            </span>
          </div>

          {/* Deposit rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 20 }}>
            {DEPOSIT_MONTHS.map((m) => {
              const done = store.deposits[m.month] ?? false
              const isCurrent = m.month === currentMonth && !done
              const isLast = m.month === lastMonth.month
              const isFuture = m.month > currentMonth && !isLast
              const amountUsd = (m.amount / store.exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })

              const rowStyle: React.CSSProperties = {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 4px',
                borderBottom: '1px solid var(--border-faint)',
                opacity: isFuture ? 0.55 : 1,
                background: 'none',
                border: 'none',
                width: '100%',
                textAlign: 'left' as const,
                cursor: 'pointer',
              }

              if (isLast) {
                Object.assign(rowStyle, {
                  background: 'linear-gradient(90deg, rgba(201,168,76,0.04), transparent)',
                  borderRadius: 8,
                  margin: '8px -8px 0',
                  padding: '16px 12px',
                  borderBottom: 'none',
                })
              }

              const checkboxStyle: React.CSSProperties = {
                width: 20,
                height: 20,
                borderRadius: 4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                color: 'var(--gold-text)',
                flexShrink: 0,
              }

              if (done) {
                Object.assign(checkboxStyle, {
                  border: '1.5px solid #e8c96a',
                  backgroundColor: 'rgba(232,201,106,0.15)',
                })
              } else if (isCurrent) {
                Object.assign(checkboxStyle, {
                  border: '1.5px solid rgba(232,201,106,0.5)',
                  boxShadow: '0 0 8px rgba(201,168,76,0.15)',
                  backgroundColor: 'transparent',
                })
              } else {
                Object.assign(checkboxStyle, {
                  border: '1.5px solid var(--text-dim)',
                  backgroundColor: 'transparent',
                })
              }

              return (
                <motion.button
                  key={m.month}
                  onClick={() => handleDepositToggle(m.month)}
                  style={rowStyle}
                  whileTap={{ scale: 0.985 }}
                >
                  {/* Left: checkbox + month */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={checkboxStyle}>
                      {done && '✓'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 13,
                          color: isLast ? 'var(--gold-text)' : 'var(--text-secondary)',
                        }}
                      >
                        {m.label}
                      </span>
                      {isCurrent && (
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 9,
                            color: 'var(--gold-text)',
                            letterSpacing: 1,
                          }}
                        >
                          СЛЕДУЮЩИЙ
                        </span>
                      )}
                      {isLast && (
                        <span
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 9,
                            color: 'var(--gold-text)',
                            letterSpacing: 1,
                          }}
                        >
                          ФИНАЛЬНЫЙ
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right: amount */}
                  <div style={{ textAlign: 'right' }}>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 14,
                        color: isLast ? 'var(--gold-text)' : 'var(--text-secondary)',
                      }}
                    >
                      {m.amount.toLocaleString('ru-RU')} ₽
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 10,
                        color: 'var(--text-ghost)',
                      }}
                    >
                      ${amountUsd}
                    </div>
                  </div>
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* ── Special Payments ─────────────────────────────────────────── */}
        <motion.section variants={sectionVariants}>
          {/* Section divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: 3,
                color: 'rgba(90,154,224,0.7)',
                whiteSpace: 'nowrap',
              }}
            >
              РАЗОВЫЕ ВЫПЛАТЫ
            </span>
            <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(90,154,224,0.15)' }} />
          </div>

          {/* Payment cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {SPECIAL_PAYMENTS.map((p) => {
              const status = (store.specialPayments[p.id] || 'waiting') as PaymentStatus
              const statusStyle = getStatusStyle(status)

              return (
                <motion.button
                  key={p.id}
                  onClick={() => {
                    hapticTap()
                    store.setSpecialPayment(p.id, NEXT_STATUS[status])
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 16px',
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-faint)',
                    borderRadius: 10,
                    width: '100%',
                    textAlign: 'left' as const,
                    cursor: 'pointer',
                  }}
                  whileTap={{ scale: 0.985 }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'var(--text-secondary)',
                        marginBottom: 4,
                      }}
                    >
                      {p.label}
                    </div>
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11,
                        color: 'var(--text-faint)',
                      }}
                    >
                      {p.amount.toLocaleString('ru-RU')} ₽
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      padding: '4px 10px',
                      borderRadius: 20,
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      border: `1px solid ${statusStyle.border}`,
                      letterSpacing: 1,
                    }}
                  >
                    {STATUS_LABELS[status]}
                  </span>
                </motion.button>
              )
            })}
          </div>
        </motion.section>

        {/* ── Edit Savings ─────────────────────────────────────────────── */}
        <motion.section variants={sectionVariants}>
          <div
            style={{
              padding: '16px 18px',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-faint)',
              borderRadius: 10,
            }}
          >
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: 2,
                color: 'var(--text-faint)',
                marginBottom: 8,
              }}
            >
              ИЗМЕНИТЬ НАКОПЛЕНИЯ
            </div>

            {editingSaved ? (
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  value={savedInput}
                  onChange={e => setSavedInput(e.target.value)}
                  style={{
                    flex: 1,
                    outline: 'none',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: 'var(--gold-text)',
                    backgroundColor: 'var(--border-faint)',
                    border: '1px solid rgba(201,168,76,0.2)',
                    borderRadius: 6,
                    padding: '6px 10px',
                  }}
                />
                <button
                  onClick={handleSaveSaved}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: 'var(--gold-text)',
                    backgroundColor: 'rgba(201,168,76,0.12)',
                    border: '1px solid rgba(201,168,76,0.25)',
                    borderRadius: 6,
                    padding: '6px 12px',
                    cursor: 'pointer',
                  }}
                >
                  OK
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 14,
                    color: 'var(--text-muted)',
                  }}
                >
                  {totalSaved.toLocaleString('ru-RU')} ₽
                </span>
                <button
                  onClick={() => {
                    setSavedInput(String(totalSaved))
                    setEditingSaved(true)
                  }}
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: 'var(--gold-text-label)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    textUnderlineOffset: 3,
                  }}
                >
                  изменить
                </button>
              </div>
            )}
          </div>
        </motion.section>

        </div>
      </div>
    </motion.div>
  )
}
