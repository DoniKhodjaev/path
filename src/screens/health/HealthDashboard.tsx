import { useHealthStore } from '../../store/useHealthStore'
import { todayStr } from '../../utils/dates'
import { SYMPTOM_LIST } from '../../utils/healthConstants'
import type { HealthSubScreen } from '../../types'

interface Props {
  onNavigate: (screen: HealthSubScreen) => void
}

export function HealthDashboard({ onNavigate }: Props) {
  const health = useHealthStore()
  const today = todayStr()

  // Latest weight
  const latestWeight = health.weightEntries.length > 0
    ? health.weightEntries[health.weightEntries.length - 1]
    : null
  const prevWeight = health.weightEntries.length > 1
    ? health.weightEntries[health.weightEntries.length - 2]
    : null
  const weightDiff = latestWeight && prevWeight ? latestWeight.weight - prevWeight.weight : 0

  // Latest sleep
  const latestSleep = health.sleepEntries.length > 0
    ? health.sleepEntries[health.sleepEntries.length - 1]
    : null
  const sleepDuration = latestSleep ? (() => {
    const [bh, bm] = latestSleep.bedtime.split(':').map(Number)
    const [wh, wm] = latestSleep.wakeTime.split(':').map(Number)
    let mins = (wh * 60 + wm) - (bh * 60 + bm)
    if (mins < 0) mins += 24 * 60
    return `${Math.floor(mins / 60)}ч ${mins % 60}м`
  })() : null

  // Symptoms improvement
  const sortedSymptoms = [...health.symptoms].sort((a, b) => a.date.localeCompare(b.date))
  const latestSymp = sortedSymptoms.length > 0 ? sortedSymptoms[sortedSymptoms.length - 1] : null
  const firstSymp = sortedSymptoms.length > 1 ? sortedSymptoms[0] : null
  let sympImproved = 0
  if (latestSymp && firstSymp) {
    SYMPTOM_LIST.forEach(s => {
      const first = firstSymp.ratings[s.id] ?? 0
      const latest = latestSymp.ratings[s.id] ?? 0
      if (latest < first) sympImproved++
    })
  }

  // Upcoming doctor visit
  const upcoming = health.doctorVisits
    .filter(v => v.status === 'planned' && v.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  // Energy from latest sleep
  const energy = latestSleep?.quality ?? 0

  const cards: { label: string; icon: string; screen: HealthSubScreen }[] = [
    { label: 'Анализы и врачи', icon: '📋', screen: 'doctors' },
    { label: 'Симптомы', icon: '🩺', screen: 'symptoms' },
    { label: 'Вес и тело', icon: '⚖', screen: 'weight' },
    { label: 'Сон', icon: '😴', screen: 'sleep' },
    { label: 'Витамины', icon: '💊', screen: 'vitamins' },
    { label: 'Фото прогресса', icon: '📸', screen: 'photos' },
  ]

  return (
    <div className="p-4 pb-20 space-y-6">
      <h1 className="font-heading text-2xl text-gold">Здоровье</h1>

      {/* Metrics summary */}
      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3 space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-mono text-[10px] text-txt/40 uppercase tracking-wider">Вес</p>
            <p className="font-mono text-lg text-txt">
              {latestWeight ? `${latestWeight.weight} кг` : '—'}
              {weightDiff !== 0 && (
                <span className={`text-xs ml-1 ${weightDiff < 0 ? 'text-accent-green' : 'text-accent-red'}`}>
                  {weightDiff > 0 ? '+' : ''}{weightDiff.toFixed(1)}
                </span>
              )}
            </p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-txt/40 uppercase tracking-wider">Сон</p>
            <p className="font-mono text-lg text-txt">{sleepDuration ?? '—'}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-txt/40 uppercase tracking-wider">Энергия</p>
            <p className="font-mono text-lg text-txt">{energy > 0 ? `${energy}/10` : '—'}</p>
          </div>
          <div>
            <p className="font-mono text-[10px] text-txt/40 uppercase tracking-wider">Симптомы</p>
            <p className="font-mono text-lg text-txt">
              {sympImproved > 0 ? `${sympImproved} из ${SYMPTOM_LIST.length} ↓` : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming visit */}
      {upcoming && (
        <div className="bg-navy-2 rounded-xl p-4 border border-accent-blue/20">
          <p className="font-mono text-[10px] text-accent-blue uppercase tracking-wider mb-1">Ближайший визит</p>
          <p className="font-mono text-sm text-txt">
            {upcoming.date} {upcoming.time} — {upcoming.specialist}
          </p>
          <p className="font-mono text-xs text-txt/50">{upcoming.clinic}</p>
        </div>
      )}

      {/* Navigation cards */}
      <div className="grid grid-cols-2 gap-3">
        {cards.map(c => (
          <button key={c.screen} onClick={() => onNavigate(c.screen)}
            className="bg-navy-2 rounded-xl p-4 border border-navy-3 hover:border-gold/20 transition-colors text-left">
            <span className="text-2xl">{c.icon}</span>
            <p className="font-mono text-sm text-txt mt-2">{c.label}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
