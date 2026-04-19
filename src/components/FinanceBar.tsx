interface Props {
  label: string
  current: number
  target: number
  done?: boolean
  format?: (n: number) => string
}

export function FinanceBar({ label, current, target, done, format }: Props) {
  const pct = Math.min(100, (current / target) * 100)
  const fmt = format || ((n: number) => `${n.toLocaleString('ru-RU')} ₽`)

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="font-mono text-sm text-txt">{label}</span>
        <span className="font-mono text-xs text-ink-mute">
          {fmt(current)} / {fmt(target)}
          {done && <span className="text-accent-green ml-2">✓</span>}
        </span>
      </div>
      <div className="h-2 bg-dusk rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: done ? '#4caf82' : '#c9a84c' }} />
      </div>
    </div>
  )
}
