import { PATH_START, PATH_END } from './constants'

export function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

export function formatDateRussian(date: Date): string {
  return date.toLocaleDateString('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function getPathProgress(): { percent: number; daysLeft: number } {
  const now = Date.now()
  const total = PATH_END.getTime() - PATH_START.getTime()
  const elapsed = now - PATH_START.getTime()
  const percent = Math.min(100, Math.max(0, (elapsed / total) * 100))
  const daysLeft = Math.max(0, Math.ceil((PATH_END.getTime() - now) / 86_400_000))
  return { percent, daysLeft }
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}

export function getLast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export function daysBetween(a: string, b: string): number {
  const da = new Date(a).getTime()
  const db = new Date(b).getTime()
  return Math.round(Math.abs(db - da) / 86_400_000)
}
