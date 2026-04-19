import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTheme } from './hooks/useTheme'
import { BottomNav } from './components/BottomNav'
import { Dashboard } from './screens/Dashboard'
import { Habits } from './screens/Habits'
import { Finance } from './screens/Finance'
import { Health } from './screens/Health'
import { Settings } from './screens/Settings'
import type { Screen } from './types'

const screenComponents: Record<Screen, React.ComponentType> = {
  dashboard: Dashboard,
  habits: Habits,
  finance: Finance,
  health: Health,
  settings: Settings,
}

function App() {
  useTheme()
  const [screen, setScreen] = useState<Screen>('dashboard')

  const ScreenComponent = screenComponents[screen]

  return (
    <div className="min-h-dvh bg-night text-txt">
      <main className="max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          >
            <ScreenComponent />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav active={screen} onChange={setScreen} />
    </div>
  )
}

export default App
