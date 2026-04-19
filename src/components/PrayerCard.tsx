interface Props {
  name: string
  label: string
  time: string
  isActive: boolean
  isDone: boolean
  onToggle: () => void
}

export function PrayerCard({ label, time, isActive, isDone, onToggle }: Props) {
  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg transition-all ${
        isActive
          ? 'bg-gold/10 border border-gold/30'
          : 'bg-dusk/50 border border-dusk'
      }`}
    >
      <div>
        <p className={`font-heading text-lg ${isActive ? 'text-gold' : 'text-txt'}`}>
          {label}
        </p>
        <p className="font-mono text-sm text-ink-mute">{time}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
          isDone
            ? 'bg-sacred/20 border-sacred text-sacred'
            : isActive
            ? 'border-gold/50 text-gold/50 hover:border-gold'
            : 'border-dusk text-ink-mute hover:border-ink-mute'
        }`}
      >
        {isDone ? '✓' : ''}
      </button>
    </div>
  )
}
