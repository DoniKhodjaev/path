import { useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { useNotifications } from '../hooks/useNotifications'
import { CITIES } from '../utils/constants'
import { getLevelForXp } from '../utils/gamification'
import { hapticTap } from '../utils/haptic'
import { Levels } from './Levels'
import { Plan } from './Plan'
import type { ThemeMode } from '../types'

type SettingsSub = 'main' | 'levels' | 'plan'

const CALC_METHODS = [
  { id: 'MuslimWorldLeague', label: 'Muslim World League' },
  { id: 'Egyptian', label: 'Egyptian General Authority' },
  { id: 'Karachi', label: 'University of Karachi' },
  { id: 'Tehran', label: 'Institute of Geophysics, Tehran' },
  { id: 'MoonsightingCommittee', label: 'Moonsighting Committee' },
]

const THEME_OPTIONS: { mode: ThemeMode; label: string; emoji: string }[] = [
  { mode: 'dark', label: 'Тёмная', emoji: '🌙' },
  { mode: 'light', label: 'Светлая', emoji: '☀️' },
  { mode: 'auto', label: 'Авто', emoji: '⚙️' },
]

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        backgroundColor: on ? '#c9a84c' : 'var(--surface-elevated)',
        position: 'relative',
        border: 'none',
        cursor: 'pointer',
        flexShrink: 0,
        transition: 'background-color 0.2s',
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: '50%',
          backgroundColor: on ? 'var(--text-primary)' : 'var(--text-subtle)',
          position: 'absolute',
          top: 2,
          ...(on
            ? { right: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }
            : { left: 2 }),
          transition: 'left 0.2s, right 0.2s',
        }}
      />
    </button>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 16, marginBottom: 6 }}>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: 2,
          color: 'rgba(201,168,76,0.7)',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(201,168,76,0.15)' }} />
    </div>
  )
}

function SettingRow({
  label,
  description,
  right,
}: {
  label: string
  description?: string
  right: React.ReactNode
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 4px',
        borderBottom: '1px solid var(--border-faint)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: 'var(--text-primary)' }}>{label}</div>
        {description && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--text-faint)',
              marginTop: 2,
            }}
          >
            {description}
          </div>
        )}
      </div>
      <div style={{ marginLeft: 12, flexShrink: 0 }}>{right}</div>
    </div>
  )
}

