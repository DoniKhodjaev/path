interface Props {
  icon: string
  name: string
  description: string
  earned: boolean
}

export function LevelBadge({ icon, name, description, earned }: Props) {
  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
      earned ? 'bg-gold/5 border-gold/20' : 'bg-navy-3/30 border-navy-3/50 opacity-40'
    }`}>
      <span className="text-2xl">{icon}</span>
      <div>
        <p className={`font-heading text-sm ${earned ? 'text-gold' : 'text-txt/50'}`}>{name}</p>
        <p className="text-[11px] font-mono text-txt/40">{description}</p>
      </div>
    </div>
  )
}
