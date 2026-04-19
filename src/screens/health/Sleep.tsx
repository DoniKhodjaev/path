import { useState, useMemo } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { todayStr } from '../../utils/dates'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

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
  margin: 0,
}

const mono = "'JetBrains Mono', monospace"

export function Sleep() {
  const health = useHealthStore()
  const [form, setForm] = useState({ bedtime: '23:00', wakeTime: '06:00', quality: 7, awakenings: 0 })

  const handleSave = () => {
    health.addSleepEntry({ date: todayStr(), ...form })
  }

  const chartData = useMemo(() => {
    return health.sleepEntries.slice(-14).map(entry => {
      const [bh, bm] = entry.bedtime.split(':').map(Number)
      const [wh, wm] = entry.wakeTime.split(':').map(Number)
      let mins = (wh * 60 + wm) - (bh * 60 + bm)
      if (mins < 0) mins += 24 * 60
      return {
        date: entry.date.slice(5),
        hours: Math.round((mins / 60) * 10) / 10,
        quality: entry.quality,
      }
    })
  }, [health.sleepEntries])

  // Calendar month view
  const calendarData = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()
    const offset = firstDay === 0 ? 6 : firstDay - 1 // Monday start

    const cells: { day: number; quality: number | null }[] = []
    for (let i = 0; i < offset; i++) cells.push({ day: 0, quality: null })
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const entry = health.sleepEntries.find(e => e.date === dateStr)
      cells.push({ day: d, quality: entry?.quality ?? null })
    }
    return cells
  }, [health.sleepEntries])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontWeight: 400, fontSize: 24, color: 'var(--gold-text)', margin: 0 }}>Сон</h2>

      {/* Add entry */}
      <div style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <p style={sectionLabel}>Записать сон</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div>
            <label style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', display: 'block', marginBottom: 4 }}>Отбой</label>
            <input type="time" value={form.bedtime} onChange={e => setForm({...form, bedtime: e.target.value})} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', display: 'block', marginBottom: 4 }}>Подъём</label>
            <input type="time" value={form.wakeTime} onChange={e => setForm({...form, wakeTime: e.target.value})} style={inputStyle} />
          </div>
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)' }}>Качество сна</label>
            <span style={{ fontFamily: mono, fontSize: 13, color: '#c9a84c' }}>{form.quality}/10</span>
          </div>
          <input type="range" min="1" max="10" value={form.quality}
            onChange={e => setForm({...form, quality: Number(e.target.value)})}
            style={{ width: '100%', height: 4, background: 'var(--color-dusk)', borderRadius: 2, appearance: 'none', cursor: 'pointer', accentColor: '#c9a84c' }} />
        </div>
        <div>
          <label style={{ fontFamily: mono, fontSize: 10, color: 'var(--text-faint)', display: 'block', marginBottom: 4 }}>Пробуждения ночью</label>
          <input type="number" min="0" value={form.awakenings}
            onChange={e => setForm({...form, awakenings: Number(e.target.value)})} style={inputStyle} />
        </div>
        <button onClick={handleSave} style={{
          width: '100%', padding: '10px 0', background: 'rgba(201,168,76,0.2)', color: '#c9a84c',
          fontFamily: mono, fontSize: 13, borderRadius: 8, border: 'none', cursor: 'pointer',
        }}>Сохранить</button>
      </div>

      {/* Calendar */}
      <div style={cardStyle}>
        <p style={{ ...sectionLabel, marginBottom: 12 }}>
          {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 4 }}>
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
            <span key={d} style={{ fontFamily: mono, fontSize: 9, color: 'var(--text-faint)', textAlign: 'center' }}>{d}</span>
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
          {calendarData.map((cell, i) => {
            let bg = 'transparent'
            let color = 'transparent'
            if (cell.day > 0) {
              if (cell.quality === null) { bg = 'rgba(21,29,53,0.3)'; color = 'var(--text-faint)' }
              else if (cell.quality >= 7) { bg = 'rgba(76,175,130,0.3)'; color = '#4caf82' }
              else if (cell.quality >= 4) { bg = 'rgba(201,168,76,0.2)'; color = '#c9a84c' }
              else { bg = 'rgba(224,90,90,0.2)'; color = '#e05a5a' }
            }
            return (
              <div key={i} style={{
                aspectRatio: '1', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: mono, fontSize: 10, background: bg, color,
              }}>
                {cell.day > 0 ? cell.day : ''}
              </div>
            )
          })}
        </div>
      </div>

      {/* Duration chart */}
      {chartData.length > 1 && (
        <div style={cardStyle}>
          <p style={{ ...sectionLabel, marginBottom: 12 }}>Длительность сна</p>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#8a8a8a' }} />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10, fill: '#8a8a8a' }} />
              <Tooltip contentStyle={{ background: '#0f1628', border: '1px solid #151d35', borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="hours" fill="#5a9ae0" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
