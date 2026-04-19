import { useHealthStore } from '../../store/useHealthStore'
import { todayStr } from '../../utils/dates'
import { SYMPTOM_LIST } from '../../utils/healthConstants'
import type { HealthSubScreen } from '../../types'

interface Props {
  onNavigate: (screen: HealthSubScreen) => void
}

const NAV_ITEMS: {
  letter: string
  title: string
  desc: string
  screen: HealthSubScreen
  color: string
  bg: string
  border: string
}[] = [
  { letter: 'А', title: 'Анализы и врачи', desc: 'визиты · результаты · чеклист', screen: 'doctors', color: '#8ab8e0', bg: 'rgba(90,154,224,0.1)', border: 'rgba(90,154,224,0.25)' },
  { letter: 'С', title: 'Симптомы', desc: 'трекинг · динамика · заметки', screen: 'symptoms', color: '#e08a3c', bg: 'rgba(224,138,60,0.1)', border: 'rgba(224,138,60,0.25)' },
  { letter: 'В', title: 'Вес и тело', desc: 'вес · замеры · прогресс', screen: 'weight', color: 'var(--gold-text)', bg: 'rgba(201,168,76,0.1)', border: 'rgba(201,168,76,0.25)' },
  { letter: 'С', title: 'Сон', desc: 'длительность · качество · режим', screen: 'sleep', color: '#a8a0d8', bg: 'rgba(126,111,210,0.1)', border: 'rgba(126,111,210,0.25)' },
  { letter: 'В', title: 'Витамины', desc: 'курсы · приём · напоминания', screen: 'vitamins', color: '#7ec4a0', bg: 'rgba(76,175,130,0.1)', border: 'rgba(76,175,130,0.25)' },
  { letter: 'Ф', title: 'Фото прогресса', desc: 'до/после · сравнение · таймлайн', screen: 'photos', color: '#d89999', bg: 'rgba(201,123,123,0.1)', border: 'rgba(201,123,123,0.25)' },
]

