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
      <div className="p-4 pb-20">
        <button onClick={() => setSub('main')} className="font-mono text-xs text-gold/50 hover:text-gold mb-4 flex items-center gap-1">
          ← Здоровье
        </button>
        {sub === 'doctors' && <Doctors />}
        {sub === 'symptoms' && <Symptoms />}
        {sub === 'weight' && <Weight />}
        {sub === 'sleep' && <Sleep />}
        {sub === 'vitamins' && <Vitamins />}
        {sub === 'photos' && <Photos />}
      </div>
    )
  }

  return <HealthDashboard onNavigate={setSub} />
}
