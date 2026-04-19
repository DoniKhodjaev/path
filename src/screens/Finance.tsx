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
  waiting: 'Ожидается',
  received: 'Получено',
  deposited: 'На депозите',
}

const STATUS_COLORS: Record<PaymentStatus, string> = {
  waiting: 'text-ink-mute',
  received: 'text-calm',
  deposited: 'text-sacred',
}

const STATUS_BG: Record<PaymentStatus, string> = {
  waiting: 'bg-dusk/40',
  received: 'bg-calm/10',
  deposited: 'bg-sacred/10',
}

const NEXT_STATUS: Record<PaymentStatus, PaymentStatus> = {
  waiting: 'received',
  received: 'deposited',
  deposited: 'waiting',
}

/* ─── component ────────────────────────────────────────────────────────── */
export function Finance() {
  const store = useStore()
  const { awardPoints, checkAndAwardBadges } = useGamification()
  const [editingSaved, setEditingSaved] = useState(false)
  const [savedInput, setSavedInput] = useState(String(store.currentSaved))

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
      className="pb-24 space-y-8 min-h-screen"
      variants={staggerContainer}
      initial="initial"
      animate="animate"
    >
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <motion.section
        className="px-5 pt-8 pb-6"
        variants={heroVariants}
      >
        {/* Micro label */}
        <p className="text-micro uppercase tracking-widest text-gold mb-3">Накоплено</p>

        {/* Big dollar figure */}
        <div className="font-mono text-[56px] text-gold-hi tabular-nums leading-none font-light mb-2">
          ${usdDisplay}
        </div>

        {/* Progress label */}
        <p className="text-micro text-ink-mute mb-5">
          {progressPct.toFixed(1)}% к цели
        </p>

        {/* Gold gradient progress bar */}
        <div className="relative h-[3px] bg-dusk rounded-full overflow-hidden mb-3">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background: 'linear-gradient(90deg, var(--color-amber), var(--color-gold-hi))',
            }}
            variants={barVariants}
            initial="initial"
            animate="animate"
            custom={progressPct}
          />
        </div>

        {/* Bar legends */}
        <div className="flex justify-between font-mono text-sm text-ink-mute tabular-nums">
          <span>{rubDisplay} ₽</span>
          <span>${FINANCIAL_GOAL_USD.toLocaleString('en-US')} цель</span>
        </div>

        {/* Edit saved */}
        <div className="mt-4">
          {editingSaved ? (
            <div className="flex gap-2">
              <input
                type="number"
                value={savedInput}
                onChange={e => setSavedInput(e.target.value)}
                className="flex-1 bg-twilight rounded-lg px-3 py-1.5 font-mono text-sm text-txt outline-none border border-dusk focus:border-gold/30 tabular-nums transition-colors"
              />
              <button
                onClick={handleSaveSaved}
                className="px-3 py-1.5 bg-gold/15 text-gold font-mono text-sm rounded-lg border border-gold/20 hover:bg-gold/25 transition-colors"
              >
                ОК
              </button>
            </div>
          ) : (
            <button
              onClick={() => { setSavedInput(String(totalSaved)); setEditingSaved(true) }}
              className="text-micro text-gold/60 hover:text-gold transition-colors"
            >
              Изменить сумму накоплений
            </button>
          )}
        </div>

        {/* Forecast — italic serif */}
        <p className="mt-5 font-serif italic text-sm text-ink-mute leading-snug">
          При текущем темпе к 31 октября: ${forecastUsd}
        </p>
      </motion.section>

      {/* ── Deposits ──────────────────────────────────────────────────── */}
      <motion.section className="px-5" variants={sectionVariants}>
        <div className="separator-ornament mb-4">
          <span className="text-micro uppercase tracking-widest text-gold/70 px-3">Депозиты</span>
        </div>

        <div className="bg-twilight rounded-2xl border border-dusk overflow-hidden">
          {DEPOSIT_MONTHS.map((m, i) => {
            const done = store.deposits[m.month] ?? false
            return (
              <motion.button
                key={m.month}
                onClick={() => handleDepositToggle(m.month)}
                className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-dusk/50 active:bg-dusk/70 transition-colors text-left${
                  i !== 0 ? ' border-t border-dusk' : ''
                }`}
                whileTap={{ scale: 0.985 }}
              >
                <span className="font-mono text-sm text-txt">{m.label}</span>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-sm text-ink-mute tabular-nums">
                    {m.amount.toLocaleString('ru-RU')} ₽
                  </span>
                  {done ? (
                    <span className="text-sacred text-base leading-none select-none">✓</span>
                  ) : (
                    <span className="text-dusk text-base leading-none select-none">○</span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </div>
      </motion.section>

      {/* ── Special Payments ──────────────────────────────────────────── */}
      <motion.section className="px-5" variants={sectionVariants}>
        <div className="separator-ornament mb-4">
          <span className="text-micro uppercase tracking-widest text-gold/70 px-3">Разовые выплаты</span>
        </div>

        <div className="bg-twilight rounded-2xl border border-dusk overflow-hidden">
          {SPECIAL_PAYMENTS.map((p, i) => {
            const status = (store.specialPayments[p.id] || 'waiting') as PaymentStatus
            return (
              <motion.button
                key={p.id}
                onClick={() => {
                  hapticTap()
                  store.setSpecialPayment(p.id, NEXT_STATUS[status])
                }}
                className={`w-full flex items-center justify-between px-4 py-3.5 hover:bg-dusk/50 active:bg-dusk/70 transition-colors text-left${
                  i !== 0 ? ' border-t border-dusk' : ''
                }`}
                whileTap={{ scale: 0.985 }}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono text-sm text-txt">{p.label}</span>
                  <span className="font-mono text-xs text-ink-mute tabular-nums">
                    {p.amount.toLocaleString('ru-RU')} ₽
                  </span>
                </div>
                <span
                  className={`font-mono text-xs px-2.5 py-1 rounded-full ${STATUS_COLORS[status]} ${STATUS_BG[status]}`}
                >
                  {STATUS_LABELS[status]}
                </span>
              </motion.button>
            )
          })}
        </div>
      </motion.section>

      {/* ── Exchange Rate ─────────────────────────────────────────────── */}
      <motion.section className="px-5" variants={sectionVariants}>
        <div className="bg-twilight rounded-xl border border-dusk p-4">
          <label className="text-micro text-ink-mute block mb-2">Курс $/₽</label>
          <input
            type="number"
            value={store.exchangeRate}
            onChange={e => store.setExchangeRate(Number(e.target.value) || 85)}
            className="w-full bg-dusk rounded-lg border border-dusk focus:border-gold/30 px-3 py-2 font-mono text-sm text-txt outline-none tabular-nums transition-colors"
          />
        </div>
      </motion.section>
    </motion.div>
  )
}
