import { useState } from 'react'

interface Props {
  label: string
  checked: boolean
  onToggle: () => void
  onXpAwarded?: () => void
}

export function HabitItem({ label, checked, onToggle, onXpAwarded }: Props) {
  const [showXp, setShowXp] = useState(false)

  const handleToggle = () => {
    if (!checked) {
      setShowXp(true)
      setTimeout(() => setShowXp(false), 1000)
      onXpAwarded?.()
    }
    onToggle()
  }

  return (
    <div className="flex items-center gap-3 py-2.5 px-3 relative">
      <button
        onClick={handleToggle}
        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all text-sm ${
          checked
            ? 'bg-gold/20 border-gold text-gold'
            : 'border-navy-3 hover:border-gold/50'
        }`}
      >
        {checked ? '✓' : ''}
      </button>
      <span className={`font-mono text-sm ${checked ? 'text-txt/40 line-through' : 'text-txt'}`}>
        {label}
      </span>
      {showXp && (
        <span className="absolute right-3 text-gold font-mono text-sm animate-float-up">
          +10 XP
        </span>
      )}
    </div>
  )
}
