import { useState } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { VITAMIN_INFO } from '../../utils/healthConstants'
import { todayStr, getLast7Days } from '../../utils/dates'

export function Vitamins() {
  const health = useHealthStore()
  const today = todayStr()
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({ name: '', dosage: '', timing: 'утром с едой', courseEnd: '' })

  const handleAdd = () => {
    health.addMedication({
      id: Date.now().toString(),
      name: form.name,
      dosage: form.dosage,
      timing: form.timing,
      courseEnd: form.courseEnd,
      takenDays: {},
    })
    setShowAdd(false)
    setForm({ name: '', dosage: '', timing: 'утром с едой', courseEnd: '' })
  }

  const last7 = getLast7Days()
  const inputCls = "w-full bg-navy-3 rounded px-3 py-2 font-mono text-sm text-txt outline-none border border-navy-3 focus:border-gold/50"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="font-heading text-xl text-txt">Витамины и лекарства</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="font-mono text-xs text-gold">
          {showAdd ? 'Отмена' : '+ Добавить'}
        </button>
      </div>

      {showAdd && (
        <div className="bg-navy-2 rounded-xl p-4 border border-gold/20 space-y-3">
          <input placeholder="Название (Витамин D3)" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} className={inputCls} />
          <input placeholder="Дозировка (5000 МЕ)" value={form.dosage}
            onChange={e => setForm({...form, dosage: e.target.value})} className={inputCls} />
          <input placeholder="Когда (утром с едой)" value={form.timing}
            onChange={e => setForm({...form, timing: e.target.value})} className={inputCls} />
          <div>
            <label className="font-mono text-[10px] text-txt/40 block mb-1">Курс до</label>
            <input type="date" value={form.courseEnd}
              onChange={e => setForm({...form, courseEnd: e.target.value})} className={inputCls} />
          </div>
          <button onClick={handleAdd} className="w-full py-2 bg-gold/20 text-gold font-mono text-sm rounded">Добавить</button>
        </div>
      )}

      {/* Medication cards */}
      {health.medications.map(med => {
        const daysLeft = med.courseEnd
          ? Math.max(0, Math.ceil((new Date(med.courseEnd).getTime() - Date.now()) / 86_400_000))
          : null
        const takenToday = med.takenDays[today] ?? false
        const streak = (() => {
          let count = 0
          for (let i = 0; i < 30; i++) {
            const d = new Date()
            d.setDate(d.getDate() - i)
            const ds = d.toISOString().slice(0, 10)
            if (med.takenDays[ds]) count++
            else break
          }
          return count
        })()

        return (
          <div key={med.id} className="bg-navy-2 rounded-xl p-4 border border-navy-3 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-heading text-base text-txt">{med.name}</p>
                <p className="font-mono text-xs text-txt/50">{med.dosage} · {med.timing}</p>
              </div>
              <button onClick={() => health.removeMedication(med.id)}
                className="font-mono text-xs text-accent-red/40 hover:text-accent-red">×</button>
            </div>

            {daysLeft !== null && (
              <p className="font-mono text-xs text-txt/40">
                Курс до {med.courseEnd} · осталось {daysLeft} дней
              </p>
            )}

            {/* Today's toggle */}
            <button onClick={() => health.toggleMedicationDay(med.id, today)}
              className={`w-full py-2.5 rounded font-mono text-sm transition-all ${
                takenToday
                  ? 'bg-accent-green/20 text-accent-green border border-accent-green/30'
                  : 'bg-navy-3 text-txt/60 hover:text-gold hover:border-gold/30 border border-navy-3'
              }`}>
              {takenToday ? '✓ Принято сегодня' : 'Отметить приём'}
            </button>

            {/* 7-day streak */}
            <div className="flex gap-1">
              {last7.map(date => (
                <div key={date} className={`flex-1 h-2 rounded-sm ${
                  med.takenDays[date] ? 'bg-accent-green' : 'bg-navy-3/60'
                }`} />
              ))}
            </div>
            {streak > 0 && (
              <p className="font-mono text-[10px] text-accent-green">{streak} дней подряд</p>
            )}
          </div>
        )
      })}

      {health.medications.length === 0 && !showAdd && (
        <div className="bg-navy-2 rounded-xl p-6 border border-navy-3 text-center">
          <p className="font-mono text-sm text-txt/40">Пока ничего не назначено</p>
          <p className="font-mono text-xs text-txt/30 mt-1">Добавьте после визита к врачу</p>
        </div>
      )}

      {/* Vitamin info reference */}
      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <p className="font-mono text-xs text-txt/60 uppercase tracking-wider mb-3">Справочник</p>
        <div className="space-y-3">
          {Object.entries(VITAMIN_INFO).map(([name, info]) => (
            <div key={name}>
              <p className="font-mono text-sm text-gold">{name}</p>
              <p className="font-mono text-xs text-txt/50 leading-relaxed">{info}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
