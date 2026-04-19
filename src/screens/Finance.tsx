import { useState } from 'react'
import { useStore } from '../store/useStore'
import { FinanceBar } from '../components/FinanceBar'
import { useGamification } from '../hooks/useGamification'
import { DEPOSIT_MONTHS, SPECIAL_PAYMENTS, FINANCIAL_GOAL_USD } from '../utils/constants'

export function Finance() {
  const store = useStore()
  const { awardPoints, checkAndAwardBadges } = useGamification()
  const [editingSaved, setEditingSaved] = useState(false)
  const [savedInput, setSavedInput] = useState(String(store.currentSaved))

  const totalFromDeposits = DEPOSIT_MONTHS.filter(m => store.deposits[m.month]).reduce((sum, m) => sum + m.amount, 0)
  const totalFromSpecial = SPECIAL_PAYMENTS.filter(p => store.specialPayments[p.id] === 'deposited').reduce((sum, p) => sum + p.amount, 0)
  const totalSaved = store.currentSaved || (totalFromDeposits + totalFromSpecial)
  const inUsd = totalSaved / store.exchangeRate
  const progressPct = (inUsd / FINANCIAL_GOAL_USD) * 100

  const monthsDone = DEPOSIT_MONTHS.filter(m => store.deposits[m.month]).length
  const monthsLeft = DEPOSIT_MONTHS.length - monthsDone
  const forecast = totalSaved + monthsLeft * 100000 +
    SPECIAL_PAYMENTS.filter(p => store.specialPayments[p.id] === 'waiting').reduce((s, p) => s + p.amount, 0)

  const handleDepositToggle = (month: string) => {
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

  return (
    <div className="p-4 pb-20 space-y-6">
      <h1 className="font-heading text-2xl text-gold">Финансы</h1>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3 space-y-3">
        <div className="flex justify-between items-center">
          <span className="font-mono text-sm text-txt">Накоплено</span>
          <span className="font-mono text-sm text-gold">{progressPct.toFixed(1)}%</span>
        </div>
        <FinanceBar label="" current={inUsd} target={FINANCIAL_GOAL_USD}
          format={(n) => `$${n.toLocaleString('en-US', { maximumFractionDigits: 0 })}`} />
        <div className="flex justify-between font-mono text-xs text-txt/60 pt-1">
          <span>{totalSaved.toLocaleString('ru-RU')} ₽</span>
          <span>${inUsd.toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
        </div>
        <div className="pt-2 border-t border-navy-3">
          {editingSaved ? (
            <div className="flex gap-2">
              <input type="number" value={savedInput} onChange={e => setSavedInput(e.target.value)}
                className="flex-1 bg-navy-3 rounded px-3 py-1.5 font-mono text-sm text-txt outline-none border border-navy-3 focus:border-gold/50" />
              <button onClick={handleSaveSaved}
                className="px-3 py-1.5 bg-gold/20 text-gold font-mono text-sm rounded">ОК</button>
            </div>
          ) : (
            <button onClick={() => { setSavedInput(String(totalSaved)); setEditingSaved(true) }}
              className="font-mono text-xs text-gold/60 hover:text-gold">Изменить сумму накоплений</button>
          )}
        </div>
        <p className="font-mono text-[11px] text-txt/40">
          Прогноз к октябрю: ${(forecast / store.exchangeRate).toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </p>
      </div>

      <div>
        <h2 className="font-heading text-lg text-txt mb-3">Ежемесячные депозиты</h2>
        <div className="bg-navy-2 rounded-xl border border-navy-3 divide-y divide-navy-3">
          {DEPOSIT_MONTHS.map((m) => {
            const done = store.deposits[m.month] ?? false
            return (
              <button key={m.month} onClick={() => handleDepositToggle(m.month)}
                className="w-full flex items-center justify-between p-3 hover:bg-navy-3/30 transition-colors">
                <span className="font-mono text-sm text-txt">{m.label}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs text-txt/60">{m.amount.toLocaleString('ru-RU')} ₽</span>
                  <span className={done ? 'text-accent-green' : 'text-txt/20'}>{done ? '✓' : '○'}</span>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg text-txt mb-3">Разовые выплаты</h2>
        <div className="bg-navy-2 rounded-xl border border-navy-3 divide-y divide-navy-3">
          {SPECIAL_PAYMENTS.map((p) => {
            const status = store.specialPayments[p.id] || 'waiting'
            const statusLabels = { waiting: 'Ожидается', received: 'Получено', deposited: 'На депозите' }
            const statusColors = { waiting: 'text-txt/40', received: 'text-accent-blue', deposited: 'text-accent-green' }
            const nextStatus: Record<string, 'waiting' | 'received' | 'deposited'> = {
              waiting: 'received', received: 'deposited', deposited: 'waiting',
            }
            return (
              <button key={p.id} onClick={() => store.setSpecialPayment(p.id, nextStatus[status])}
                className="w-full flex items-center justify-between p-3 hover:bg-navy-3/30 transition-colors">
                <div>
                  <span className="font-mono text-sm text-txt">{p.label}</span>
                  <span className="font-mono text-xs text-txt/40 ml-2">{p.amount.toLocaleString('ru-RU')} ₽</span>
                </div>
                <span className={`font-mono text-xs ${statusColors[status]}`}>{statusLabels[status]}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <label className="font-mono text-xs text-txt/60 block mb-2">Курс $/₽</label>
        <input type="number" value={store.exchangeRate}
          onChange={e => store.setExchangeRate(Number(e.target.value) || 85)}
          className="w-full bg-navy-3 rounded px-3 py-2 font-mono text-sm text-txt outline-none border border-navy-3 focus:border-gold/50" />
      </div>
    </div>
  )
}
