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
          : 'bg-navy-3/50 border border-navy-3'
      }`}
    >
      <div>
        <p className={`font-heading text-lg ${isActive ? 'text-gold' : 'text-txt'}`}>
          {label}
        </p>
        <p className="font-mono text-sm text-txt/60">{time}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all ${
          isDone
            ? 'bg-accent-green/20 border-accent-green text-accent-green'
            : isActive
            ? 'border-gold/50 text-gold/50 hover:border-gold'
            : 'border-navy-3 text-txt/30 hover:border-txt/50'
        }`}
      >
        {isDone ? '✓' : ''}
      </button>
    </div>
  )
}
