import { useState } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { TEST_CHECKLIST, SPECIALIST_LIST } from '../../utils/healthConstants'
import { todayStr } from '../../utils/dates'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-dusk)',
  borderRadius: 8,
  padding: '10px 12px',
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 13,
  color: 'var(--text-primary)',
  outline: 'none',
  border: '1px solid var(--border-muted)',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  letterSpacing: 2,
  color: 'var(--text-faint)',
  textTransform: 'uppercase',
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface-overlay)',
  borderRadius: 16,
  padding: 16,
  border: '1px solid var(--border-muted)',
}

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 24, color: 'var(--gold-text)', margin: 0 }}>Анализы и врачи</h2>

      {/* Test checklist */}
      <div style={cardStyle}>
        <p style={{ ...sectionLabel, marginBottom: 12 }}>Чек-лист анализов</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {TEST_CHECKLIST.map(test => {
            const done = health.testChecklist[test] ?? false
            return (
              <button key={test} onClick={() => health.toggleTestChecklist(test)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                  background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 4, border: done ? '2px solid #4caf82' : '2px solid #151d35',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12,
                  background: done ? 'rgba(76,175,130,0.2)' : 'transparent', color: '#4caf82',
                  flexShrink: 0,
                }}>{done ? '✓' : ''}</span>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 13,
                  color: done ? 'var(--text-faint)' : 'var(--text-secondary)',
                  textDecoration: done ? 'line-through' : 'none',
                }}>{test}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Doctor visits */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={sectionLabel}>Записи к врачам</p>
          <button onClick={() => setShowAddVisit(!showAddVisit)}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#c9a84c', background: 'none', border: 'none', cursor: 'pointer' }}>
            {showAddVisit ? 'Отмена' : '+ Добавить'}
          </button>
        </div>

        {showAddVisit && (
          <div style={{ ...cardStyle, border: '1px solid rgba(201,168,76,0.2)', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input type="date" value={visitForm.date} onChange={e => setVisitForm({...visitForm, date: e.target.value})} style={inputStyle} />
              <input type="time" value={visitForm.time} onChange={e => setVisitForm({...visitForm, time: e.target.value})} style={inputStyle} />
            </div>
            <select value={visitForm.specialist} onChange={e => setVisitForm({...visitForm, specialist: e.target.value})} style={inputStyle}>
              {SPECIALIST_LIST.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <input placeholder="Клиника" value={visitForm.clinic} onChange={e => setVisitForm({...visitForm, clinic: e.target.value})} style={inputStyle} />
            <input placeholder="Причина визита" value={visitForm.reason} onChange={e => setVisitForm({...visitForm, reason: e.target.value})} style={inputStyle} />
            <button onClick={handleAddVisit} style={{
              width: '100%', padding: '10px 0', background: 'rgba(201,168,76,0.2)', color: '#c9a84c',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer',
            }}>Добавить запись</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {health.doctorVisits.sort((a, b) => a.date.localeCompare(b.date)).map(visit => {
            const statusColors: Record<string, string> = { planned: '#5a9ae0', visited: '#4caf82', cancelled: '#e05a5a' }
            const statusLabels: Record<string, string> = { planned: 'Запланировано', visited: 'Прошёл', cancelled: 'Отменён' }
            return (
              <div key={visit.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>{visit.date} {visit.time}</p>
                    <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'var(--text-secondary)', margin: '2px 0 0' }}>{visit.specialist} — {visit.clinic}</p>
                    {visit.reason && <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>{visit.reason}</p>}
                    {visit.notes && <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-faint)', marginTop: 4, fontStyle: 'italic' }}>{visit.notes}</p>}
                  </div>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: statusColors[visit.status] }}>{statusLabels[visit.status]}</span>
                </div>
                {visit.status === 'planned' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => health.updateDoctorVisit(visit.id, { status: 'visited' })}
                      style={{ flex: 1, padding: '6px 0', background: 'rgba(76,175,130,0.1)', color: '#4caf82', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Прошёл</button>
                    <button onClick={() => health.updateDoctorVisit(visit.id, { status: 'cancelled' })}
                      style={{ flex: 1, padding: '6px 0', background: 'rgba(224,90,90,0.1)', color: '#e05a5a', fontFamily: "'JetBrains Mono', monospace", fontSize: 12, borderRadius: 8, border: 'none', cursor: 'pointer' }}>Отменён</button>
                  </div>
                )}
                {visit.status === 'visited' && !visit.notes && (
                  <button onClick={() => {
                    const note = prompt('Заметка после визита:')
                    if (note) health.updateDoctorVisit(visit.id, { notes: note })
                  }}
                    style={{ marginTop: 8, fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--gold-text-label)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>+ Добавить заметку</button>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Test results */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={sectionLabel}>Результаты анализов</p>
          <button onClick={() => setShowAddResult(!showAddResult)}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: '#c9a84c', background: 'none', border: 'none', cursor: 'pointer' }}>
            {showAddResult ? 'Отмена' : '+ Добавить'}
          </button>
        </div>

        {showAddResult && (
          <div style={{ ...cardStyle, border: '1px solid rgba(201,168,76,0.2)', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            <input placeholder="Название (ТТГ, Витамин D...)" value={resultForm.testName}
              onChange={e => setResultForm({...resultForm, testName: e.target.value})} style={inputStyle} />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
              <input placeholder="Значение" type="number" value={resultForm.value}
                onChange={e => setResultForm({...resultForm, value: e.target.value})} style={inputStyle} />
              <input placeholder="Ед." value={resultForm.unit}
                onChange={e => setResultForm({...resultForm, unit: e.target.value})} style={inputStyle} />
              <input placeholder="Источник" value={resultForm.source}
                onChange={e => setResultForm({...resultForm, source: e.target.value})} style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input placeholder="Норма мин" type="number" value={resultForm.normalMin}
                onChange={e => setResultForm({...resultForm, normalMin: e.target.value})} style={inputStyle} />
              <input placeholder="Норма макс" type="number" value={resultForm.normalMax}
                onChange={e => setResultForm({...resultForm, normalMax: e.target.value})} style={inputStyle} />
            </div>
            <button onClick={handleAddResult} style={{
              width: '100%', padding: '10px 0', background: 'rgba(201,168,76,0.2)', color: '#c9a84c',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer',
            }}>Сохранить результат</button>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {health.testResults.sort((a, b) => b.date.localeCompare(a.date)).map(r => {
            const pct = ((r.value - r.normalMin) / (r.normalMax - r.normalMin)) * 100
            const statusColorMap: Record<string, string> = { normal: '#4caf82', high: '#e05a5a', low: '#c9a84c' }
            const statusColor = statusColorMap[r.status] || '#c9a84c'
            return (
              <div key={r.id} style={cardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: 'var(--text-secondary)' }}>{r.testName}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-faint)' }}>{r.date}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 700, color: statusColor }}>{r.value}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'var(--text-faint)' }}>{r.unit}</span>
                </div>
                {/* Reference range bar */}
                <div style={{ position: 'relative', height: 8, background: 'var(--color-dusk)', borderRadius: 4, marginTop: 8 }}>
                  <div style={{ position: 'absolute', height: '100%', background: 'rgba(76,175,130,0.3)', borderRadius: 4, left: '0%', width: '100%' }} />
                  <div style={{
                    position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: statusColor, top: 0,
                    left: `${Math.min(100, Math.max(0, pct))}%`, transform: 'translateX(-50%)',
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-faint)' }}>{r.normalMin}</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-faint)' }}>{r.normalMax}</span>
                </div>
                {r.source && <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-faint)', marginTop: 4 }}>{r.source}</p>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
