import { getPathProgress } from '../utils/dates'

const SCHEDULE = [
  { time: '05:30', title: 'Фаджр', tag: 'islam', desc: 'Омовение, намаз, 5 минут зикра' },
  { time: '05:45', title: 'Утренняя рутина', tag: 'health', desc: 'Вода, контрастное умывание, нос' },
  { time: '06:00', title: 'Чтение', tag: 'self', desc: '20 минут — книга' },
  { time: '06:20', title: 'Завтрак', tag: 'health', desc: 'Белок: яйца, творог. Без сладкого' },
  { time: '10:00', title: 'Глубокая работа', tag: 'work', desc: 'Дашборды, проектные задачи' },
  { time: '13:00', title: 'Зухр', tag: 'islam', desc: 'Намаз. 5 минут паузы' },
  { time: '16:30', title: 'Аср', tag: 'islam', desc: 'Намаз. Встать, отойти от стола' },
  { time: '18:30', title: 'Планирование', tag: 'work', desc: 'План на завтра. Закрыть ноутбук' },
  { time: '19:00', title: 'Магриб', tag: 'islam', desc: 'Намаз дома. Время с женой' },
  { time: '19:15', title: 'Зал / прогулка', tag: 'health', desc: '3 раза в неделю силовые' },
  { time: '21:30', title: 'Иша', tag: 'islam', desc: 'Намаз. Вечерний зикр' },
  { time: '22:45', title: 'Стоп-сигнал', tag: 'critical', desc: 'Компьютер закрыт. Телефон в другую комнату' },
  { time: '23:15', title: 'Сон', desc: '7 часов — главное лекарство' },
]

const PHASES = [
  {
    num: '01', title: 'Фундамент', dates: '19 апр — 30 апр',
    priority: { label: 'ЗДОРОВЬЕ · ПРИОРИТЕТ', color: '#e08a3c', items: ['Записаться к терапевту на этой неделе', 'Сдать комплексные анализы', 'Начать промывание носа и ирригатор', 'Вода — 2 литра каждый день'] },
    cards: [
      { label: 'ФИНАНСЫ', color: 'rgba(232,201,106,0.7)', borderColor: 'rgba(201,168,76,0.1)', dashColor: 'rgba(232,201,106,0.5)', items: ['Открыть депозит в Узбекистане', 'Первый перевод 100 000 ₽'] },
      { label: 'ИСЛАМ', color: 'rgba(126,196,160,0.8)', borderColor: 'rgba(76,175,130,0.1)', dashColor: 'rgba(126,196,160,0.5)', items: ['Один намаз — Магриб', 'Установить Muslim Pro'] },
      { label: 'РАБОТА', color: 'rgba(138,184,224,0.8)', borderColor: 'rgba(90,154,224,0.1)', dashColor: 'rgba(138,184,224,0.5)', items: ['Закрыть дашборд до 30 апреля', 'Стоп-сигнал в 18:30'] },
      { label: 'ДОМ', color: 'rgba(216,153,153,0.8)', borderColor: 'rgba(201,123,123,0.1)', dashColor: 'rgba(216,153,153,0.5)', items: ['Договориться с женой о буфере', 'Фиксированный бюджет'] },
    ],
  },
  {
    num: '02', title: 'Строительство', dates: '1 май — 30 июн', opacity: 0.85,
    tags: [
      { text: 'Лечение', type: 'health' }, { text: 'Зал 3×/нед', type: 'health' }, { text: '−3-4 кг', type: 'health' },
      { text: 'LinkedIn', type: 'gold' }, { text: 'Outreach 5', type: 'gold' },
      { text: '+ Фаджр и Иша', type: 'green' },
    ],
  },
  {
    num: '03', title: 'Ускорение', dates: '1 июл — 31 авг', opacity: 0.7,
    tags: [
      { text: '−7-8 кг', type: 'health' }, { text: 'Контроль анализы', type: 'health' },
      { text: 'Собеседования', type: 'gold' },
      { text: '5 намазов', type: 'green' }, { text: 'Джума', type: 'green' },
    ],
  },
  {
    num: '04', title: 'Финал', dates: '1 сен — 31 окт', opacity: 0.55,
    tags: [
      { text: '−10-12 кг', type: 'health' },
      { text: '$12,500+', type: 'gold' }, { text: 'Оффер Ташкент', type: 'gold' },
      { text: 'Возвращение', type: 'green' },
    ],
  },
]

