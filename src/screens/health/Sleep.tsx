import { useState, useMemo } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { todayStr } from '../../utils/dates'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'

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

  const inputCls = "w-full bg-dusk rounded px-3 py-2 font-mono text-sm text-txt outline-none border border-dusk focus:border-gold/30"

  return (
    <div className="space-y-6">
      <h2 className="text-h1 text-gold">Сон</h2>

      {/* Add entry */}
      <div className="bg-twilight rounded-2xl p-4 border border-dusk space-y-3">
        <p className="font-mono text-xs text-ink-mute uppercase tracking-wider">Записать сон</p>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="font-mono text-[10px] text-ink-mute block mb-1">Отбой</label>
            <input type="time" value={form.bedtime} onChange={e => setForm({...form, bedtime: e.target.value})} className={inputCls} />
          </div>
          <div>
            <label className="font-mono text-[10px] text-ink-mute block mb-1">Подъём</label>
            <input type="time" value={form.wakeTime} onChange={e => setForm({...form, wakeTime: e.target.value})} className={inputCls} />
          </div>
        </div>
        <div>
          <div className="flex justify-between">
            <label className="font-mono text-[10px] text-ink-mute">Качество сна</label>
            <span className="font-mono text-sm text-gold">{form.quality}/10</span>
          </div>
          <input type="range" min="1" max="10" value={form.quality}
            onChange={e => setForm({...form, quality: Number(e.target.value)})}
            className="w-full h-1 bg-dusk rounded-full appearance-none cursor-pointer
              [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
              [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold" />
        </div>
        <div>
          <label className="font-mono text-[10px] text-ink-mute block mb-1">Пробуждения ночью</label>
          <input type="number" min="0" value={form.awakenings}
            onChange={e => setForm({...form, awakenings: Number(e.target.value)})} className={inputCls} />
        </div>
        <button onClick={handleSave} className="w-full py-2 bg-gold/20 text-gold font-mono text-sm rounded">Сохранить</button>
      </div>

      {/* Calendar */}
      <div className="bg-twilight rounded-2xl p-4 border border-dusk">
        <p className="font-mono text-xs text-ink-mute uppercase tracking-wider mb-3">
          {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
        </p>
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => (
            <span key={d} className="font-mono text-[9px] text-ink-mute text-center">{d}</span>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {calendarData.map((cell, i) => (
            <div key={i} className={`aspect-square rounded-sm flex items-center justify-center font-mono text-[10px] ${
              cell.day === 0 ? '' :
              cell.quality === null ? 'bg-dusk/30 text-ink-mute' :
              cell.quality >= 7 ? 'bg-sacred/30 text-sacred' :
              cell.quality >= 4 ? 'bg-gold/20 text-gold' :
              'bg-danger/20 text-danger'
            }`}>
              {cell.day > 0 ? cell.day : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Duration chart */}
      {chartData.length > 1 && (
        <div className="bg-twilight rounded-2xl p-4 border border-dusk">
          <p className="font-mono text-xs text-ink-mute uppercase tracking-wider mb-3">Длительность сна</p>
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
