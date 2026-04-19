import { useState } from 'react'
import { motion } from 'framer-motion'
import { hapticTap } from '../utils/haptic'
import { easeApple } from '../utils/motion'

interface Props {
  label: string
  checked: boolean
  onToggle: () => void
  onXpAwarded?: () => void
}

export function HabitItem({ label, checked, onToggle, onXpAwarded }: Props) {
  const [showXp, setShowXp] = useState(false)
  const [justChecked, setJustChecked] = useState(false)

  const handleToggle = () => {
    hapticTap()
    if (!checked) {
      setShowXp(true)
      setJustChecked(true)
      setTimeout(() => setShowXp(false), 1000)
      setTimeout(() => setJustChecked(false), 300)
      onXpAwarded?.()
    }
    onToggle()
  }

  return (
    <motion.div
      layout
      transition={{ duration: 0.25, ease: easeApple }}
      className={`flex items-center gap-3 py-3 px-4 relative transition-transform duration-150 ${
        justChecked ? 'scale-[1.02]' : 'scale-100'
      }`}
    >
      {/* Touch target wrapping visual checkbox */}
      <button
        onClick={handleToggle}
        className="w-7 h-7 flex items-center justify-center flex-shrink-0 focus:outline-none"
        aria-label={checked ? 'Снять отметку' : 'Отметить выполненным'}
      >
        <div
          className={`w-5 h-5 rounded-md flex items-center justify-center transition-all duration-200 ${
            checked
              ? 'bg-sacred/20 border border-sacred'
              : 'bg-transparent border border-dusk'
          }`}
        >
          {checked && (
            <svg
              width="12"
              height="10"
              viewBox="0 0 12 10"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="overflow-visible"
            >
              <polyline
                points="1.5,5 4.5,8 10.5,1.5"
                stroke="#4caf82"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="animate-check-draw"
              />
            </svg>
          )}
        </div>
      </button>

      {/* Label */}
      <span
        className={`font-ui text-sm leading-snug transition-all duration-200 ${
          checked ? 'text-ink-mute line-through' : 'text-ink'
        }`}
      >
        {label}
      </span>

      {/* XP popup */}
      {showXp && (
        <span className="absolute right-4 text-gold font-mono text-xs tabular-nums animate-float-up pointer-events-none">
          +10 XP
        </span>
      )}
    </motion.div>
  )
}
