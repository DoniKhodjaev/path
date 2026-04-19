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
  const ringSize = 160
  const ringRadius = 70
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference - (ringCircumference * progress) / 100

  const earnedCount = BADGE_DEFINITIONS.filter(b => badges.includes(b.id)).length

  return (
    <div style={{ padding: '0 20px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: 3,
            color: 'var(--gold-text-label)',
            marginBottom: 6,
            textTransform: 'uppercase',
          }}
        >
          УРОВНИ И НАГРАДЫ
        </p>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontSize: 36,
            fontWeight: 300,
            color: 'var(--color-ink)',
            lineHeight: 1.1,
            margin: 0,
          }}
        >
          Твой{' '}
          <span style={{ fontStyle: 'italic', color: 'var(--gold-text)' }}>путь</span>
        </h1>
      </div>

      {/* Ring indicator */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
            <defs>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c9a84c" />
                <stop offset="100%" stopColor="#e8c96a" />
              </linearGradient>
            </defs>
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="none"
              stroke="var(--border-subtle)"
              strokeWidth={3}
            />
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
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 9,
                letterSpacing: 3,
                color: 'var(--text-faint)',
                textTransform: 'uppercase',
              }}
            >
              УРОВЕНЬ
            </span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 56,
                fontWeight: 300,
                lineHeight: 1,
                color: 'var(--color-ink)',
              }}
            >
              {currentLevel.level}
            </span>
            <span
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: 15,
                fontStyle: 'italic',
                color: 'var(--gold-text)',
              }}
            >
              {currentLevel.name}
            </span>
          </div>
        </div>

        {/* XP display */}
        <div style={{ textAlign: 'center', marginTop: 14 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 28,
                fontWeight: 300,
                color: 'var(--gold-text)',
              }}
            >
              {xp.toLocaleString('ru-RU')}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 13,
                color: 'var(--text-faint)',
              }}
            >
              XP
            </span>
          </div>
          {nextLevel && (
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'var(--text-faint)',
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
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: 'var(--text-faint)',
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
      <div style={{ marginBottom: 20 }}>
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
                padding: '8px 12px',
                borderRadius: isCurrent ? 12 : 0,
                marginBottom: 2,
                opacity: isCompleted ? 0.5 : 1,
                ...(isCurrent
                  ? {
                      background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(232,201,106,0.04))',
                      border: '1px solid var(--border-gold-strong)',
                    }
                  : {}),
              }}
            >
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: isCurrent ? 'var(--gold-text)' : 'var(--text-faint)',
                }}
              >
                {lvl.level}
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {isLast ? (
                  <span
                    style={{
                      fontFamily: "'Cormorant Garamond', Georgia, serif",
                      fontSize: 14,
                      fontStyle: 'italic',
                      color: 'var(--gold-text)',
                    }}
                  >
                    {lvl.name}
                  </span>
                ) : (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 12,
                      color: isCurrent ? 'var(--color-ink)' : 'var(--text-muted)',
                    }}
                  >
                    {lvl.name}
                  </span>
                )}
                {isCurrent && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 8,
                      letterSpacing: 2,
                      color: 'var(--gold-text)',
                      background: 'rgba(232,201,106,0.12)',
                      padding: '2px 6px',
                      borderRadius: 4,
                      textTransform: 'uppercase',
                    }}
                  >
                    ТЫ ЗДЕСЬ
                  </span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center' }}>
                {isCompleted && (
                  <svg width={14} height={14} viewBox="0 0 14 14">
                    <circle cx={7} cy={7} r={6} fill="rgba(76,175,130,0.2)" stroke="#4caf82" strokeWidth={1} />
                    <path d="M4.5 7 L6.5 9 L9.5 5" fill="none" stroke="#4caf82" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                {isCurrent && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: 'var(--gold-text)',
                    }}
                  >
                    {xp.toLocaleString('ru-RU')} XP
                  </span>
                )}
                {isFuture && !isLast && (
                  <svg width={14} height={14} viewBox="0 0 14 14">
                    <circle cx={7} cy={7} r={6} fill="none" stroke="var(--text-dim)" strokeWidth={1} />
                  </svg>
                )}
                {isFuture && isLast && (
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 10,
                      color: 'var(--text-faint)',
                    }}
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
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: 'var(--text-faint)',
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
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: 'var(--text-faint)',
          }}
        >
          {earnedCount} / {BADGE_DEFINITIONS.length}
        </span>
      </div>

      {/* Achievements grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 20,
        }}
      >
        {BADGE_DEFINITIONS.map((badge) => {
          const earned = badges.includes(badge.id)
          return (
            <div
              key={badge.id}
              style={{
                padding: '12px 10px',
                borderRadius: 12,
                opacity: earned ? 1 : 0.5,
                ...(earned
                  ? {
                      background: 'linear-gradient(135deg, rgba(201,168,76,0.1), rgba(232,201,106,0.05))',
                      border: '1px solid var(--border-gold-strong)',
                    }
                  : {
                      background: 'var(--surface-card-hover)',
                      border: '1px solid var(--border-muted)',
                    }),
              }}
            >
              <div style={{ fontSize: 20, marginBottom: 6 }}>{badge.icon}</div>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: earned ? 'var(--color-ink)' : 'var(--text-faint)',
                  marginBottom: 2,
                }}
              >
                {badge.name}
              </p>
              <p
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 9,
                  color: 'var(--text-ghost)',
                  marginBottom: earned ? 6 : 0,
                }}
              >
                {badge.description}
              </p>
              {earned && (
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
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
          background: 'var(--surface-card-hover)',
          border: '1px solid var(--border-muted)',
          borderRadius: 12,
          padding: 14,
        }}
      >
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: 'var(--text-faint)',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}
        >
          КАК ЗАРАБОТАТЬ XP
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
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
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'var(--text-subtle)',
                }}
              >
                {label}
              </span>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: 'var(--gold-text)',
                }}
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