export function Settings() {
  const store = useStore()
  const { notificationSettings, setNotificationSettings, requestPermission, subscribe } = useNotifications()
  const [showReset, setShowReset] = useState(false)
  const [sub, setSub] = useState<SettingsSub>('main')

  const levelInfo = getLevelForXp(store.xp)

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const city = CITIES.find(c => c.name === e.target.value)
    if (city) store.setCity(city.name, city.lat, city.lon)
  }

  const handleNotificationToggle = async (key: keyof typeof notificationSettings) => {
    const newVal = !notificationSettings[key]
    setNotificationSettings({ [key]: newVal })
    if (newVal) {
      const granted = await requestPermission()
      if (granted) await subscribe()
    }
  }

  const handleThemeSelect = (mode: ThemeMode) => {
    hapticTap()
    store.setTheme(mode)
  }

  const handleExport = () => {
    const data = JSON.stringify(useStore.getState(), null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'path2026-backup.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  const notifOptions = [
    { key: 'prayers' as const, label: 'Время намазов', desc: 'За 10 минут до азана' },
    { key: 'sleep' as const, label: 'Напоминание лечь спать', desc: '22:45' },
    { key: 'deposit' as const, label: 'Ежемесячный депозит', desc: '1-е число месяца' },
    { key: 'morning' as const, label: 'Утренний чеклист', desc: '06:00' },
  ]

  if (sub !== 'main') {
    return (
      <div style={{
        height: 'calc(100dvh - 70px - env(safe-area-inset-bottom, 0px))',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 0',
      }}>
        <button
          onClick={() => setSub('main')}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            color: 'rgba(201,168,76,0.5)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px 0',
            marginBottom: 8,
            textAlign: 'left',
            flexShrink: 0,
          }}
        >
          ← Настройки
        </button>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
          {sub === 'levels' && <Levels />}
          {sub === 'plan' && <Plan />}
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{
        height: 'calc(100dvh - 70px - env(safe-area-inset-bottom, 0px))',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{
        position: 'relative',
        zIndex: 1,
        padding: 'calc(16px + env(safe-area-inset-top, 0px)) 20px 0',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        overflow: 'hidden',
      }}>
        {/* Status bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: 2,
              color: 'var(--text-faint)',
            }}
          >
            НАСТРОЙКИ
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10,
              letterSpacing: 2,
              color: 'var(--text-ghost)',
            }}
          >
            v1.0.0
          </span>
        </div>

        {/* Title section */}
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontWeight: 300,
              fontSize: 36,
              lineHeight: 1.05,
              letterSpacing: -1,
              color: 'var(--text-primary)',
              margin: '0 0 4px',
            }}
          >
            Настройки
          </h1>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 14,
              color: 'var(--text-faint)',
              margin: 0,
            }}
          >
            Персональный трекер целей Дониёра
          </p>
        </div>

        {/* Scrollable content */}
        <div style={{ flex: 1, overflowY: 'auto', marginRight: -4, paddingRight: 4, paddingBottom: 16 }}>

        {/* Level / Plan cards */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          {/* Levels card */}
          <button
            onClick={() => setSub('levels')}
            style={{
              padding: '14px 14px',
              background: 'rgba(201,168,76,0.04)',
              border: '1px solid rgba(201,168,76,0.15)',
              borderRadius: 14,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(201,168,76,0.1)',
                border: '1px solid rgba(201,168,76,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Cormorant Garamond', serif",
                color: 'var(--gold-text)',
                fontSize: 16,
                fontStyle: 'italic',
              }}
            >
              У
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>Уровни</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: 'rgba(232,201,106,0.7)',
                  marginTop: 2,
                }}
              >
                Ур. {levelInfo.level} · {store.xp} XP
              </div>
            </div>
          </button>

          {/* Plan card */}
          <button
            onClick={() => setSub('plan')}
            style={{
              padding: '14px 14px',
              background: 'var(--surface-card)',
              border: '1px solid var(--border-faint)',
              borderRadius: 14,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                background: 'rgba(80,120,200,0.1)',
                border: '1px solid rgba(80,120,200,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Cormorant Garamond', serif",
                color: '#6a9ee8',
                fontSize: 16,
                fontStyle: 'italic',
              }}
            >
              М
            </div>
            <div>
              <div style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>Мой план</div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 10,
                  color: 'var(--text-faint)',
                  marginTop: 2,
                }}
              >
                до 31 окт
              </div>
            </div>
          </button>
        </div>

        {/* ВНЕШНИЙ ВИД section */}
        <SectionDivider label="ВНЕШНИЙ ВИД" />

        <div style={{ padding: '16px 4px' }}>
          <div style={{ fontSize: 14, color: 'var(--text-primary)', marginBottom: 2 }}>Тема</div>
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'var(--text-faint)',
              marginBottom: 12,
            }}
          >
            Оформление интерфейса
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
            {THEME_OPTIONS.map(opt => {
              const isActive = store.theme === opt.mode
              return (
                <button
                  key={opt.mode}
                  onClick={() => handleThemeSelect(opt.mode)}
                  style={{
                    padding: '14px 8px',
                    background: isActive ? 'rgba(201,168,76,0.06)' : 'var(--surface-card)',
                    border: isActive ? '2px solid #c9a84c' : '1px solid var(--border-muted)',
                    borderRadius: 12,
                    textAlign: 'center',
                    cursor: 'pointer',
                    opacity: isActive ? 1 : 0.6,
                  }}
                >
                  <div style={{ fontSize: 20, marginBottom: 6 }}>{opt.emoji}</div>
                  <div
                    style={{
                      fontSize: 12,
                      color: isActive ? 'var(--gold-text)' : 'var(--text-subtle)',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  >
                    {opt.label}
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        {/* НАМАЗЫ section */}
        <SectionDivider label="НАМАЗЫ" />

        <SettingRow
          label="Город"
          description="Для расчёта времени намазов"
          right={
            <select
              value={store.city}
              onChange={handleCityChange}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-subtle)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                textAlign: 'right',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                paddingRight: 0,
              }}
            >
              {CITIES.map(c => (
                <option key={c.name} value={c.name} style={{ backgroundColor: '#1a1a1a' }}>
                  {c.name}
                </option>
              ))}
            </select>
          }
        />

        <SettingRow
          label="Метод расчёта"
          description="Алгоритм вычисления"
          right={
            <select
              value={store.calculationMethod}
              onChange={e => store.setCalculationMethod(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: 'var(--text-subtle)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                textAlign: 'right',
                cursor: 'pointer',
                outline: 'none',
                appearance: 'none',
                WebkitAppearance: 'none',
                paddingRight: 0,
                maxWidth: 140,
              }}
            >
              {CALC_METHODS.map(m => (
                <option key={m.id} value={m.id} style={{ backgroundColor: '#1a1a1a' }}>
                  {m.label}
                </option>
              ))}
            </select>
          }
        />

        {/* ФИНАНСЫ section */}
        <SectionDivider label="ФИНАНСЫ" />

        <SettingRow
          label="Курс доллара"
          description="Для расчёта в рублях"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="number"
                value={store.exchangeRate}
                onChange={e => store.setExchangeRate(Number(e.target.value) || 85)}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  textAlign: 'right',
                  outline: 'none',
                  width: 50,
                }}
              />
              <span style={{ color: 'var(--text-ghost)', fontSize: 12 }}>₽</span>
            </div>
          }
        />

        <SettingRow
          label="Цель накоплений"
          description="Сумма в долларах"
          right={
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ color: 'var(--text-ghost)', fontSize: 12 }}>$</span>
              <input
                type="number"
                value={(store as any).savingsGoal ?? 10000}
                onChange={e => {
                  const val = Number(e.target.value)
                  if ('setSavingsGoal' in store) {
                    ;(store as any).setSavingsGoal(val || 10000)
                  }
                }}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-subtle)',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  textAlign: 'right',
                  outline: 'none',
                  width: 60,
                }}
              />
            </div>
          }
        />

        {/* PUSH-УВЕДОМЛЕНИЯ section */}
        <SectionDivider label="PUSH-УВЕДОМЛЕНИЯ" />

        {notifOptions.map(({ key, label, desc }) => (
          <SettingRow
            key={key}
            label={label}
            description={desc}
            right={
              <Toggle
                on={notificationSettings[key]}
                onToggle={() => handleNotificationToggle(key)}
              />
            }
          />
        ))}

        {/* ДАННЫЕ section */}
        <SectionDivider label="ДАННЫЕ" />

        <SettingRow
          label="Экспорт данных"
          description="Скачать JSON-бэкап"
          right={
            <button
              onClick={handleExport}
              style={{
                background: 'none',
                border: '1px solid var(--border-muted)',
                borderRadius: 8,
                padding: '4px 12px',
                cursor: 'pointer',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 11,
                color: 'var(--text-subtle)',
              }}
            >
              Скачать
            </button>
          }
        />

        {showReset ? (
          <div style={{ padding: '16px 4px' }}>
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                color: '#e53e3e',
                marginBottom: 12,
              }}
            >
              Вы уверены? Все данные будут удалены.
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  store.resetAll()
                  setShowReset(false)
                }}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  backgroundColor: 'rgba(229,62,62,0.15)',
                  color: '#e53e3e',
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Да, сбросить
              </button>
              <button
                onClick={() => setShowReset(false)}
                style={{
                  flex: 1,
                  padding: '8px 0',
                  backgroundColor: 'var(--border-subtle)',
                  color: 'var(--text-subtle)',
                  border: 'none',
                  borderRadius: 8,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Отмена
              </button>
            </div>
          </div>
        ) : (
          <SettingRow
            label="Сбросить все данные"
            description="Удалить прогресс и настройки"
            right={
              <button
                onClick={() => setShowReset(true)}
                style={{
                  background: 'none',
                  border: '1px solid rgba(229,62,62,0.2)',
                  borderRadius: 8,
                  padding: '4px 12px',
                  cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 11,
                  color: '#e53e3e',
                }}
              >
                Сброс
              </button>
            }
          />
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '16px 0 8px' }}>
          <p
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontStyle: 'italic',
              fontSize: 13,
              color: 'var(--text-ghost)',
              margin: '0 0 4px 0',
            }}
          >
            Путь 2026
          </p>
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 9,
              letterSpacing: 3,
              color: 'var(--text-dim)',
              margin: 0,
            }}
          >
            СОЗДАНО С НАМЕРЕНИЕМ
          </p>
        </div>

        </div>{/* end scrollable */}
      </div>
    </motion.div>
  )
}
