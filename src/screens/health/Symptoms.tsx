import { useState, useMemo } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { SYMPTOM_LIST } from '../../utils/healthConstants'
import { todayStr } from '../../utils/dates'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

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

export function Symptoms() {
  const health = useHealthStore()
  const today = todayStr()
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const existing = health.symptoms.find(s => s.date === today)
    return existing?.ratings ?? Object.fromEntries(SYMPTOM_LIST.map(s => [s.id, 5]))
  })
  const [notes, setNotes] = useState('')

  const handleSave = () => {
    health.addSymptomEntry({ date: today, ratings, notes })
  }

  // Chart data for each symptom
  const chartData = useMemo(() => {
    const sorted = [...health.symptoms].sort((a, b) => a.date.localeCompare(b.date))
    return sorted.map(entry => ({
      date: entry.date.slice(5), // "MM-DD"
      ...entry.ratings,
    }))
  }, [health.symptoms])

  const getRatingColor = (val: number) => val <= 3 ? '#4caf82' : val <= 6 ? '#c9a84c' : '#e05a5a'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 24, color: 'var(--gold-text)', margin: 0 }}>Симптомы</h2>

      {/* Current rating */}
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <p style={{ ...sectionLabel, margin: 0 }}>Оценка сегодня</p>
        {SYMPTOM_LIST.map(symptom => (
          <div key={symptom.id}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontFamily: mono, fontSize: 13, color: 'var(--text-secondary)' }}>{symptom.label}</span>
              <span style={{ fontFamily: mono, fontSize: 13, fontWeight: 700, color: getRatingColor(ratings[symptom.id] ?? 5) }}>
                {ratings[symptom.id] ?? 5}/10
              </span>
            </div>
            <input type="range" min="0" max="10" value={ratings[symptom.id] ?? 5}
              onChange={e => setRatings({...ratings, [symptom.id]: Number(e.target.value)})}
              style={{ width: '100%', height: 4, background: 'var(--color-dusk)', borderRadius: 2, appearance: 'none', cursor: 'pointer', accentColor: '#c9a84c' }} />
          </div>
        ))}
        <textarea placeholder="Новые симптомы или заметки..." value={notes}
          onChange={e => setNotes(e.target.value)}
          style={{
            width: '100%', background: 'var(--color-dusk)', borderRadius: 8, padding: '10px 12px',
            fontFamily: "'Inter', sans-serif", fontSize: 13, color: 'var(--text-primary)', outline: 'none',
            border: '1px solid var(--border-muted)', minHeight: 60, resize: 'none', boxSizing: 'border-box',
          }} />
        <button onClick={handleSave}
          style={{
            width: '100%', padding: '10px 0', background: 'rgba(201,168,76,0.2)', color: '#c9a84c',
            fontFamily: mono, fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer',
          }}>Сохранить оценку</button>
      </div>

      {/* History chart */}
      {chartData.length > 1 && (
        <div style={cardStyle}>
          <p style={{ ...sectionLabel, marginBottom: 12 }}>Динамика</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8a8a8a' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#8a8a8a' }} />
              <Tooltip contentStyle={{ background: '#0f1628', border: '1px solid #151d35', borderRadius: 8, fontSize: 11 }} />
              {SYMPTOM_LIST.slice(0, 4).map((s, i) => (
                <Line key={s.id} type="monotone" dataKey={s.id} name={s.label}
                  stroke={['#e05a5a', '#c9a84c', '#5a9ae0', '#4caf82'][i]} strokeWidth={2} dot={false} />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History list */}
      {health.symptoms.length > 0 && (
        <div>
          <p style={{ ...sectionLabel, marginBottom: 12 }}>История</p>
          {[...health.symptoms].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(entry => (
            <div key={entry.date} style={{ ...cardStyle, padding: 12, marginBottom: 8 }}>
              <p style={{ fontFamily: mono, fontSize: 12, color: 'var(--text-faint)', marginBottom: 8 }}>{entry.date}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {SYMPTOM_LIST.map(s => {
                  const val = entry.ratings[s.id] ?? 0
                  const color = getRatingColor(val)
                  const bgColor = val <= 3 ? 'rgba(76,175,130,0.1)' : val <= 6 ? 'rgba(201,168,76,0.1)' : 'rgba(224,90,90,0.1)'
                  return (
                    <span key={s.id} style={{
                      fontFamily: mono, fontSize: 10, padding: '2px 8px', borderRadius: 4,
                      background: bgColor, color,
                    }}>{s.label.split(' ')[0]} {val}</span>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
