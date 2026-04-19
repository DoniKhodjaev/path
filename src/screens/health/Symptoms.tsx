import { useState, useMemo } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { SYMPTOM_LIST } from '../../utils/healthConstants'
import { todayStr } from '../../utils/dates'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts'

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

  return (
    <div className="space-y-6">
      <h2 className="text-h1 text-gold">Симптомы</h2>

      {/* Current rating */}
      <div className="bg-twilight rounded-2xl p-4 border border-dusk space-y-4">
        <p className="font-mono text-xs text-ink-mute uppercase tracking-wider">Оценка сегодня</p>
        {SYMPTOM_LIST.map(symptom => (
          <div key={symptom.id}>
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-sm text-txt">{symptom.label}</span>
              <span className={`font-mono text-sm font-bold ${
                (ratings[symptom.id] ?? 5) <= 3 ? 'text-sacred' :
                (ratings[symptom.id] ?? 5) <= 6 ? 'text-gold' : 'text-danger'
              }`}>{ratings[symptom.id] ?? 5}/10</span>
            </div>
            <input type="range" min="0" max="10" value={ratings[symptom.id] ?? 5}
              onChange={e => setRatings({...ratings, [symptom.id]: Number(e.target.value)})}
              className="w-full h-1 bg-dusk rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold" />
          </div>
        ))}
        <textarea placeholder="Новые симптомы или заметки..." value={notes}
          onChange={e => setNotes(e.target.value)}
          className="w-full bg-dusk rounded px-3 py-2 font-mono text-sm text-txt outline-none border border-dusk focus:border-gold/30 min-h-[60px] resize-none" />
        <button onClick={handleSave}
          className="w-full py-2 bg-gold/20 text-gold font-mono text-sm rounded">Сохранить оценку</button>
      </div>

      {/* History chart */}
      {chartData.length > 1 && (
        <div className="bg-twilight rounded-2xl p-4 border border-dusk">
          <p className="font-mono text-xs text-ink-mute uppercase tracking-wider mb-3">Динамика</p>
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
          <p className="font-mono text-xs text-ink-mute uppercase tracking-wider mb-3">История</p>
          {[...health.symptoms].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5).map(entry => (
            <div key={entry.date} className="bg-twilight rounded-2xl p-3 border border-dusk mb-2">
              <p className="font-mono text-xs text-ink-mute mb-2">{entry.date}</p>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_LIST.map(s => (
                  <span key={s.id} className={`font-mono text-[10px] px-2 py-0.5 rounded ${
                    (entry.ratings[s.id] ?? 0) <= 3 ? 'bg-sacred/10 text-sacred' :
                    (entry.ratings[s.id] ?? 0) <= 6 ? 'bg-gold/10 text-gold' : 'bg-danger/10 text-danger'
                  }`}>{s.label.split(' ')[0]} {entry.ratings[s.id] ?? 0}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
