interface Props {
  icon: string
  name: string
  description: string
  earned: boolean
}

export function LevelBadge({ icon, name, description, earned }: Props) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      earned ? 'bg-gold/5 border-gold/20' : 'bg-dusk/30 border-dusk/50 opacity-40'
    }`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className={`font-heading text-sm ${earned ? 'text-gold' : 'text-ink-mute'}`}>{name}</p>
        <p className="text-[11px] font-mono text-ink-mute">{description}</p>
      </div>
    </div>
  )
}
