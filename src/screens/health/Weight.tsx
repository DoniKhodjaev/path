import { useState, useMemo } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { WEIGHT_GOAL, WEIGHT_START } from '../../utils/healthConstants'
import { todayStr } from '../../utils/dates'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'

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

export function Weight() {
  const health = useHealthStore()
  const [weightInput, setWeightInput] = useState('')
  const [showBody, setShowBody] = useState(false)
  const [bodyForm, setBodyForm] = useState({ waist: '', chest: '', bicep: '', thigh: '' })

  const handleAddWeight = () => {
    const w = Number(weightInput)
    if (w > 0) {
      health.addWeightEntry({ date: todayStr(), weight: w })
      setWeightInput('')
    }
  }

  const handleAddBody = () => {
    health.addBodyMeasurement({
      date: todayStr(),
      waist: Number(bodyForm.waist) || undefined,
      chest: Number(bodyForm.chest) || undefined,
      bicep: Number(bodyForm.bicep) || undefined,
      thigh: Number(bodyForm.thigh) || undefined,
    })
    setShowBody(false)
    setBodyForm({ waist: '', chest: '', bicep: '', thigh: '' })
  }

  const latest = health.weightEntries.length > 0 ? health.weightEntries[health.weightEntries.length - 1] : null
  const progressPct = latest ? ((WEIGHT_START - latest.weight) / (WEIGHT_START - WEIGHT_GOAL)) * 100 : 0

  // 7-day moving average
  const chartData = useMemo(() => {
    return health.weightEntries.map((entry, i, arr) => {
      const window = arr.slice(Math.max(0, i - 6), i + 1)
      const avg = window.reduce((s, e) => s + e.weight, 0) / window.length
      return { date: entry.date.slice(5), weight: entry.weight, avg: Math.round(avg * 10) / 10 }
    })
  }, [health.weightEntries])

  // Weekly rate
  const weeklyRate = useMemo(() => {
    if (health.weightEntries.length < 7) return null
    const recent = health.weightEntries[health.weightEntries.length - 1].weight
    const weekAgo = health.weightEntries[Math.max(0, health.weightEntries.length - 7)].weight
    return recent - weekAgo
  }, [health.weightEntries])

  const bmi = latest ? (latest.weight / (1.78 * 1.78)).toFixed(1) : null // assuming height 178cm

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 24, color: 'var(--gold-text)', margin: 0 }}>Вес и тело</h2>

      {/* Quick add */}
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={{ ...sectionLabel, margin: 0 }}>Утренний замер</p>
        <div style={{ display: 'flex', gap: 8 }}>
          <input type="number" step="0.1" placeholder="84.2" value={weightInput}
            onChange={e => setWeightInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={handleAddWeight}
            style={{
              padding: '10px 16px', background: 'rgba(201,168,76,0.2)', color: '#c9a84c',
              fontFamily: mono, fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer',
            }}>кг</button>
        </div>
      </div>

      {/* Current stats */}
      {latest && (
        <div style={cardStyle}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, textAlign: 'center' }}>
            <div>
              <p style={{ fontFamily: mono, fontSize: 20, color: 'var(--text-secondary)', margin: 0 }}>{latest.weight}</p>
              <p style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', margin: '2px 0 0' }}>ТЕКУЩИЙ</p>
            </div>
            <div>
              <p style={{ fontFamily: mono, fontSize: 20, color: '#4caf82', margin: 0 }}>{WEIGHT_GOAL}</p>
              <p style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', margin: '2px 0 0' }}>ЦЕЛЬ</p>
            </div>
            <div>
              <p style={{ fontFamily: mono, fontSize: 20, color: '#c9a84c', margin: 0 }}>{progressPct.toFixed(0)}%</p>
              <p style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', margin: '2px 0 0' }}>ПРОГРЕСС</p>
            </div>
          </div>
          <div style={{ height: 8, background: 'var(--color-dusk)', borderRadius: 4, overflow: 'hidden', marginTop: 12 }}>
            <div style={{ height: '100%', background: '#4caf82', borderRadius: 4, transition: 'all 0.3s', width: `${Math.min(100, Math.max(0, progressPct))}%` }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontFamily: mono, fontSize: 10, color: 'var(--text-faint)' }}>
            {bmi && <span>BMI: {bmi}</span>}
            {weeklyRate !== null && (
              <span style={{ color: weeklyRate <= 0 ? '#4caf82' : '#e05a5a' }}>
                {weeklyRate > 0 ? '+' : ''}{weeklyRate.toFixed(1)} кг/нед
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div style={cardStyle}>
          <p style={{ ...sectionLabel, marginBottom: 12 }}>Динамика</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8a8a8a' }} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 10, fill: '#8a8a8a' }} />
              <Tooltip contentStyle={{ background: '#0f1628', border: '1px solid #151d35', borderRadius: 8, fontSize: 11 }} />
              <ReferenceLine y={WEIGHT_GOAL} stroke="#4caf82" strokeDasharray="3 3" />
              <Line type="monotone" dataKey="weight" stroke="#5a9ae0" strokeWidth={1} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="avg" stroke="#c9a84c" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', gap: 16, marginTop: 8, fontFamily: mono, fontSize: 10, color: 'var(--text-faint)' }}>
            <span><span style={{ display: 'inline-block', width: 12, height: 2, background: '#5a9ae0', marginRight: 4, verticalAlign: 'middle' }} />вес</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 2, background: '#c9a84c', marginRight: 4, verticalAlign: 'middle' }} />среднее 7д</span>
            <span><span style={{ display: 'inline-block', width: 12, height: 2, background: '#4caf82', marginRight: 4, verticalAlign: 'middle', borderTop: '1px dashed #4caf82' }} />цель</span>
          </div>
        </div>
      )}

      {/* Body measurements */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <p style={sectionLabel}>Замеры тела</p>
          <button onClick={() => setShowBody(!showBody)}
            style={{ fontFamily: mono, fontSize: 12, color: '#c9a84c', background: 'none', border: 'none', cursor: 'pointer' }}>
            {showBody ? 'Отмена' : '+ Замер'}
          </button>
        </div>
        {showBody && (
          <div style={{ ...cardStyle, border: '1px solid rgba(201,168,76,0.2)', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <input placeholder="Талия, см" type="number" value={bodyForm.waist}
                onChange={e => setBodyForm({...bodyForm, waist: e.target.value})} style={inputStyle} />
              <input placeholder="Грудь, см" type="number" value={bodyForm.chest}
                onChange={e => setBodyForm({...bodyForm, chest: e.target.value})} style={inputStyle} />
              <input placeholder="Бицепс, см" type="number" value={bodyForm.bicep}
                onChange={e => setBodyForm({...bodyForm, bicep: e.target.value})} style={inputStyle} />
              <input placeholder="Бедро, см" type="number" value={bodyForm.thigh}
                onChange={e => setBodyForm({...bodyForm, thigh: e.target.value})} style={inputStyle} />
            </div>
            <button onClick={handleAddBody} style={{
              width: '100%', padding: '10px 0', background: 'rgba(201,168,76,0.2)', color: '#c9a84c',
              fontFamily: mono, fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer',
            }}>Сохранить</button>
          </div>
        )}
        {health.bodyMeasurements.length > 0 && (
          <div style={{ ...cardStyle, padding: 12 }}>
            {[...health.bodyMeasurements].reverse().slice(0, 3).map((m, i, arr) => (
              <div key={m.date} style={{
                display: 'flex', justifyContent: 'space-between', padding: '8px 0',
                borderBottom: i < arr.length - 1 ? '1px solid var(--border-muted)' : 'none',
              }}>
                <span style={{ fontFamily: mono, fontSize: 12, color: 'var(--text-faint)' }}>{m.date}</span>
                <div style={{ fontFamily: mono, fontSize: 12, color: 'var(--text-faint)', display: 'flex', gap: 12 }}>
                  {m.waist && <span>Т:{m.waist}</span>}
                  {m.chest && <span>Г:{m.chest}</span>}
                  {m.bicep && <span>Б:{m.bicep}</span>}
                  {m.thigh && <span>Бд:{m.thigh}</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
