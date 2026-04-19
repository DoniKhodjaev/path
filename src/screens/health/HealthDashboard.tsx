import { useHealthStore } from '../../store/useHealthStore'
import { todayStr } from '../../utils/dates'
import { SYMPTOM_LIST } from '../../utils/healthConstants'
import type { HealthSubScreen } from '../../types'

interface Props {
  onNavigate: (screen: HealthSubScreen) => void
}

const SECTIONS: {
  letter: string
  title: string
  desc: string
  screen: HealthSubScreen
  color: string
  bg: string
}[] = [
  { letter: 'А', title: 'Анализы и врачи', desc: 'визиты · результаты · чеклист', screen: 'doctors', color: '#8ab8e0', bg: 'rgba(90,154,224,0.12)' },
  { letter: 'С', title: 'Симптомы', desc: 'трекинг · динамика · заметки', screen: 'symptoms', color: '#e08a3c', bg: 'rgba(224,138,60,0.12)' },
  { letter: 'В', title: 'Вес и тело', desc: 'вес · замеры · прогресс', screen: 'weight', color: '#e8c96a', bg: 'rgba(201,168,76,0.12)' },
  { letter: 'С', title: 'Сон', desc: 'длительность · качество · режим', screen: 'sleep', color: '#a8a0d8', bg: 'rgba(126,111,210,0.12)' },
  { letter: 'В', title: 'Витамины', desc: 'курсы · приём · напоминания', screen: 'vitamins', color: '#7ec4a0', bg: 'rgba(76,175,130,0.12)' },
  { letter: 'Ф', title: 'Фото прогресса', desc: 'до/после · сравнение · таймлайн', screen: 'photos', color: '#d89999', bg: 'rgba(201,123,123,0.12)' },
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

  // Upcoming doctor visit
  const upcoming = health.doctorVisits
    .filter(v => v.status === 'planned' && v.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))[0]

  return (
    <div style={{ padding: '16px 16px 80px', maxWidth: 480, margin: '0 auto' }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 20,
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase',
        }}>
          ЗДОРОВЬЕ · 19 АПР
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          letterSpacing: 2, color: '#e08a3c',
        }}>
          ● ЭТАП 0
        </span>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 36 }}>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, Cormorant, serif', fontWeight: 300,
          fontSize: 40, lineHeight: 1.1, color: '#ffffff', margin: 0,
        }}>
          Здоровье
        </h1>
        <span style={{
          fontFamily: 'Cormorant Garamond, Cormorant, serif', fontWeight: 300,
          fontSize: 32, fontStyle: 'italic', color: 'rgba(90,154,224,0.85)',
        }}>
          до всего остального
        </span>
      </div>

      {/* Urgent card */}
      {upcoming && (
        <div style={{
          padding: 20,
          background: 'linear-gradient(135deg, rgba(224,138,60,0.08), rgba(224,90,90,0.03))',
          border: '1px solid rgba(224,138,60,0.25)',
          borderRadius: 16,
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#e08a3c',
              display: 'inline-block',
            }} />
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
              letterSpacing: 2, color: '#e08a3c', textTransform: 'uppercase',
            }}>
              СРОЧНО · БЛИЖАЙШИЕ 3 НЕДЕЛИ
            </span>
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond, Cormorant, serif',
            fontSize: 20, color: '#ffffff', marginBottom: 6,
          }}>
            Записаться к терапевту
          </div>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5,
            marginBottom: 12,
          }}>
            Общий осмотр, направления на анализы. Найти клинику рядом, записаться онлайн.
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#e08a3c',
            }}>
              25 000 ₽
            </span>
          </div>
        </div>
      )}

      {/* If no upcoming visit, show a static urgent card */}
      {!upcoming && (
        <div style={{
          padding: 20,
          background: 'linear-gradient(135deg, rgba(224,138,60,0.08), rgba(224,90,90,0.03))',
          border: '1px solid rgba(224,138,60,0.25)',
          borderRadius: 16,
          marginBottom: 20,
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10,
          }}>
            <span style={{
              width: 6, height: 6, borderRadius: '50%', background: '#e08a3c',
              display: 'inline-block',
            }} />
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
              letterSpacing: 2, color: '#e08a3c', textTransform: 'uppercase',
            }}>
              СРОЧНО · БЛИЖАЙШИЕ 3 НЕДЕЛИ
            </span>
          </div>
          <div style={{
            fontFamily: 'Cormorant Garamond, Cormorant, serif',
            fontSize: 20, color: '#ffffff', marginBottom: 6,
          }}>
            Записаться к терапевту
          </div>
          <div style={{
            fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.5,
            marginBottom: 12,
          }}>
            Общий осмотр, направления на анализы. Найти клинику рядом, записаться онлайн.
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <span style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#e08a3c',
            }}>
              25 000 ₽
            </span>
          </div>
        </div>
      )}

      {/* Metrics grid 2x2 */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10,
        marginBottom: 28,
      }}>
        {/* ВЕС */}
        <div style={{
          padding: 16,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 12,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            letterSpacing: 2, color: 'rgba(255,255,255,0.35)',
            marginBottom: 6, textTransform: 'uppercase',
          }}>ВЕС</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 300,
            fontSize: 26, color: '#ffffff',
          }}>
            {latestWeight ? latestWeight.weight : '—'}
            {latestWeight && (
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginLeft: 3 }}>кг</span>
            )}
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            color: 'rgba(201,168,76,0.7)', marginTop: 4,
          }}>цель: 73-75</div>
        </div>

        {/* СОН */}
        <div style={{
          padding: 16,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 12,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            letterSpacing: 2, color: 'rgba(255,255,255,0.35)',
            marginBottom: 6, textTransform: 'uppercase',
          }}>СОН</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 300,
            fontSize: 26, color: '#ffffff',
          }}>
            {sleepHours ?? '—'}
            {sleepHours && (
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginLeft: 3 }}>ч</span>
            )}
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            color: 'rgba(201,168,76,0.7)', marginTop: 4,
          }}>цель: 7+ ч</div>
        </div>

        {/* ЭНЕРГИЯ */}
        <div style={{
          padding: 16,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 12,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            letterSpacing: 2, color: 'rgba(255,255,255,0.35)',
            marginBottom: 6, textTransform: 'uppercase',
          }}>ЭНЕРГИЯ</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 300,
            fontSize: 26, color: '#ffffff',
          }}>
            {energy > 0 ? energy : '—'}
            {energy > 0 && (
              <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', marginLeft: 3 }}>/10</span>
            )}
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            color: 'rgba(201,168,76,0.7)', marginTop: 4,
          }}>суб. оценка</div>
        </div>

        {/* СИМПТОМЫ */}
        <div style={{
          padding: 16,
          background: 'rgba(255,255,255,0.02)',
          border: '1px solid rgba(255,255,255,0.04)',
          borderRadius: 12,
        }}>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            letterSpacing: 2, color: 'rgba(255,255,255,0.35)',
            marginBottom: 6, textTransform: 'uppercase',
          }}>СИМПТОМЫ</div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 300,
            fontSize: 26, color: '#e08a3c',
          }}>
            {latestSymp ? activeSymptomCount : '—'}
            {latestSymp && (
              <span style={{ fontSize: 13, color: 'rgba(224,138,60,0.5)', marginLeft: 3 }}>/7</span>
            )}
          </div>
          <div style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
            color: 'rgba(224,138,60,0.5)', marginTop: 4,
          }}>активных</div>
        </div>
      </div>

      {/* Sections divider */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        marginBottom: 16,
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
          letterSpacing: 2, color: 'rgba(90,154,224,0.7)',
          textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>РАЗДЕЛЫ</span>
        <div style={{
          flex: 1, height: 1,
          background: 'rgba(90,154,224,0.15)',
        }} />
      </div>

      {/* Section navigation */}
      <div style={{ marginBottom: 28 }}>
        {SECTIONS.map((sec, i) => (
          <button
            key={sec.screen}
            onClick={() => onNavigate(sec.screen)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '12px 0',
              background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: i < SECTIONS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
              textAlign: 'left',
            }}
          >
            {/* Icon box */}
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: sec.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{
                fontFamily: 'Cormorant Garamond, Cormorant, serif',
                fontStyle: 'italic', fontSize: 16, color: sec.color,
                lineHeight: 1,
              }}>{sec.letter}</span>
            </div>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 14, color: '#ffffff', marginBottom: 2,
              }}>{sec.title}</div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                color: 'rgba(255,255,255,0.3)',
              }}>{sec.desc}</div>
            </div>

            {/* Arrow */}
            <span style={{
              fontSize: 16, color: 'rgba(255,255,255,0.15)', flexShrink: 0,
            }}>→</span>
          </button>
        ))}
      </div>

      {/* Bottom hadith */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        borderRadius: 12,
        padding: 16,
      }}>
        <div style={{
          fontFamily: 'Cormorant Garamond, Cormorant, serif',
          fontStyle: 'italic', fontSize: 14, color: 'rgba(255,255,255,0.45)',
          lineHeight: 1.6, marginBottom: 8,
        }}>
          «Воистину, у твоего тела есть на тебя право»
        </div>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 9,
          color: 'rgba(255,255,255,0.2)', letterSpacing: 1,
        }}>
          САХИХ АЛЬ-БУХАРИ
        </div>
      </div>
    </div>
  )
}
