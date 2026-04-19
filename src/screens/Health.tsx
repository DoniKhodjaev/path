import { useState } from 'react'
import type { HealthSubScreen } from '../types'
import { HealthDashboard } from './health/HealthDashboard'
import { Doctors } from './health/Doctors'
import { Symptoms } from './health/Symptoms'
import { Weight } from './health/Weight'
import { Sleep } from './health/Sleep'
import { Vitamins } from './health/Vitamins'
import { Photos } from './health/Photos'

export function Health() {
  const [sub, setSub] = useState<HealthSubScreen>('main')

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
          ← Здоровье
        </button>
        <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 16 }}>
          {sub === 'doctors' && <Doctors />}
          {sub === 'symptoms' && <Symptoms />}
          {sub === 'weight' && <Weight />}
          {sub === 'sleep' && <Sleep />}
          {sub === 'vitamins' && <Vitamins />}
          {sub === 'photos' && <Photos />}
        </div>
      </div>
    )
  }

  return <HealthDashboard onNavigate={setSub} />
}
