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

const THEME_LABELS: Record<ThemeMode, string> = {
  dark: 'Тёмная',
  light: 'Светлая',
  auto: 'Авто',
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: 40,
        height: 22,
        borderRadius: 11,
        backgroundColor: on ? '#c9a84c' : 'rgba(255,255,255,0.1)',
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
          backgroundColor: '#fff',
          position: 'absolute',
          top: 2,
          left: on ? 20 : 2,
          transition: 'left 0.2s',
        }}
      />
    </button>
  )
}

function SectionDivider({ label }: { label: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 28, marginBottom: 8 }}>
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
        padding: '16px 4px',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14, color: '#fff' }}>{label}</div>
        {description && (
          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'rgba(255,255,255,0.4)',
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

  const cycleTheme = () => {
    hapticTap()
    const order: ThemeMode[] = ['dark', 'light', 'auto']
    const idx = order.indexOf(store.theme)
    store.setTheme(order[(idx + 1) % order.length])
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
      <div>
        <div className="px-4 pt-4">
          <button
            onClick={() => setSub('main')}
            className="font-mono mb-2 flex items-center"
            style={{ fontSize: 10, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', border: 'none', background: 'none', cursor: 'pointer' }}
          >
            <span style={{ color: 'rgba(232,201,106,0.6)', marginRight: 6, fontSize: 14 }}>&#8249;</span>
            НАСТРОЙКИ
          </button>
        </div>
        {sub === 'levels' && <Levels />}
        {sub === 'plan' && <Plan />}
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      style={{ padding: '16px 16px 80px 16px' }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.4)',
          }}
        >
          НАСТРОЙКИ
        </span>
        <span
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            letterSpacing: 2,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          v1.0.0
        </span>
      </div>

      {/* Title */}
      <div style={{ marginBottom: 40 }}>
        <h1
          style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
            fontWeight: 300,
            fontSize: 44,
            color: '#fff',
            margin: 0,
            lineHeight: 1.1,
          }}
        >
          Настройки
        </h1>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
            fontStyle: 'italic',
            fontSize: 15,
            color: 'rgba(255,255,255,0.4)',
            margin: '6px 0 0 0',
          }}
        >
          Персональный трекер целей Дониёра
        </p>
      </div>

      {/* Levels / Plan cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
        {/* Levels card */}
        <button
          onClick={() => setSub('levels')}
          style={{
            padding: '18px 16px',
            borderRadius: 14,
            backgroundColor: 'rgba(201,168,76,0.04)',
            border: '1px solid rgba(201,168,76,0.15)',
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
              backgroundColor: 'rgba(201,168,76,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
              color: '#c9a84c',
            }}
          >
            У
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Уровни</div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: '#c9a84c',
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
            padding: '18px 16px',
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.04)',
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
              backgroundColor: 'rgba(80,120,200,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 13,
              fontWeight: 600,
              color: '#5078c8',
            }}
          >
            М
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#fff' }}>Мой план</div>
            <div
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 10,
                color: 'rgba(255,255,255,0.4)',
                marginTop: 2,
              }}
            >
              до 31 окт
            </div>
          </div>
        </button>
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
              color: 'rgba(255,255,255,0.5)',
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
              color: 'rgba(255,255,255,0.5)',
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
                color: 'rgba(255,255,255,0.5)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                textAlign: 'right',
                outline: 'none',
                width: 50,
              }}
            />
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>₽</span>
          </div>
        }
      />

      {/* ТЕМА section */}
      <SectionDivider label="ВНЕШНИЙ ВИД" />

      <SettingRow
        label="Тема оформления"
        description="Тёмная, светлая или авто"
        right={
          <button
            onClick={cycleTheme}
            style={{
              background: 'none',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '4px 12px',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            {THEME_LABELS[store.theme]}
          </button>
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
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              padding: '4px 12px',
              cursor: 'pointer',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              color: 'rgba(255,255,255,0.5)',
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
                backgroundColor: 'rgba(255,255,255,0.05)',
                color: 'rgba(255,255,255,0.5)',
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
      <div style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 16 }}>
        <p
          style={{
            fontFamily: "'Cormorant Garamond', 'Cormorant', serif",
            fontStyle: 'italic',
            fontSize: 14,
            color: 'rgba(255,255,255,0.3)',
            margin: '0 0 8px 0',
          }}
        >
          Путь 2026
        </p>
        <p
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 9,
            letterSpacing: 3,
            color: 'rgba(255,255,255,0.2)',
            margin: 0,
          }}
        >
          СОЗДАНО С НАМЕРЕНИЕМ
        </p>
      </div>
    </motion.div>
  )
}
