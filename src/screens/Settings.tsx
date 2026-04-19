import { useState } from 'react'
import { useStore } from '../store/useStore'
import { useNotifications } from '../hooks/useNotifications'
import { CITIES } from '../utils/constants'
import { Levels } from './Levels'
import { Plan } from './Plan'

type SettingsSub = 'main' | 'levels' | 'plan'

const CALC_METHODS = [
  { id: 'MuslimWorldLeague', label: 'Muslim World League' },
  { id: 'Egyptian', label: 'Egyptian General Authority' },
  { id: 'Karachi', label: 'University of Karachi' },
  { id: 'Tehran', label: 'Institute of Geophysics, Tehran' },
  { id: 'MoonsightingCommittee', label: 'Moonsighting Committee' },
]

export function Settings() {
  const store = useStore()
  const { notificationSettings, setNotificationSettings, requestPermission, subscribe } = useNotifications()
  const [showReset, setShowReset] = useState(false)
  const [sub, setSub] = useState<SettingsSub>('main')

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = CITIES.find(c => c.name === e.target.value)
    if (city) store.setCity(city.name, city.lat, city.lon)
  }

  const handleNotificationToggle = async (key: keyof typeof notificationSettings) => {
    const newVal = !notificationSettings[key]
    setNotificationSettings({ [key]: newVal })
    if (newVal) {
      const granted = await requestPermission()
      if (granted) await subscribe()
    }
  }

  const notifOptions = [
    { key: 'prayers' as const, label: 'Время намазов (за 10 мин)' },
    { key: 'sleep' as const, label: 'Напоминание лечь спать (22:45)' },
    { key: 'deposit' as const, label: 'Ежемесячный депозит (1-е число)' },
    { key: 'morning' as const, label: 'Утренний чеклист (06:00)' },
  ]

  if (sub !== 'main') {
    return (
      <div>
        <div className="px-4 pt-4">
          <button onClick={() => setSub('main')} className="font-mono text-xs text-gold/60 hover:text-gold mb-2 flex items-center gap-1">
            ← Настройки
          </button>
        </div>
        {sub === 'levels' && <Levels />}
        {sub === 'plan' && <Plan />}
      </div>
    )
  }

  return (
    <div className="p-4 pb-20 space-y-6">
      <h1 className="font-heading text-2xl text-gold">Настройки</h1>

      {/* Sub-screen links */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setSub('levels')}
          className="bg-navy-2 rounded-xl p-4 border border-navy-3 hover:border-gold/20 transition-colors text-left">
          <span className="text-2xl">⭐</span>
          <p className="font-mono text-sm text-txt mt-2">Уровни и награды</p>
        </button>
        <button onClick={() => setSub('plan')}
          className="bg-navy-2 rounded-xl p-4 border border-navy-3 hover:border-gold/20 transition-colors text-left">
          <span className="text-2xl">📋</span>
          <p className="font-mono text-sm text-txt mt-2">Мой план</p>
        </button>
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <label className="font-mono text-xs text-txt/60 block mb-2">Город</label>
        <select value={store.city} onChange={handleCityChange}
          className="w-full bg-navy-3 rounded px-3 py-2 font-mono text-sm text-txt outline-none border border-navy-3 focus:border-gold/50">
          {CITIES.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
        </select>
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <label className="font-mono text-xs text-txt/60 block mb-2">Метод расчёта намазов</label>
        <select value={store.calculationMethod} onChange={e => store.setCalculationMethod(e.target.value)}
          className="w-full bg-navy-3 rounded px-3 py-2 font-mono text-sm text-txt outline-none border border-navy-3 focus:border-gold/50">
          {CALC_METHODS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <label className="font-mono text-xs text-txt/60 block mb-2">Курс доллара (₽)</label>
        <input type="number" value={store.exchangeRate}
          onChange={e => store.setExchangeRate(Number(e.target.value) || 85)}
          className="w-full bg-navy-3 rounded px-3 py-2 font-mono text-sm text-txt outline-none border border-navy-3 focus:border-gold/50" />
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <label className="font-mono text-xs text-txt/60 block mb-3">Push-уведомления</label>
        <div className="space-y-3">
          {notifOptions.map(({ key, label }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="font-mono text-sm text-txt">{label}</span>
              <button onClick={() => handleNotificationToggle(key)}
                className={`w-11 h-6 rounded-full transition-colors relative ${
                  notificationSettings[key] ? 'bg-gold' : 'bg-navy-3'
                }`}>
                <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-transform ${
                  notificationSettings[key] ? 'translate-x-5.5' : 'translate-x-0.5'
                }`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-accent-red/20">
        {showReset ? (
          <div className="space-y-3">
            <p className="font-mono text-sm text-accent-red">Вы уверены? Все данные будут удалены.</p>
            <div className="flex gap-2">
              <button onClick={() => { store.resetAll(); setShowReset(false) }}
                className="flex-1 py-2 bg-accent-red/20 text-accent-red font-mono text-sm rounded">Да, сбросить</button>
              <button onClick={() => setShowReset(false)}
                className="flex-1 py-2 bg-navy-3 text-txt font-mono text-sm rounded">Отмена</button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowReset(true)}
            className="w-full font-mono text-sm text-accent-red/60 hover:text-accent-red">Сбросить все данные</button>
        )}
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <p className="font-mono text-xs text-txt/40">Путь 2026 v1.0.0</p>
        <p className="font-mono text-xs text-txt/30 mt-1">Персональный трекер целей Дониёра</p>
      </div>
    </div>
  )
}
