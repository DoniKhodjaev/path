import { useMemo } from 'react'
import { usePrayers } from '../hooks/usePrayers'
import { useStore } from '../store/useStore'
import { useHealthStore } from '../store/useHealthStore'
import { PrayerCard } from '../components/PrayerCard'
import { formatDateRussian, getPathProgress, todayStr } from '../utils/dates'
import { QUOTES, HABITS } from '../utils/constants'
import { useGamification } from '../hooks/useGamification'

export function Dashboard() {
  const { prayers, nextPrayer, countdown } = usePrayers()
  const store = useStore()
  const health = useHealthStore()
  const { awardPoints, checkAndAwardBadges } = useGamification()
  const today = todayStr()
  const dayRecord = store.days[today]
  const { percent, daysLeft } = getPathProgress()

  // Health summary data
  const latestWeight = health.weightEntries.length > 0
    ? health.weightEntries[health.weightEntries.length - 1] : null
  const prevWeight = health.weightEntries.length > 1
    ? health.weightEntries[health.weightEntries.length - 2] : null
  const weightDiff = latestWeight && prevWeight ? latestWeight.weight - prevWeight.weight : 0

  const latestSleep = health.sleepEntries.length > 0
    ? health.sleepEntries[health.sleepEntries.length - 1] : null
  const sleepHours = latestSleep ? (() => {
    const [bh, bm] = latestSleep.bedtime.split(':').map(Number)
    const [wh, wm] = latestSleep.wakeTime.split(':').map(Number)
    let mins = (wh * 60 + wm) - (bh * 60 + bm)
    if (mins < 0) mins += 24 * 60
    return `${Math.floor(mins / 60)}ч`
  })() : null

  const upcomingVisit = health.doctorVisits
    .filter(v => v.status === 'planned' && v.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  const sympImproved = (() => {
    const sorted = [...health.symptoms].sort((a, b) => a.date.localeCompare(b.date))
    if (sorted.length < 2) return 0
    const first = sorted[0], latest = sorted[sorted.length - 1]
    let count = 0
    for (const key of Object.keys(latest.ratings)) {
      if ((latest.ratings[key] ?? 0) < (first.ratings[key] ?? 0)) count++
    }
    return count
  })()

  const quoteOfDay = useMemo(() => {
    const dayIndex = new Date().getDate() % QUOTES.length
    return QUOTES[dayIndex]
  }, [])

  const todayPoints = useMemo(() => {
    if (!dayRecord) return 0
    let pts = 0
    HABITS.forEach(h => {
      if (h.isPrayer ? dayRecord.prayers[h.id] : dayRecord.habits[h.id]) pts += 10
    })
    return pts
  }, [dayRecord])

  const mainStreak = store.streaks.main?.current ?? 0

  const handlePrayerToggle = (prayerId: string) => {
    const wasDone = dayRecord?.prayers[prayerId]
    store.togglePrayer(today, prayerId)
    if (!wasDone) {
      awardPoints(10)
      const updatedPrayers = { ...(dayRecord?.prayers || {}), [prayerId]: true }
      const allDone = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'].every(p => updatedPrayers[p])
      if (allDone) awardPoints(30)
    }
    setTimeout(() => checkAndAwardBadges(), 100)
  }

  const topHabits = HABITS.filter(h => !h.isPrayer).slice(0, 3)

  return (
    <div className="p-4 pb-20 space-y-6">
      <div>
        <h1 className="font-heading text-2xl text-gold">Ассалому алайкум, Дониёр</h1>
        <p className="font-mono text-xs text-txt/50 mt-1">{formatDateRussian(new Date())}</p>
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <div className="flex justify-between items-center mb-2">
          <span className="font-mono text-xs text-txt/60">Путь до Ташкента</span>
          <span className="font-mono text-xs text-gold">{percent.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-navy-3 rounded-full overflow-hidden">
          <div className="h-full bg-gold rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
        </div>
        <p className="font-mono text-[11px] text-txt/40 mt-2">Осталось {daysLeft} дней до 31 октября</p>
      </div>

      <p className="font-heading text-sm text-txt/60 italic leading-relaxed px-2">{quoteOfDay}</p>

      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-heading text-lg text-txt">Намазы</h2>
          {nextPrayer && (
            <span className="font-mono text-xs text-gold">{nextPrayer.label} через {countdown}</span>
          )}
        </div>
        <div className="space-y-2">
          {prayers.map((p) => (
            <PrayerCard key={p.name} name={p.name} label={p.label} time={p.timeStr}
              isActive={p.isActive} isDone={dayRecord?.prayers[p.name] ?? false}
              onToggle={() => handlePrayerToggle(p.name)} />
          ))}
        </div>
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3 space-y-3">
        <h2 className="font-heading text-lg text-txt">Сегодня</h2>
        {topHabits.map(h => {
          const done = dayRecord?.habits[h.id] ?? false
          return (
            <div key={h.id} className="flex items-center gap-2 font-mono text-sm">
              <span className={done ? 'text-accent-green' : 'text-txt/40'}>{done ? '✓' : '○'}</span>
              <span className={done ? 'text-txt/50' : 'text-txt'}>{h.label}</span>
            </div>
          )
        })}
        <div className="flex justify-between items-center pt-2 border-t border-navy-3">
          <span className="font-mono text-sm text-txt/60">
            🔥 {mainStreak} {mainStreak === 1 ? 'день' : mainStreak < 5 ? 'дня' : 'дней'} подряд
          </span>
          <span className="font-mono text-sm text-gold">+{todayPoints} XP</span>
        </div>
      </div>

      {/* Health summary block */}
      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3 space-y-2">
        <h2 className="font-heading text-lg text-txt flex items-center gap-2">♥ Здоровье</h2>
        <div className="flex gap-4 font-mono text-sm text-txt/80">
          <span>Вес: {latestWeight ? latestWeight.weight : '—'}
            {weightDiff !== 0 && (
              <span className={weightDiff < 0 ? 'text-accent-green' : 'text-accent-red'}>
                {' '}{weightDiff > 0 ? '↑' : '↓'}
              </span>
            )}
          </span>
          <span>Сон: {sleepHours ?? '—'}</span>
          {sympImproved > 0 && <span>Симпт: {sympImproved}/7 ↓</span>}
        </div>
        {upcomingVisit && (
          <p className="font-mono text-xs text-accent-blue">
            📅 {upcomingVisit.date} {upcomingVisit.time} — {upcomingVisit.specialist}
            {upcomingVisit.clinic && `, ${upcomingVisit.clinic}`}
          </p>
        )}
      </div>
    </div>
  )
}
