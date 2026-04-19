import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { usePrayers } from '../hooks/usePrayers'
import { useStore } from '../store/useStore'
import { useHealthStore } from '../store/useHealthStore'
import { formatDateRussian, getPathProgress, todayStr } from '../utils/dates'
import { QUOTES, HABITS } from '../utils/constants'
import { useGamification } from '../hooks/useGamification'
import { getLevelForXp } from '../utils/gamification'
import { hapticTap } from '../utils/haptic'

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.09,
    },
  },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.32, 0.72, 0, 1] as const } },
}

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
  const xp = store.xp ?? 0
  const levelInfo = getLevelForXp(xp)

  const handlePrayerToggle = (prayerId: string) => {
    hapticTap()
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

  const totalHabits = HABITS.filter(h => !h.isPrayer).length
  const doneHabits = dayRecord
    ? HABITS.filter(h => !h.isPrayer && dayRecord.habits[h.id]).length
    : 0
  const habitPercent = totalHabits > 0 ? (doneHabits / totalHabits) * 100 : 0

  const streakLabel = mainStreak === 1 ? 'день' : mainStreak < 5 ? 'дня' : 'дней'

  const now = new Date()
  const timeStr = now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = formatDateRussian(now)

  return (
    <motion.div
      className="pb-24 space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Hero Section */}
      <motion.div
        variants={sectionVariants}
        className="ambient-mesh relative px-5 pt-8 pb-6 overflow-hidden"
      >
        {/* Top badges row */}
        <div className="flex items-center justify-between mb-5">
          <span className="text-micro text-ink-mute uppercase tracking-widest">
            {timeStr} · {dateStr}
          </span>
          <div className="flex items-center gap-3">
            <span className="text-micro text-champagne font-mono">Ур.{levelInfo.level}</span>
            <span className="text-micro text-sunray font-mono">🔥{mainStreak}</span>
            <span className="text-micro text-gold font-mono">{xp} XP</span>
          </div>
        </div>

        {/* Greeting */}
        <h1 className="text-hero text-ink leading-tight mb-3" style={{ fontSize: '44px', letterSpacing: '-1.2px' }}>
          Ассалому<br />алайкум,<br /><span className="italic text-gold-hi">Дониёр</span>
        </h1>

        {/* Quote */}
        <p className="font-heading italic text-[15px] leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.42)' }}>
          «{quoteOfDay}»
        </p>
        <p className="text-nano text-ink-mute mt-2">— ХАДИС</p>

        {/* Ornament separator */}
        <div className="separator-ornament mt-5">◆</div>
      </motion.div>

      {/* Path Progress */}
      <motion.div variants={sectionVariants} className="px-5">
        <div className="flex justify-between items-center mb-2">
          <span className="text-micro text-ink-mute uppercase tracking-wider">Путь до Ташкента</span>
          <span className="text-micro text-gold font-mono">{percent.toFixed(1)}%</span>
        </div>
        <div className="h-[3px] bg-dusk rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, var(--color-gold), var(--color-sunray))' }}
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.3 }}
          />
        </div>
        <p className="text-micro text-ink-mute mt-1.5">{daysLeft} дней осталось</p>
      </motion.div>

      {/* Next Prayer Hero Card */}
      {nextPrayer && (
        <motion.div variants={sectionVariants} className="px-5">
          <div className="rounded-2xl p-6 relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))',
              border: '1px solid rgba(201,168,76,0.18)',
            }}>
            {/* Radial glow */}
            <div className="absolute top-0 right-0 w-[140px] h-[140px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(201,168,76,0.15), transparent 70%)' }} />
            <p className="text-micro text-ink-mute uppercase tracking-wider mb-1">Следующий намаз · через {countdown}</p>
            <h2 className="text-h2 text-txt mb-1">{nextPrayer.label}</h2>
            <div className="text-gold-hi font-mono text-[64px] leading-none tabular-nums font-light tracking-[-3px]">
              {nextPrayer.timeStr}
            </div>
            <div className="mt-4 h-[3px] bg-night rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gold/50"
                style={{ width: '40%' }}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* Prayers Horizontal Scroll */}
      <motion.div variants={sectionVariants} className="px-5">
        <p className="text-micro text-ink-mute uppercase tracking-wider mb-3">Намазы сегодня</p>
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {prayers.map((p) => {
            const isDone = dayRecord?.prayers[p.name] ?? false
            return (
              <button
                key={p.name}
                onClick={() => handlePrayerToggle(p.name)}
                className={[
                  'flex-shrink-0 min-w-[80px] rounded-xl px-3 py-3 text-center transition-all duration-200',
                  isDone
                    ? 'bg-sacred/20 border border-sacred/40'
                    : p.isActive
                    ? 'bg-dusk border border-gold/50 shadow-[0_0_12px_rgba(var(--color-gold-rgb),0.25)]'
                    : 'bg-dusk border border-twilight',
                ].join(' ')}
              >
                <div className={`text-micro font-mono uppercase tracking-wide mb-1 ${isDone ? 'text-sacred' : p.isActive ? 'text-gold' : 'text-ink-mute'}`}>
                  {p.label}
                </div>
                <div className={`font-mono text-xs tabular-nums ${isDone ? 'text-sacred/80' : p.isActive ? 'text-gold-hi' : 'text-txt/60'}`}>
                  {p.timeStr}
                </div>
                {isDone && (
                  <div className="text-sacred text-[10px] mt-1">✓</div>
                )}
              </button>
            )
          })}
        </div>
      </motion.div>

      {/* Habits Summary */}
      <motion.div variants={sectionVariants} className="px-5">
        <div className="bg-dusk rounded-2xl p-5 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-h2 text-txt">Сегодня</h2>
            <span className="text-micro text-gold font-mono">{doneHabits} из {totalHabits}</span>
          </div>

          {/* Habit progress bar */}
          <div className="h-[3px] bg-night rounded-full overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gold"
              initial={{ width: 0 }}
              animate={{ width: `${habitPercent}%` }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.5 }}
            />
          </div>

          {/* Top habits */}
          <div className="space-y-2.5">
            {topHabits.map(h => {
              const done = dayRecord?.habits[h.id] ?? false
              return (
                <div key={h.id} className="flex items-center gap-3">
                  <span className={`text-sm font-mono w-4 text-center ${done ? 'text-sacred' : 'text-ink-mute'}`}>
                    {done ? '✓' : '○'}
                  </span>
                  <span className={`font-mono text-sm ${done ? 'text-ink-mute line-through' : 'text-txt'}`}>
                    {h.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Streak + XP footer */}
          <div className="flex justify-between items-center pt-3 border-t border-twilight/50">
            <span className="text-micro text-ink-mute font-mono">
              🔥 {mainStreak} {streakLabel} подряд
            </span>
            <span className="text-micro text-gold font-mono">+{todayPoints} XP сегодня</span>
          </div>
        </div>
      </motion.div>

      {/* Health Summary */}
      <motion.div variants={sectionVariants} className="px-5">
        <div className="bg-dusk rounded-2xl p-5 space-y-3">
          <h2 className="text-h2 text-txt">Здоровье</h2>

          <div className="flex gap-4 flex-wrap">
            {/* Weight */}
            <div className="flex flex-col gap-0.5">
              <span className="text-micro text-ink-mute uppercase tracking-wider">Вес</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-sm text-txt">
                  {latestWeight ? `${latestWeight.weight} кг` : '—'}
                </span>
                {weightDiff !== 0 && (
                  <span className={`text-micro font-mono ${weightDiff < 0 ? 'text-sacred' : 'text-danger'}`}>
                    {weightDiff > 0 ? '↑' : '↓'}
                  </span>
                )}
              </div>
            </div>

            {/* Sleep */}
            <div className="flex flex-col gap-0.5">
              <span className="text-micro text-ink-mute uppercase tracking-wider">Сон</span>
              <span className="font-mono text-sm text-txt">{sleepHours ?? '—'}</span>
            </div>

            {/* Symptoms */}
            {sympImproved > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="text-micro text-ink-mute uppercase tracking-wider">Симптомы</span>
                <span className="font-mono text-sm text-sacred">{sympImproved}/7 ↓</span>
              </div>
            )}
          </div>

          {/* Upcoming doctor visit */}
          {upcomingVisit && (
            <div className="mt-1 pt-3 border-t border-twilight/50">
              <span className="text-micro text-ink-mute uppercase tracking-wider block mb-1">Визит к врачу</span>
              <p className="font-mono text-xs text-calm leading-relaxed">
                {upcomingVisit.date}
                {upcomingVisit.time && ` · ${upcomingVisit.time}`}
                {' · '}{upcomingVisit.specialist}
                {upcomingVisit.clinic && `, ${upcomingVisit.clinic}`}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
