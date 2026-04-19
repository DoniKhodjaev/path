import { useState } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { TEST_CHECKLIST, SPECIALIST_LIST } from '../../utils/healthConstants'
import { todayStr } from '../../utils/dates'

export function Doctors() {
  const health = useHealthStore()
  const [showAddVisit, setShowAddVisit] = useState(false)
  const [showAddResult, setShowAddResult] = useState(false)
  const [visitForm, setVisitForm] = useState({
    date: todayStr(), time: '10:00', specialist: SPECIALIST_LIST[0],
    clinic: '', reason: '', notes: '', nextStep: '',
  })
  const [resultForm, setResultForm] = useState({
    testName: '', value: '', unit: '', normalMin: '', normalMax: '', source: '',
  })

  const handleAddVisit = () => {
    health.addDoctorVisit({
      id: Date.now().toString(),
      ...visitForm,
      status: 'planned',
    })
    setShowAddVisit(false)
    setVisitForm({ date: todayStr(), time: '10:00', specialist: SPECIALIST_LIST[0], clinic: '', reason: '', notes: '', nextStep: '' })
  }

  const handleAddResult = () => {
    const val = Number(resultForm.value)
    const min = Number(resultForm.normalMin)
    const max = Number(resultForm.normalMax)
    health.addTestResult({
      id: Date.now().toString(),
      date: todayStr(),
      testName: resultForm.testName,
      value: val,
      unit: resultForm.unit,
      normalMin: min,
      normalMax: max,
      status: val < min ? 'low' : val > max ? 'high' : 'normal',
      source: resultForm.source,
    })
    setShowAddResult(false)
    setResultForm({ testName: '', value: '', unit: '', normalMin: '', normalMax: '', source: '' })
  }

  const inputCls = "w-full bg-navy-3 rounded px-3 py-2 font-mono text-sm text-txt outline-none border border-navy-3 focus:border-gold/50"

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-xl text-txt">Анализы и врачи</h2>

      {/* Test checklist */}
      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <p className="font-mono text-xs text-txt/60 uppercase tracking-wider mb-3">Чек-лист анализов</p>
        <div className="space-y-2">
          {TEST_CHECKLIST.map(test => {
            const done = health.testChecklist[test] ?? false
            return (
              <button key={test} onClick={() => health.toggleTestChecklist(test)}
                className="flex items-center gap-3 w-full text-left">
                <span className={`w-5 h-5 rounded border-2 flex items-center justify-center text-xs ${
                  done ? 'bg-accent-green/20 border-accent-green text-accent-green' : 'border-navy-3'
                }`}>{done ? '✓' : ''}</span>
                <span className={`font-mono text-sm ${done ? 'text-txt/40 line-through' : 'text-txt'}`}>{test}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Doctor visits */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="font-mono text-xs text-txt/60 uppercase tracking-wider">Записи к врачам</p>
          <button onClick={() => setShowAddVisit(!showAddVisit)}
            className="font-mono text-xs text-gold">{showAddVisit ? 'Отмена' : '+ Добавить'}</button>
        </div>

        {showAddVisit && (
          <div className="bg-navy-2 rounded-xl p-4 border border-gold/20 space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <input type="date" value={visitForm.date} onChange={e => setVisitForm({...visitForm, date: e.target.value})} className={inputCls} />
              <input type="time" value={visitForm.time} onChange={e => setVisitForm({...visitForm, time: e.target.value})} className={inputCls} />
            </div>
            <select value={visitForm.specialist} onChange={e => setVisitForm({...visitForm, specialist: e.target.value})} className={inputCls}>
              {SPECIALIST_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Клиника" value={visitForm.clinic} onChange={e => setVisitForm({...visitForm, clinic: e.target.value})} className={inputCls} />
            <input placeholder="Причина визита" value={visitForm.reason} onChange={e => setVisitForm({...visitForm, reason: e.target.value})} className={inputCls} />
            <button onClick={handleAddVisit} className="w-full py-2 bg-gold/20 text-gold font-mono text-sm rounded">Добавить запись</button>
          </div>
        )}

        <div className="space-y-2">
          {health.doctorVisits.sort((a, b) => a.date.localeCompare(b.date)).map(visit => {
            const statusColors = { planned: 'text-accent-blue', visited: 'text-accent-green', cancelled: 'text-accent-red' }
            const statusLabels = { planned: 'Запланировано', visited: 'Прошёл', cancelled: 'Отменён' }
            return (
              <div key={visit.id} className="bg-navy-2 rounded-xl p-4 border border-navy-3">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-mono text-sm text-txt">{visit.date} {visit.time}</p>
                    <p className="font-heading text-base text-txt">{visit.specialist} — {visit.clinic}</p>
                    {visit.reason && <p className="font-mono text-xs text-txt/50 mt-1">{visit.reason}</p>}
                    {visit.notes && <p className="font-mono text-xs text-txt/40 mt-1 italic">{visit.notes}</p>}
                  </div>
                  <span className={`font-mono text-[10px] ${statusColors[visit.status]}`}>{statusLabels[visit.status]}</span>
                </div>
                {visit.status === 'planned' && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => health.updateDoctorVisit(visit.id, { status: 'visited' })}
                      className="flex-1 py-1.5 bg-accent-green/10 text-accent-green font-mono text-xs rounded">Прошёл</button>
                    <button onClick={() => health.updateDoctorVisit(visit.id, { status: 'cancelled' })}
                      className="flex-1 py-1.5 bg-accent-red/10 text-accent-red font-mono text-xs rounded">Отменён</button>
                  </div>
                )}
                {visit.status === 'visited' && !visit.notes && (
                  <button onClick={() => {
                    const note = prompt('Заметка после визита:')
                    if (note) health.updateDoctorVisit(visit.id, { notes: note })
                  }}
                    className="mt-2 font-mono text-xs text-gold/60 hover:text-gold">+ Добавить заметку</button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Test results */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="font-mono text-xs text-txt/60 uppercase tracking-wider">Результаты анализов</p>
          <button onClick={() => setShowAddResult(!showAddResult)}
            className="font-mono text-xs text-gold">{showAddResult ? 'Отмена' : '+ Добавить'}</button>
        </div>

        {showAddResult && (
          <div className="bg-navy-2 rounded-xl p-4 border border-gold/20 space-y-3 mb-3">
            <input placeholder="Название (ТТГ, Витамин D...)" value={resultForm.testName}
              onChange={e => setResultForm({...resultForm, testName: e.target.value})} className={inputCls} />
            <div className="grid grid-cols-3 gap-2">
              <input placeholder="Значение" type="number" value={resultForm.value}
                onChange={e => setResultForm({...resultForm, value: e.target.value})} className={inputCls} />
              <input placeholder="Ед." value={resultForm.unit}
                onChange={e => setResultForm({...resultForm, unit: e.target.value})} className={inputCls} />
              <input placeholder="Источник" value={resultForm.source}
                onChange={e => setResultForm({...resultForm, source: e.target.value})} className={inputCls} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Норма мин" type="number" value={resultForm.normalMin}
                onChange={e => setResultForm({...resultForm, normalMin: e.target.value})} className={inputCls} />
              <input placeholder="Норма макс" type="number" value={resultForm.normalMax}
                onChange={e => setResultForm({...resultForm, normalMax: e.target.value})} className={inputCls} />
            </div>
            <button onClick={handleAddResult} className="w-full py-2 bg-gold/20 text-gold font-mono text-sm rounded">Сохранить результат</button>
          </div>
        )}

        <div className="space-y-2">
          {health.testResults.sort((a, b) => b.date.localeCompare(a.date)).map(r => {
            const pct = ((r.value - r.normalMin) / (r.normalMax - r.normalMin)) * 100
            const statusColor = r.status === 'normal' ? 'accent-green' : r.status === 'high' ? 'accent-red' : 'gold'
            return (
              <div key={r.id} className="bg-navy-2 rounded-xl p-4 border border-navy-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-sm text-txt">{r.testName}</span>
                  <span className="font-mono text-xs text-txt/40">{r.date}</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`font-mono text-lg font-bold text-${statusColor}`}>{r.value}</span>
                  <span className="font-mono text-xs text-txt/40">{r.unit}</span>
                </div>
                {/* Reference range bar */}
                <div className="relative h-2 bg-navy-3 rounded-full mt-2">
                  <div className="absolute h-full bg-accent-green/30 rounded-full" style={{ left: '0%', width: '100%' }} />
                  <div className={`absolute w-2 h-2 rounded-full bg-${statusColor} top-0`}
                    style={{ left: `${Math.min(100, Math.max(0, pct))}%`, transform: 'translateX(-50%)' }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-mono text-[10px] text-txt/30">{r.normalMin}</span>
                  <span className="font-mono text-[10px] text-txt/30">{r.normalMax}</span>
                </div>
                {r.source && <p className="font-mono text-[10px] text-txt/30 mt-1">{r.source}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
