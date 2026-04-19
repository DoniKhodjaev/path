import { getLast7Days } from '../utils/dates'

interface Props {
  days: Record<string, boolean>
}

export function StreakGrid({ days }: Props) {
  const last7 = getLast7Days()
  const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

  return (
    <div className="flex gap-1.5 items-end">
      {last7.map((date) => {
        const done = days[date] ?? false
        const d = new Date(date)
        const dayLabel = dayLabels[d.getDay() === 0 ? 6 : d.getDay() - 1]
        return (
          <div key={date} className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-sm transition-colors ${
                done ? 'bg-sacred' : 'bg-dusk/60'
              }`}
            />
            <span className="text-[10px] font-mono text-ink-mute">{dayLabel}</span>
          </div>
        )
      })}
    </div>
  )
}
