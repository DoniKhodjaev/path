import { useStore } from '../store/useStore'
import { getLevelForXp, getXpToNextLevel, BADGE_DEFINITIONS } from '../utils/gamification'
import { LEVELS } from '../utils/constants'

export function Levels() {
  const { xp, badges } = useStore()
  const currentLevel = getLevelForXp(xp)
  const { current, needed, progress } = getXpToNextLevel(xp)

  const nextLevel = LEVELS.find(l => l.level === currentLevel.level + 1)
  const xpToNext = nextLevel ? nextLevel.minXp - xp : 0

  // Ring geometry
  const ringSize = 180
  const ringRadius = 80
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (ringCircumference * progress) / 100

  const earnedCount = BADGE_DEFINITIONS.filter(b => badges.includes(b.id)).length

  return (
    <div className="pb-20" style={{ padding: '0 20px 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: 3,
            color: 'rgba(201,168,76,0.6)',
            marginBottom: 8,
            textTransform: 'uppercase',
          }}
        >
          УРОВНИ И НАГРАДЫ
        </p>
        <h1
          className="font-heading"
          style={{ fontSize: 40, fontWeight: 300, color: 'var(--color-ink)', lineHeight: 1.1 }}
        >
          Твой{' '}
          <span style={{ fontStyle: 'italic', color: '#e8c96a' }}>путь</span>
        </h1>
      </div>

      {/* Ring indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <defs>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c9a84c" />
                <stop offset="100%" stopColor="#e8c96a" />
              </linearGradient>
            </defs>
            {/* Background circle */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="rgba(255,255,255,0.05)"
              strokeWidth={3}
            />
            {/* Progress circle */}
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="url(#ring-grad)"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              transform={`rotate(-90 ${ringSize / 2} ${ringSize / 2})`}
            />
          </svg>
          {/* Center text */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                letterSpacing: 3,
                color: 'rgba(255,255,255,0.4)',
                textTransform: 'uppercase',
              }}
            >
              УРОВЕНЬ
            </span>
            <span
              className="font-heading"
              style={{ fontSize: 64, fontWeight: 300, lineHeight: 1, color: 'var(--color-ink)' }}
            >
              {currentLevel.level}
            </span>
            <span
              className="font-heading"
              style={{ fontSize: 16, fontStyle: 'italic', color: '#e8c96a' }}
            >
              {currentLevel.name}
            </span>
          </div>
        </div>

        {/* XP display */}
        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
            <span
              className="font-mono"
              style={{ fontSize: 32, fontWeight: 300, color: '#e8c96a' }}
            >
              {xp.toLocaleString('ru-RU')}
            </span>
            <span
              className="font-mono"
              style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}
            >
              XP
            </span>
          </div>
          {nextLevel && (
            <p
              className="font-mono"
              style={{
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
                marginTop: 4,
              }}
            >
              {xpToNext.toLocaleString('ru-RU')} XP до уровня {nextLevel.level} · {nextLevel.name}
            </p>
          )}
        </div>
      </div>

      {/* Level list divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          {LEVELS.length} УРОВНЕЙ
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)',
          }}
        />
      </div>

      {/* Level list */}
      <div style={{ marginBottom: 32 }}>
        {LEVELS.map((lvl) => {
          const isReached = xp >= lvl.minXp
          const isCurrent = currentLevel.level === lvl.level
          const isFuture = !isReached
          const isCompleted = isReached && !isCurrent
          const isLast = lvl.level === 10

          return (
            <div
              key={lvl.level}
              style={{
                display: 'grid',
                gridTemplateColumns: '28px 1fr auto',
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: isCurrent ? 12 : 0,
                marginBottom: 2,
                opacity: isCompleted ? 0.5 : 1,
                ...(isCurrent
                  ? {
                      background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(232,201,106,0.04))',
                      border: '1px solid rgba(201,168,76,0.25)',
                    }
                  : {}),
              }}
            >
              {/* Number */}
              <span
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: isCurrent ? '#e8c96a' : 'rgba(255,255,255,0.4)',
                }}
              >
                {lvl.level}
              </span>

              {/* Name */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isLast ? (
                  <span
                    className="font-heading"
                    style={{
                      fontSize: 14,
                      fontStyle: 'italic',
                      color: '#e8c96a',
                    }}
                  >
                    {lvl.name}
                  </span>
                ) : (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 12,
                      color: isCurrent ? 'var(--color-ink)' : 'rgba(255,255,255,0.6)',
                    }}
                  >
                    {lvl.name}
                  </span>
                )}
                {isCurrent && (
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 8,
                      letterSpacing: 2,
                      color: '#e8c96a',
                      background: 'rgba(232,201,106,0.12)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                    }}
                  >
                    ТЫ ЗДЕСЬ
                  </span>
                )}
                {isLast && <span style={{ fontSize: 14 }}>🏆</span>}
              </div>

              {/* Status */}
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {isCompleted && (
                  <svg width={14} height={14} viewBox="0 0 14 14">
                    <circle cx={7} cy={7} r={6} fill="rgba(76,175,130,0.2)" stroke="#4caf82" strokeWidth={1} />
                    <path d="M4.5 7 L6.5 9 L9.5 5" fill="none" stroke="#4caf82" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {isCurrent && (
                  <span
                    className="font-mono"
                    style={{ fontSize: 10, color: '#e8c96a' }}
                  >
                    {xp.toLocaleString('ru-RU')} XP
                  </span>
                )}
                {isFuture && !isLast && (
                  <svg width={14} height={14} viewBox="0 0 14 14">
                    <circle cx={7} cy={7} r={6} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={1} />
                  </svg>
                )}
                {isFuture && isLast && (
                  <span
                    className="font-mono"
                    style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}
                  >
                    30 000+ · финал
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Achievements divider */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
        }}
      >
        <span
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
          }}
        >
          ДОСТИЖЕНИЯ
        </span>
        <div
          style={{
            flex: 1,
            height: 1,
            background: 'linear-gradient(90deg, rgba(201,168,76,0.3), transparent)',
          }}
        />
        <span
          className="font-mono"
          style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}
        >
          {earnedCount} / {BADGE_DEFINITIONS.length}
        </span>
      </div>

      {/* Achievements grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 10,
          marginBottom: 32,
        }}
      >
        {BADGE_DEFINITIONS.map((badge) => {
          const earned = badges.includes(badge.id)
          return (
            <div
              key={badge.id}
              style={{
                padding: '14px 12px',
                borderRadius: 12,
                opacity: earned ? 1 : 0.5,
                ...(earned
                  ? {
                      background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(232,201,106,0.05))',
                      border: '1px solid rgba(201,168,76,0.25)',
                    }
                  : {
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }),
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 8 }}>{badge.icon}</div>
              <p
                className="font-mono"
                style={{
                  fontSize: 11,
                  color: earned ? 'var(--color-ink)' : 'rgba(255,255,255,0.4)',
                  marginBottom: 2,
                }}
              >
                {badge.name}
              </p>
              <p
                className="font-mono"
                style={{
                  fontSize: 9,
                  color: 'rgba(255,255,255,0.3)',
                  marginBottom: earned ? 8 : 0,
                }}
              >
                {badge.description}
              </p>
              {earned && (
                <span
                  className="font-mono"
                  style={{
                    fontSize: 8,
                    letterSpacing: 2,
                    color: '#4caf82',
                    background: 'rgba(76,175,130,0.12)',
                    padding: '2px 6px',
                    borderRadius: 4,
                    textTransform: 'uppercase',
                  }}
                >
                  ПОЛУЧЕНО
                </span>
              )}
            </div>
          )
        })}
      </div>

      {/* XP earning info */}
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: 12,
          padding: '16px',
        }}
      >
        <p
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.4)',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          КАК ЗАРАБОТАТЬ XP
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['Намаз выполнен', '+10 XP'],
            ['Все 5 намазов за день', '+30 XP'],
            ['Привычка выполнена', '+10 XP'],
            ['Все привычки за день', '+50 XP'],
            ['Депозит переведён', '+100 XP'],
            ['Streak 7 дней', '+200 XP'],
            ['Streak 30 дней', '+500 XP'],
          ].map(([label, value]) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}
              >
                {label}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: 11, color: '#e8c96a' }}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
