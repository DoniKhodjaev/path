import { useState, useMemo } from 'react'
import { useHealthStore } from '../../store/useHealthStore'
import { WEIGHT_GOAL, WEIGHT_START } from '../../utils/healthConstants'
import { todayStr } from '../../utils/dates'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts'

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

  const inputCls = "w-full bg-dusk rounded px-3 py-2 font-mono text-sm text-txt outline-none border border-dusk focus:border-gold/30"

  return (
    <div className="space-y-6">
      <h2 className="text-h1 text-gold">Вес и тело</h2>

      {/* Quick add */}
      <div className="bg-twilight rounded-2xl p-4 border border-dusk space-y-3">
        <p className="font-mono text-xs text-ink-mute uppercase tracking-wider">Утренний замер</p>
        <div className="flex gap-2">
          <input type="number" step="0.1" placeholder="84.2" value={weightInput}
            onChange={e => setWeightInput(e.target.value)} className={`flex-1 ${inputCls}`} />
          <button onClick={handleAddWeight}
            className="px-4 py-2 bg-gold/20 text-gold font-mono text-sm rounded">кг</button>
        </div>
      </div>

      {/* Current stats */}
      {latest && (
        <div className="bg-twilight rounded-2xl p-4 border border-dusk">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-mono text-xl text-txt">{latest.weight}</p>
              <p className="font-mono text-[10px] text-ink-mute">ТЕКУЩИЙ</p>
            </div>
            <div>
              <p className="font-mono text-xl text-sacred">{WEIGHT_GOAL}</p>
              <p className="font-mono text-[10px] text-ink-mute">ЦЕЛЬ</p>
            </div>
            <div>
              <p className="font-mono text-xl text-gold">{progressPct.toFixed(0)}%</p>
              <p className="font-mono text-[10px] text-ink-mute">ПРОГРЕСС</p>
            </div>
          </div>
          <div className="h-2 bg-dusk rounded-full overflow-hidden mt-3">
            <div className="h-full bg-sacred rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }} />
          </div>
          <div className="flex justify-between mt-2 font-mono text-[10px] text-ink-mute">
            {bmi && <span>BMI: {bmi}</span>}
            {weeklyRate !== null && (
              <span className={weeklyRate <= 0 ? 'text-sacred' : 'text-danger'}>
                {weeklyRate > 0 ? '+' : ''}{weeklyRate.toFixed(1)} кг/нед
              </span>
            )}
          </div>
        </div>
      )}

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="bg-twilight rounded-2xl p-4 border border-dusk">
          <p className="font-mono text-xs text-ink-mute uppercase tracking-wider mb-3">Динамика</p>
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
          <div className="flex gap-4 mt-2 font-mono text-[10px] text-ink-mute">
            <span><span className="inline-block w-3 h-0.5 bg-calm mr-1" />вес</span>
            <span><span className="inline-block w-3 h-0.5 bg-gold mr-1" />среднее 7д</span>
            <span><span className="inline-block w-3 h-0.5 bg-sacred mr-1" style={{ borderTop: '1px dashed #4caf82' }} />цель</span>
          </div>
        </div>
      )}

      {/* Body measurements */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <p className="font-mono text-xs text-ink-mute uppercase tracking-wider">Замеры тела</p>
          <button onClick={() => setShowBody(!showBody)}
            className="font-mono text-xs text-gold">{showBody ? 'Отмена' : '+ Замер'}</button>
        </div>
        {showBody && (
          <div className="bg-twilight rounded-2xl p-4 border border-gold/20 space-y-3 mb-3">
            <div className="grid grid-cols-2 gap-2">
              <input placeholder="Талия, см" type="number" value={bodyForm.waist}
                onChange={e => setBodyForm({...bodyForm, waist: e.target.value})} className={inputCls} />
              <input placeholder="Грудь, см" type="number" value={bodyForm.chest}
                onChange={e => setBodyForm({...bodyForm, chest: e.target.value})} className={inputCls} />
              <input placeholder="Бицепс, см" type="number" value={bodyForm.bicep}
                onChange={e => setBodyForm({...bodyForm, bicep: e.target.value})} className={inputCls} />
              <input placeholder="Бедро, см" type="number" value={bodyForm.thigh}
                onChange={e => setBodyForm({...bodyForm, thigh: e.target.value})} className={inputCls} />
            </div>
            <button onClick={handleAddBody} className="w-full py-2 bg-gold/20 text-gold font-mono text-sm rounded">Сохранить</button>
          </div>
        )}
        {health.bodyMeasurements.length > 0 && (
          <div className="bg-twilight rounded-2xl p-3 border border-dusk">
            {[...health.bodyMeasurements].reverse().slice(0, 3).map(m => (
              <div key={m.date} className="flex justify-between py-2 border-b border-dusk last:border-0">
                <span className="font-mono text-xs text-ink-mute">{m.date}</span>
                <div className="font-mono text-xs text-ink-mute space-x-3">
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