const RULES = [
  { num: '00', text: 'Здоровье — приоритет №1.', extra: ' Без тела нет ничего', priority: true },
  { num: '01', text: '100 000 ₽ на депозит 1-го числа — без исключений' },
  { num: '02', text: 'В 22:45 компьютер закрыт. Работа — на утро' },
  { num: '03', text: 'Кола, энергетики, фастфуд — заменены водой и белком' },
  { num: '04', text: 'Намаз начинается с одного. Добавляю по одному' },
  { num: '05', text: 'Буфер 35k — только форс-мажор. Врачи — это да' },
  { num: '06', text: 'Зал 3 раза в неделю. Пропустил — не наказываю' },
  { num: '07', text: 'В Ташкенте — головной офис, не филиал' },
  { num: '08', text: 'Разовые выплаты 435k — полностью на депозит' },
  { num: '09', text: '20 минут чтения каждое утро — как завтрак' },
  { num: '10', text: 'Shortcut не существует. Мой путь реален' },
]

const TAG_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  islam: { bg: 'rgba(76,175,130,0.15)', color: '#7ec4a0', border: 'none' },
  health: { bg: 'rgba(90,154,224,0.15)', color: '#8ab8e0', border: 'none' },
  work: { bg: 'var(--surface-elevated)', color: 'var(--text-muted)', border: 'none' },
  self: { bg: 'rgba(201,168,76,0.15)', color: 'var(--gold-text)', border: 'none' },
  critical: { bg: 'rgba(224,138,60,0.1)', color: 'rgba(224,138,60,0.8)', border: 'none' },
}

const TAG_LABELS: Record<string, string> = {
  islam: 'ИСЛАМ', health: 'ЗДОРОВЬЕ', work: 'РАБОТА', self: 'РАЗВИТИЕ', critical: 'КРИТИЧНО',
}

const DOT_COLORS: Record<string, string> = {
  islam: '#4caf82',
  health: '#5a9ae0',
  self: 'var(--gold-text)',
  work: 'var(--text-dim)',
  critical: 'rgba(224,138,60,0.6)',
}

const PILL_STYLES: Record<string, { bg: string; color: string; border: string }> = {
  health: { bg: 'rgba(90,154,224,0.1)', color: '#8ab8e0', border: '1px solid rgba(90,154,224,0.2)' },
  gold: { bg: 'rgba(201,168,76,0.1)', color: 'var(--gold-text)', border: '1px solid rgba(201,168,76,0.2)' },
  green: { bg: 'rgba(126,196,160,0.1)', color: '#7ec4a0', border: '1px solid rgba(126,196,160,0.2)' },
}