export function HealthDashboard({ onNavigate }: Props) {
  const health = useHealthStore()
  const today = todayStr()

  // Latest weight
  const latestWeight = health.weightEntries.length > 0
    ? health.weightEntries[health.weightEntries.length - 1]
    : null

  // Latest sleep — compute hours
  const latestSleep = health.sleepEntries.length > 0
    ? health.sleepEntries[health.sleepEntries.length - 1]
    : null
  const sleepHours = latestSleep ? (() => {
    const [bh, bm] = latestSleep.bedtime.split(':').map(Number)
    const [wh, wm] = latestSleep.wakeTime.split(':').map(Number)
    let mins = (wh * 60 + wm) - (bh * 60 + bm)
    if (mins < 0) mins += 24 * 60
    return (mins / 60).toFixed(1)
  })() : null

  // Energy from latest sleep quality
  const energy = latestSleep?.quality ?? 0

  // Active symptoms count (latest entry, count ratings > 0)
  const sortedSymptoms = [...health.symptoms].sort((a, b) => a.date.localeCompare(b.date))
  const latestSymp = sortedSymptoms.length > 0 ? sortedSymptoms[sortedSymptoms.length - 1] : null
  const activeSymptomCount = latestSymp
    ? SYMPTOM_LIST.filter(s => (latestSymp.ratings[s.id] ?? 0) > 0).length
    : 0

  return (
    <div style={{
      position: 'relative',
      zIndex: 1,
      height: 'calc(100dvh - 70px - env(safe-area-inset-bottom, 0px))',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 0',
    }}>
      {/* Status bar */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 12,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          letterSpacing: 2.5, color: 'var(--text-faint)', textTransform: 'uppercase',
        }}>
          ЗДОРОВЬЕ · 19 АПР
        </span>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          letterSpacing: 2.5, color: '#e08a3c',
        }}>
          ● ЭТАП 0
        </span>
      </div>

      {/* Title */}
      <h1 style={{
        fontFamily: "'Cormorant Garamond', Georgia, serif",
        fontWeight: 300,
        fontSize: 36,
        lineHeight: 1.05,
        letterSpacing: -1,
        color: 'var(--text-primary)',
        margin: '0 0 12px',
        flexShrink: 0,
      }}>
        Здоровье{'\n'}
        <span style={{ color: 'rgba(144,185,226,0.85)', fontStyle: 'italic', fontSize: 28 }}>
          до всего остального
        </span>
      </h1>

      {/* Urgent card */}
      <div style={{
        padding: '14px 14px',
        background: 'linear-gradient(135deg, rgba(224,138,60,0.08), rgba(224,90,90,0.03))',
        border: '1px solid rgba(224,138,60,0.25)',
        borderRadius: 16,
        marginBottom: 14,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{
            width: 6, height: 6, borderRadius: '50%', background: '#e08a3c',
            boxShadow: '0 0 10px rgba(224,138,60,0.6)',
            display: 'inline-block',
          }} />
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            letterSpacing: 2.5, color: '#e08a3c',
          }}>
            СРОЧНО · БЛИЖАЙШИЕ 3 НЕДЕЛИ
          </span>
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', Georgia, serif",
          fontSize: 20, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 4,
        }}>
          Записаться к терапевту
        </div>
        <div style={{
          fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 10,
        }}>
          Общий осмотр, направления на анализы. Найти клинику рядом, записаться онлайн.
        </div>
        <div style={{
          borderTop: '1px solid var(--border-muted)',
          paddingTop: 8,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            letterSpacing: 2, color: 'var(--text-ghost)',
          }}>
            БЮДЖЕТ
          </span>
          <span style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#e08a3c',
          }}>
            25 000 ₽
          </span>
        </div>
      </div>

      {/* Metrics divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 10,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          letterSpacing: 2.5, color: 'rgba(90,154,224,0.7)',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>ПОКАЗАТЕЛИ</span>
        <div style={{
          flex: 1, height: 1,
          background: 'rgba(90,154,224,0.15)',
        }} />
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          letterSpacing: 2.5, color: 'rgba(90,154,224,0.7)',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>СТАРТ</span>
      </div>

      {/* Metrics grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        marginBottom: 14,
        flexShrink: 0,
      }}>
        {/* ВЕС */}
        <div style={{
          padding: 12,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-faint)',
          borderRadius: 12,
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            letterSpacing: 2, color: 'var(--text-faint)',
            marginBottom: 8,
          }}>ВЕС</div>
          <div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 300,
              fontSize: 26, color: 'var(--text-primary)', letterSpacing: -1,
            }}>
              {latestWeight ? latestWeight.weight : '—'}
            </span>
            {latestWeight && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-ghost)', marginLeft: 4 }}>кг</span>
            )}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: 'var(--gold-text-muted)', marginTop: 4,
          }}>цель: 73-75</div>
        </div>

        {/* СОН */}
        <div style={{
          padding: 12,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-faint)',
          borderRadius: 12,
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            letterSpacing: 2, color: 'var(--text-faint)',
            marginBottom: 8,
          }}>СОН</div>
          <div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 300,
              fontSize: 26, color: 'var(--text-primary)', letterSpacing: -1,
            }}>
              {sleepHours ?? '—'}
            </span>
            {sleepHours && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-ghost)', marginLeft: 4 }}>ч</span>
            )}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: 'var(--gold-text-muted)', marginTop: 4,
          }}>цель: 7+ ч</div>
        </div>

        {/* ЭНЕРГИЯ */}
        <div style={{
          padding: 12,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-faint)',
          borderRadius: 12,
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            letterSpacing: 2, color: 'var(--text-faint)',
            marginBottom: 8,
          }}>ЭНЕРГИЯ</div>
          <div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 300,
              fontSize: 26, color: 'var(--text-primary)', letterSpacing: -1,
            }}>
              {energy > 0 ? energy : '—'}
            </span>
            {energy > 0 && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-ghost)', marginLeft: 4 }}>/10</span>
            )}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: 'var(--gold-text-muted)', marginTop: 4,
          }}>суб. оценка</div>
        </div>

        {/* СИМПТОМЫ */}
        <div style={{
          padding: 12,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-faint)',
          borderRadius: 12,
        }}>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
            letterSpacing: 2, color: 'var(--text-faint)',
            marginBottom: 8,
          }}>СИМПТОМЫ</div>
          <div>
            <span style={{
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 300,
              fontSize: 26, color: '#e08a3c', letterSpacing: -1,
            }}>
              {latestSymp ? activeSymptomCount : '—'}
            </span>
            {latestSymp && (
              <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-ghost)', marginLeft: 4 }}>/7</span>
            )}
          </div>
          <div style={{
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            color: 'var(--gold-text-muted)', marginTop: 4,
          }}>активных</div>
        </div>
      </div>

      {/* Sections divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 8,
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
          letterSpacing: 2.5, color: 'rgba(90,154,224,0.7)',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>РАЗДЕЛЫ</span>
        <div style={{
          flex: 1, height: 1,
          background: 'rgba(90,154,224,0.15)',
        }} />
      </div>

      {/* Navigation rows */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {NAV_ITEMS.map((item, i) => (
            <div
              key={item.screen}
              onClick={() => onNavigate(item.screen)}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 4px',
                borderBottom: i < NAV_ITEMS.length - 1 ? '1px solid var(--border-faint)' : 'none',
                cursor: 'pointer',
              }}
            >
              {/* Icon box */}
              <div style={{
                width: 28, height: 28, borderRadius: 8,
                background: item.bg,
                border: `1px solid ${item.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 14, fontStyle: 'italic',
              }}>
                <span style={{ color: item.color, lineHeight: 1 }}>{item.letter}</span>
              </div>

              {/* Text */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>{item.title}</div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                  color: 'var(--text-ghost)',
                }}>{item.desc}</div>
              </div>

              {/* Arrow */}
              <span style={{ color: 'var(--text-ghost)', fontSize: 16, flexShrink: 0 }}>→</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
