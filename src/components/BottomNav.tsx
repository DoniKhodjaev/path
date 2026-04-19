import type { Screen } from '../types'

const TABS: { screen: Screen; label: string; icon: string }[] = [
  { screen: 'dashboard', label: 'Главная', icon: '⬡' },
  { screen: 'habits', label: 'Привычки', icon: '✓' },
  { screen: 'finance', label: 'Финансы', icon: '$' },
  { screen: 'levels', label: 'Уровни', icon: '★' },
  { screen: 'settings', label: 'Настройки', icon: '⚙' },
]

interface Props {
  active: Screen
  onChange: (screen: Screen) => void
}

export function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-navy-2 border-t border-navy-3 flex justify-around items-center h-16 z-50 pb-[env(safe-area-inset-bottom)]">
      {TABS.map(({ screen, label, icon }) => (
        <button
          key={screen}
          onClick={() => onChange(screen)}
          className={`flex flex-col items-center gap-0.5 py-2 px-3 transition-colors ${
            active === screen ? 'text-gold' : 'text-txt/50 hover:text-txt/80'
          }`}
        >
          <span className="text-lg font-mono">{icon}</span>
          <span className="text-[10px] font-mono tracking-wide">{label}</span>
        </button>
      ))}
    </nav>
  )
}