export function Plan() {
  const { percent, daysLeft } = getPathProgress()

  // Determine which schedule item is "now" based on current hour
  const now = new Date()
  const currentMinutes = now.getHours() * 60 + now.getMinutes()
  let activeIndex = -1
  for (let i = SCHEDULE.length - 1; i >= 0; i--) {
    const [h, m] = SCHEDULE[i].time.split(':').map(Number)
    if (currentMinutes >= h * 60 + m) {
      activeIndex = i
      break
    }
  }

  return (
    <div style={{ padding: '0 20px 40px' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: 3,
            color: 'var(--gold-text-label)',
            marginBottom: 14,
          }}
        >
          ЛИЧНЫЙ ПЛАН · ДОНИЁР ХОДЖАЕВ
        </div>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontWeight: 300,
            fontSize: 40,
            lineHeight: 1.05,
            letterSpacing: -1.2,
            color: 'var(--text-primary)',
            margin: '0 0 14px',
          }}
        >
          Путь к<br />
          <span style={{ color: 'var(--gold-text)', fontStyle: 'italic' }}>новой жизни</span>
        </h1>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'var(--text-faint)',
          }}
        >
          <span>19 апр — 31 окт 2026</span>
          <span style={{ color: 'var(--gold-text-faint)' }}>·</span>
          <span>Москва → Ташкент</span>
        </div>
      </div>

      {/* Progress card */}
      <div
        style={{
          padding: 18,
          background: 'var(--surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 14,
          marginBottom: 28,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 10,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: 2,
            color: 'var(--text-faint)',
          }}
        >
          <span>ПРОГРЕСС</span>
          <span style={{ color: 'var(--gold-text)' }}>{percent.toFixed(1)}%</span>
        </div>
        <div
          style={{
            height: 2,
            background: 'var(--surface-elevated)',
            borderRadius: 2,
            overflow: 'hidden',
            marginBottom: 18,
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              background: 'linear-gradient(90deg, #c9a84c, #e8c96a)',
              borderRadius: 2,
            }}
          />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
          {[
            { value: String(daysLeft), label: 'ДНЕЙ' },
            { value: '$12.5K', label: 'ЦЕЛЬ' },
            { value: '4', label: 'ФАЗЫ' },
            { value: '23', label: 'ЛЕТ' },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 300,
                  fontSize: 22,
                  color: 'var(--gold-text)',
                  letterSpacing: -0.5,
                  lineHeight: 1,
                }}
              >
                {stat.value}
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 8,
                  color: 'var(--text-faint)',
                  letterSpacing: 1.5,
                  marginTop: 6,
                }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ideal Day divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: 3,
            color: 'var(--gold-text-divider)',
          }}
        >
          ИДЕАЛЬНЫЙ ДЕНЬ
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--border-gold)' }} />
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: 'var(--text-ghost)',
          }}
        >
          БУДНИЙ
        </div>
      </div>

      {/* Timeline */}
      <div style={{ position: 'relative', marginBottom: 28 }}>
        {/* Vertical golden line */}
        <div
          style={{
            position: 'absolute',
            left: 49,
            top: 8,
            bottom: 8,
            width: 1,
            background: 'linear-gradient(180deg, rgba(201,168,76,0.3), rgba(255,255,255,0.04))',
            zIndex: 0,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, position: 'relative', zIndex: 1 }}>
          {SCHEDULE.map((item, i) => {
            const isActive = i === activeIndex
            const isPast = i < activeIndex
            const isFuture = i > activeIndex
            const dotColor = item.tag ? DOT_COLORS[item.tag] || 'var(--text-dim)' : 'rgba(168,160,216,0.6)'

            return (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '10px 0',
                  ...(isFuture ? { opacity: 0.6 } : {}),
                }}
              >
                {/* Time */}
                <div
                  style={{
                    width: 38,
                    textAlign: 'right',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 11,
                    color: isActive ? 'var(--gold-text)' : isPast ? 'var(--gold-text-muted)' : 'var(--gold-text-faint)',
                    paddingTop: 3,
                    flexShrink: 0,
                    ...(isActive ? { fontWeight: 500 } : {}),
                  }}
                >
                  {isActive ? now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0') : item.time}
                </div>

                {/* Dot */}
                {isActive ? (
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      background: 'var(--gold-text)',
                      marginTop: 3,
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 2,
                      boxShadow: '0 0 12px rgba(232,201,106,0.6)',
                      marginLeft: -1,
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: 'var(--surface-dot)',
                      border: `1.5px solid ${dotColor}`,
                      marginTop: 4,
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 2,
                    }}
                  />
                )}

                {/* Content */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 14, color: isFuture ? 'var(--text-secondary)' : 'var(--text-primary)', fontWeight: 500 }}>
                      {item.title}{isActive ? ' · сейчас' : ''}
                    </span>
                    {item.tag && TAG_LABELS[item.tag] && (
                      <span
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 8,
                          padding: '2px 6px',
                          borderRadius: 20,
                          background: TAG_STYLES[item.tag]?.bg || 'var(--surface-elevated)',
                          color: TAG_STYLES[item.tag]?.color || 'var(--text-muted)',
                          letterSpacing: 1,
                        }}
                      >
                        {TAG_LABELS[item.tag]}
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: isActive ? 'rgba(232,201,106,0.8)' : 'var(--text-subtle)',
                      lineHeight: 1.4,
                    }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Phases divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: 3,
            color: 'var(--gold-text-divider)',
          }}
        >
          ФАЗЫ ПЛАНА
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--border-gold)' }} />
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            color: 'var(--text-ghost)',
          }}
        >
          4 ФАЗЫ
        </div>
      </div>

      {/* Phases */}
      {PHASES.map((phase, pi) => {
        const isExpanded = pi === 0

        return (
          <div key={phase.num} style={{ marginBottom: pi === PHASES.length - 1 ? 28 : 20, ...('opacity' in phase ? { opacity: phase.opacity } : {}) }}>
            {/* Phase header */}
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 12 }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: 'var(--gold-text-muted)',
                  letterSpacing: 2,
                }}
              >
                ФАЗА {phase.num}
              </span>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', Georgia, serif",
                  fontSize: 24,
                  color: 'var(--text-primary)',
                  letterSpacing: -0.5,
                  fontWeight: 400,
                }}
              >
                {phase.title}
              </span>
              <span
                style={{
                  marginLeft: 'auto',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: 'var(--text-faint)',
                }}
              >
                {phase.dates}
              </span>
            </div>

            {isExpanded && phase.priority ? (
              <>
                {/* Priority health card */}
                <div
                  style={{
                    padding: '14px 16px',
                    background: 'linear-gradient(135deg, rgba(224,138,60,0.08), rgba(224,138,60,0.02))',
                    border: '1px solid rgba(224,138,60,0.2)',
                    borderRadius: 12,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#e08a3c',
                        boxShadow: '0 0 8px rgba(224,138,60,0.5)',
                      }}
                    />
                    <div
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 9,
                        letterSpacing: 2,
                        color: '#e08a3c',
                      }}
                    >
                      {phase.priority.label}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, listStyle: 'none', padding: 0, margin: 0 }}>
                    {phase.priority.items.map((item, j) => (
                      <div
                        key={j}
                        style={{
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          lineHeight: 1.45,
                          paddingLeft: 12,
                          position: 'relative',
                        }}
                      >
                        <span style={{ position: 'absolute', left: 0, color: '#e08a3c' }}>—</span>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2x2 grid cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {phase.cards!.map((card, ci) => (
                    <div
                      key={ci}
                      style={{
                        padding: '12px 14px',
                        background: 'var(--surface-card)',
                        border: `1px solid ${card.borderColor}`,
                        borderRadius: 12,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 9,
                          letterSpacing: 2,
                          color: card.color,
                          marginBottom: 8,
                        }}
                      >
                        {card.label}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        {card.items.map((item, j) => (
                          <div
                            key={j}
                            style={{
                              fontSize: 11,
                              color: 'var(--text-secondary)',
                              lineHeight: 1.45,
                              paddingLeft: 10,
                              position: 'relative',
                            }}
                          >
                            <span style={{ position: 'absolute', left: 0, color: card.dashColor }}>—</span>
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : phase.tags ? (
              <div
                style={{
                  padding: '12px 14px',
                  background: 'var(--surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 12,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {phase.tags.map((tag, ti) => {
                    const s = PILL_STYLES[tag.type] || PILL_STYLES.gold
                    return (
                      <span
                        key={ti}
                        style={{
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: 10,
                          padding: '4px 10px',
                          borderRadius: 20,
                          background: s.bg,
                          color: s.color,
                          border: s.border,
                        }}
                      >
                        {tag.text}
                      </span>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </div>
        )
      })}

      {/* Rules divider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: 3,
            color: 'var(--gold-text-divider)',
          }}
        >
          11 ПРАВИЛ ПУТИ
        </div>
        <div style={{ flex: 1, height: 1, background: 'var(--border-gold)' }} />
      </div>

      {/* Rule 00 - highlighted */}
      <div
        style={{
          padding: '16px 18px',
          background: 'linear-gradient(135deg, rgba(224,138,60,0.06), rgba(224,138,60,0.02))',
          border: '1px solid rgba(224,138,60,0.2)',
          borderRadius: 12,
          marginBottom: 8,
        }}
      >
        <div style={{ display: 'flex', gap: 12 }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 14,
              color: '#e08a3c',
              fontWeight: 500,
            }}
          >
            00
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
            <span style={{ color: '#e08a3c', fontWeight: 500 }}>Здоровье — приоритет №1.</span> Без тела нет ничего
          </span>
        </div>
      </div>

      {/* Rules 01-10 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1, marginBottom: 28 }}>
        {RULES.filter(r => r.num !== '00').map((rule, i) => (
          <div
            key={rule.num}
            style={{
              padding: '12px 4px',
              display: 'flex',
              gap: 12,
              ...(i < RULES.length - 2 ? { borderBottom: '1px solid var(--border-faint)' } : {}),
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--gold-text-faint)',
                minWidth: 18,
              }}
            >
              {rule.num}
            </span>
            <span style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {rule.text}
            </span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '20px',
          textAlign: 'center',
          borderTop: '1px solid var(--border-gold)',
        }}
      >
        <div
          style={{
            width: 24,
            height: 1,
            background: 'var(--gold-text-faint)',
            margin: '0 auto 14px',
          }}
        />
        <div
          style={{
            fontFamily: "'Cormorant Garamond', Georgia, serif",
            fontStyle: 'italic',
            fontSize: 16,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          «Поистину, вместе с трудностью — облегчение»
        </div>
        <div
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: 2,
            color: 'var(--text-ghost)',
            marginTop: 10,
          }}
        >
          КОРАН · 94:6
        </div>
      </div>
    </div>
  )
}
