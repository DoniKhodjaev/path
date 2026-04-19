import {
  House,
  CheckSquare,
  CurrencyDollar,
  Heart,
  GearSix,
} from '@phosphor-icons/react'
import type { Icon } from '@phosphor-icons/react'
import type { Screen } from '../types'

const TABS: { screen: Screen; label: string; Icon: Icon }[] = [
  { screen: 'dashboard', label: 'Главная',   Icon: House          },
  { screen: 'habits',    label: 'Привычки',  Icon: CheckSquare    },
  { screen: 'finance',   label: 'Финансы',   Icon: CurrencyDollar },
  { screen: 'health',    label: 'Здоровье',  Icon: Heart          },
  { screen: 'settings',  label: 'Настройки', Icon: GearSix        },
]

interface Props {
  active: Screen
  onChange: (screen: Screen) => void
}

export function BottomNav({ active, onChange }: Props) {
  function handleChange(screen: Screen) {
    navigator.vibrate?.(10)
    onChange(screen)
  }

  return (
    <nav
      className="
        fixed bottom-0 left-0 right-0 z-50
        bg-night/80 backdrop-blur-xl
        border-t border-white/5
        flex justify-around items-center
        h-[68px]
        pb-[env(safe-area-inset-bottom)]
      "
    >
      {TABS.map(({ screen, label, Icon: TabIcon }) => {
        const isActive = active === screen
        return (
          <button
            key={screen}
            onClick={() => handleChange(screen)}
            aria-label={label}
            aria-current={isActive ? 'page' : undefined}
            className={`
              relative flex flex-col items-center justify-center gap-0.5
              min-w-[44px] min-h-[44px] px-3 py-1
              transition-colors duration-150
              ${isActive ? 'text-gold' : 'text-ink-mute hover:text-ink'}
            `}
          >
            <TabIcon
              size={24}
              weight="duotone"
            />
            <span className="text-[10px] font-ui tracking-wide leading-none">
              {label}
            </span>
            {isActive && (
              <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-gold" />
            )}
          </button>
        )
      })}
    </nav>
  )
}
