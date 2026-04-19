import { useState } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { VITAMIN_INFO } from '../../utils/healthConstants'
import { todayStr, getLast7Days } from '../../utils/dates'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--color-dusk)',
  borderRadius: 8,
  padding: '10px 12px',
  fontFamily: "'Inter', sans-serif",
  fontSize: 13,
  color: 'var(--text-primary)',
  outline: 'none',
  border: '1px solid var(--border-muted)',
  boxSizing: 'border-box' as const,
}

const cardStyle: React.CSSProperties = {
  background: 'var(--surface-overlay)',
  borderRadius: 16,
  padding: 16,
  border: '1px solid var(--border-muted)',
}

const sectionLabel: React.CSSProperties = {
  fontFamily: "'JetBrains Mono', monospace",
  fontSize: 9,
  letterSpacing: 2,
  color: 'var(--text-faint)',
  textTransform: 'uppercase',
}

const mono = "'JetBrains Mono', monospace"

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 24, color: 'var(--gold-text)', margin: 0 }}>Витамины и лекарства</h2>
        <button onClick={() => setShowAdd(!showAdd)} style={{
          fontFamily: mono, fontSize: 12, color: '#c9a84c', background: 'none', border: 'none', cursor: 'pointer',
        }}>
          {showAdd ? 'Отмена' : '+ Добавить'}
        </button>
      </div>

      {showAdd && (
        <div style={{ ...cardStyle, border: '1px solid rgba(201,168,76,0.2)', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <input placeholder="Название (Витамин D3)" value={form.name}
            onChange={e => setForm({...form, name: e.target.value})} style={inputStyle} />
          <input placeholder="Дозировка (5000 МЕ)" value={form.dosage}
            onChange={e => setForm({...form, dosage: e.target.value})} style={inputStyle} />
          <input placeholder="Когда (утром с едой)" value={form.timing}
            onChange={e => setForm({...form, timing: e.target.value})} style={inputStyle} />
          <div>
            <label style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', display: 'block', marginBottom: 4 }}>Курс до</label>
            <input type="date" value={form.courseEnd}
              onChange={e => setForm({...form, courseEnd: e.target.value})} style={inputStyle} />
          </div>
          <button onClick={handleAdd} style={{
            width: '100%', padding: '10px 0', background: 'rgba(201,168,76,0.2)', color: '#c9a84c',
            fontFamily: mono, fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer',
          }}>Добавить</button>
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
          <div key={med.id} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'var(--text-secondary)', margin: 0 }}>{med.name}</p>
                <p style={{ fontFamily: mono, fontSize: 12, color: 'var(--text-faint)', margin: '2px 0 0' }}>{med.dosage} · {med.timing}</p>
              </div>
              <button onClick={() => health.removeMedication(med.id)}
                style={{ fontFamily: mono, fontSize: 12, color: 'rgba(224,90,90,0.4)', background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>

            {daysLeft !== null && (
              <p style={{ fontFamily: mono, fontSize: 12, color: 'var(--text-faint)', margin: 0 }}>
                Курс до {med.courseEnd} · осталось {daysLeft} дней
              </p>
            )}

            {/* Today's toggle */}
            <button onClick={() => health.toggleMedicationDay(med.id, today)}
              style={{
                width: '100%', padding: '10px 0', borderRadius: 8, fontFamily: mono, fontSize: 13,
                cursor: 'pointer', transition: 'all 0.2s',
                ...(takenToday
                  ? { background: 'rgba(76,175,130,0.2)', color: '#4caf82', border: '1px solid rgba(76,175,130,0.3)' }
                  : { background: 'var(--color-dusk)', color: 'var(--text-faint)', border: '1px solid var(--border-muted)' }
                ),
              }}>
              {takenToday ? '✓ Принято сегодня' : 'Отметить приём'}
            </button>

            {/* 7-day streak */}
            <div style={{ display: 'flex', gap: 4 }}>
              {last7.map(date => (
                <div key={date} style={{
                  flex: 1, height: 8, borderRadius: 2,
                  background: med.takenDays[date] ? '#4caf82' : 'rgba(21,29,53,0.6)',
                }} />
              ))}
            </div>
            {streak > 0 && (
              <p style={{ fontFamily: mono, fontSize: 10, color: '#4caf82', margin: 0 }}>{streak} дней подряд</p>
            )}
          </div>
        )
      })}

      {health.medications.length === 0 && !showAdd && (
        <div style={{ ...cardStyle, padding: 24, textAlign: 'center' }}>
          <p style={{ fontFamily: mono, fontSize: 13, color: 'var(--text-faint)', margin: 0 }}>Пока ничего не назначено</p>
          <p style={{ fontFamily: mono, fontSize: 12, color: 'var(--text-faint)', marginTop: 4 }}>Добавьте после визита к врачу</p>
        </div>
      )}

      {/* Vitamin info reference */}
      <div style={cardStyle}>
        <p style={{ ...sectionLabel, marginBottom: 12 }}>Справочник</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(VITAMIN_INFO).map(([name, info]) => (
            <div key={name}>
              <p style={{ fontFamily: mono, fontSize: 13, color: '#c9a84c', margin: 0 }}>{name}</p>
              <p style={{ fontFamily: mono, fontSize: 12, color: 'var(--text-faint)', lineHeight: 1.6, margin: '2px 0 0' }}>{info}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
