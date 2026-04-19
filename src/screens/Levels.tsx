import { useStore } from '../store/useStore'
import { ProgressRing } from '../components/ProgressRing'
import { LevelBadge } from '../components/LevelBadge'
import { getLevelForXp, getXpToNextLevel, BADGE_DEFINITIONS } from '../utils/gamification'
import { LEVELS } from '../utils/constants'

export function Levels() {
  const { xp, badges } = useStore()
  const currentLevel = getLevelForXp(xp)
  const { current, needed, progress } = getXpToNextLevel(xp)

  return (
    <div className="p-4 pb-20 space-y-6">
      <h1 className="font-heading text-2xl text-gold">Уровни</h1>

      <div className="bg-navy-2 rounded-xl p-6 border border-navy-3 flex flex-col items-center">
        <ProgressRing progress={progress} size={160} strokeWidth={8}>
          <div className="text-center">
            <p className="font-heading text-3xl text-gold">{currentLevel.level}</p>
            <p className="font-heading text-sm text-txt/80">{currentLevel.name}</p>
          </div>
        </ProgressRing>
        <div className="mt-4 text-center">
          <p className="font-mono text-lg text-gold">{xp.toLocaleString()} XP</p>
          {needed > 0 && (
            <p className="font-mono text-xs text-txt/40 mt-1">
              {current.toLocaleString()} / {needed.toLocaleString()} до следующего уровня
            </p>
          )}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg text-txt mb-3">Все уровни</h2>
        <div className="bg-navy-2 rounded-xl border border-navy-3 divide-y divide-navy-3">
          {LEVELS.map((lvl) => {
            const isReached = xp >= lvl.minXp
            const isCurrent = currentLevel.level === lvl.level
            return (
              <div key={lvl.level} className={`flex items-center justify-between p-3 ${isCurrent ? 'bg-gold/5' : ''}`}>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm w-6 text-center ${isReached ? 'text-gold' : 'text-txt/30'}`}>{lvl.level}</span>
                  <span className={`font-heading text-sm ${isReached ? 'text-txt' : 'text-txt/30'}`}>{lvl.name}</span>
                </div>
                <span className="font-mono text-xs text-txt/40">
                  {lvl.maxXp === Infinity ? `${lvl.minXp.toLocaleString()}+` : `${lvl.minXp.toLocaleString()} — ${lvl.maxXp.toLocaleString()}`}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="font-heading text-lg text-txt mb-3">Достижения</h2>
        <div className="grid grid-cols-1 gap-2">
          {BADGE_DEFINITIONS.map((badge) => (
            <LevelBadge key={badge.id} icon={badge.icon} name={badge.name}
              description={badge.description} earned={badges.includes(badge.id)} />
          ))}
        </div>
      </div>

      <div className="bg-navy-2 rounded-xl p-4 border border-navy-3">
        <h3 className="font-heading text-sm text-txt/80 mb-2">Как заработать XP</h3>
        <div className="space-y-1 font-mono text-xs text-txt/50">
          <p>Намаз выполнен: +10 XP</p>
          <p>Все 5 намазов: +30 XP бонус</p>
          <p>Привычка выполнена: +10 XP</p>
          <p>Все привычки за день: +50 XP бонус</p>
          <p>Депозит переведён: +100 XP</p>
          <p>Streak 7 дней: +200 XP</p>
          <p>Streak 30 дней: +500 XP</p>
        </div>
      </div>
    </div>
  )
}
