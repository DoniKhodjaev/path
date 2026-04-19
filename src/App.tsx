import { useState } from 'react'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './screens/Dashboard'
import { Habits } from './screens/Habits'
import { Finance } from './screens/Finance'
import { Levels } from './screens/Levels'
import { Settings } from './screens/Settings'
import type { Screen } from './types'

function App() {
  const [screen, setScreen] = useState<Screen>('dashboard')

  return (
    <div className="min-h-dvh bg-navy text-txt">
      <main className="max-w-lg mx-auto">
        {screen === 'dashboard' && <Dashboard />}
        {screen === 'habits' && <Habits />}
        {screen === 'finance' && <Finance />}
        {screen === 'levels' && <Levels />}
        {screen === 'settings' && <Settings />}
      </main>
      <BottomNav active={screen} onChange={setScreen} />
    </div>
  )
}

export default App
