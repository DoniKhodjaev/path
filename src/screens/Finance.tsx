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
      className="pb-24 min-h-screen"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* ── Header ───────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 pt-6 pb-4"
        style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, letterSpacing: 2 }}
      >
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
          ФИНАНСЫ · {getDateHeader()}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>
          КУРС {store.exchangeRate.toFixed(2)}
        </span>
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <motion.section className="px-5 pt-4 pb-6" variants={heroVariants}>
        {/* НАКОПЛЕНО label */}
        <p
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 10,
            letterSpacing: 2.5,
            color: 'rgba(201,168,76,0.6)',
            marginBottom: 12,
          }}
        >
          НАКОПЛЕНО
        </p>

        {/* Dollar amount + goal */}
        <div className="flex items-baseline gap-2 mb-1">
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontWeight: 300,
              fontSize: 64,
              color: '#e8c96a',
              lineHeight: 1,
            }}
          >
            ${usdDisplay}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 18,
              color: 'rgba(255,255,255,0.3)',
            }}
          >
            / {FINANCIAL_GOAL_USD.toLocaleString('en-US')}
          </span>
        </div>

        {/* Rub + percentage */}
        <div
          className="flex items-center justify-between mb-4"
          style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11 }}
        >
          <span style={{ color: 'rgba(255,255,255,0.4)' }}>₽ {rubDisplay}</span>
          <span style={{ color: '#e8c96a' }}>{progressPct.toFixed(1)}%</span>
        </div>

        {/* Progress bar */}
        <div
          className="relative overflow-hidden mb-5"
          style={{ height: 2, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 1 }}
        >
          <motion.div
            className="absolute inset-y-0 left-0"
            style={{
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
            borderLeft: '2px solid rgba(201,168,76,0.4)',
            backgroundColor: 'rgba(201,168,76,0.03)',
            padding: '12px 14px',
          }}
        >
          <span
            style={{
              fontFamily: 'Cormorant, serif',
              fontStyle: 'italic',
              fontSize: 13,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            При текущем темпе к 31 октября:{' '}
          </span>
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 13,
              color: '#e8c96a',
            }}
          >
            ${forecastUsd}
          </span>
        </div>
      </motion.section>

      {/* ── Deposits ─────────────────────────────────────────────────── */}
      <motion.section className="px-5 mt-4" variants={sectionVariants}>
        {/* Section divider */}
        <div className="flex items-center gap-3 mb-4">
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
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
              fontFamily: 'JetBrains Mono, monospace',
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
        <div>
          {DEPOSIT_MONTHS.map((m) => {
            const done = store.deposits[m.month] ?? false
            const isCurrent = m.month === currentMonth && !done
            const isLast = m.month === lastMonth.month
            const isFuture = m.month > currentMonth && !isLast
            const amountUsd = (m.amount / store.exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })

            return (
              <motion.button
                key={m.month}
                onClick={() => handleDepositToggle(m.month)}
                className="w-full text-left"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 4px',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  opacity: isFuture ? 0.55 : 1,
                  ...(isLast && !isFuture
                    ? { backgroundColor: 'rgba(201,168,76,0.04)', borderRadius: 6 }
                    : {}),
                }}
                whileTap={{ scale: 0.985 }}
              >
                {/* Left: checkbox + month */}
                <div className="flex items-center gap-3">
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 4,
                      border: `1.5px solid ${
                        done
                          ? '#e8c96a'
                          : isCurrent
                            ? '#e8c96a'
                            : 'rgba(255,255,255,0.15)'
                      }`,
                      backgroundColor: done ? 'rgba(232,201,106,0.15)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      color: '#e8c96a',
                    }}
                  >
                    {done && '✓'}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        fontFamily: 'JetBrains Mono, monospace',
                        fontSize: 13,
                        color: isLast ? '#e8c96a' : 'rgba(255,255,255,0.85)',
                      }}
                    >
                      {m.label}
                    </span>
                    {isCurrent && (
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 9,
                          color: '#e8c96a',
                          letterSpacing: 1,
                        }}
                      >
                        СЛЕДУЮЩИЙ
                      </span>
                    )}
                    {isLast && (
                      <span
                        style={{
                          fontFamily: 'JetBrains Mono, monospace',
                          fontSize: 9,
                          color: '#e8c96a',
                          letterSpacing: 1,
                        }}
                      >
                        ФИНАЛЬНЫЙ
                      </span>
                    )}
                  </div>
                </div>

                {/* Right: amount */}
                <div className="text-right">
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 14,
                      color: isLast ? '#e8c96a' : 'rgba(255,255,255,0.85)',
                    }}
                  >
                    {m.amount.toLocaleString('ru-RU')} ₽
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.3)',
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
      <motion.section className="px-5 mt-8" variants={sectionVariants}>
        {/* Section divider */}
        <div className="flex items-center gap-3 mb-4">
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
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
        <div className="space-y-3">
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
                className="w-full text-left"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  backgroundColor: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  borderRadius: 10,
                  padding: '14px 16px',
                }}
                whileTap={{ scale: 0.985 }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 13,
                      color: 'rgba(255,255,255,0.85)',
                      marginBottom: 4,
                    }}
                  >
                    {p.label}
                  </div>
                  <div
                    style={{
                      fontFamily: 'JetBrains Mono, monospace',
                      fontSize: 11,
                      color: 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {p.amount.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: 'JetBrains Mono, monospace',
                    fontSize: 9,
                    borderRadius: 20,
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: `1px solid ${statusStyle.border}`,
                    padding: '4px 10px',
                    letterSpacing: 0.5,
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
      <motion.section className="px-5 mt-8" variants={sectionVariants}>
        <div
          style={{
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
            borderRadius: 10,
            padding: '14px 16px',
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 9,
              letterSpacing: 2,
              color: 'rgba(255,255,255,0.35)',
              marginBottom: 8,
            }}
          >
            ИЗМЕНИТЬ НАКОПЛЕНИЯ
          </div>

          {editingSaved ? (
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={savedInput}
                onChange={e => setSavedInput(e.target.value)}
                className="flex-1 outline-none"
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14,
                  color: '#e8c96a',
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  borderRadius: 6,
                  padding: '6px 10px',
                }}
              />
              <button
                onClick={handleSaveSaved}
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: '#e8c96a',
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
            <div className="flex items-center justify-between">
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 14,
                  color: 'rgba(255,255,255,0.7)',
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
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 11,
                  color: 'rgba(201,168,76,0.6)',
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
    </motion.div>
  )
}
