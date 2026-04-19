import { LEVELS } from './constants'
import type { LevelDefinition, AppState } from '../types'

export function getLevelForXp(xp: number): LevelDefinition {
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].minXp) return LEVELS[i]
  }
  return LEVELS[0]
}

export function getXpToNextLevel(xp: number): { current: number; needed: number; progress: number } {
  const level = getLevelForXp(xp)
  if (level.maxXp === Infinity) return { current: xp - level.minXp, needed: 0, progress: 100 }
  const current = xp - level.minXp
  const needed = level.maxXp - level.minXp
  return { current, needed, progress: (current / needed) * 100 }
}

export interface BadgeDef {
  id: string
  icon: string
  name: string
  description: string
}

export const BADGE_DEFINITIONS: BadgeDef[] = [
  { id: 'first-prayer', icon: '🕌', name: 'Первый намаз', description: 'Отметить первый намаз' },
  { id: 'week-streak', icon: '🔥', name: 'Неделя подряд', description: '7 дней streak' },
  { id: 'iron-will', icon: '💪', name: 'Железная воля', description: '30 дней streak' },
  { id: 'first-deposit', icon: '💰', name: 'Первый депозит', description: 'Первый перевод' },
  { id: 'reader', icon: '📚', name: 'Читатель', description: '7 дней чтения подряд' },
  { id: 'athlete', icon: '🏋️', name: 'Атлет', description: '10 тренировок' },
  { id: 'early-bird', icon: '⏰', name: 'Ранняя птица', description: 'Фаджр 10 дней подряд' },
  { id: 'halfway', icon: '🎯', name: 'Полдороги', description: '50% к финансовой цели' },
  { id: 'tashkent', icon: '🏆', name: 'Ташкент ждёт', description: '100% финансовой цели' },
]

export function checkBadges(state: AppState): string[] {
  const newBadges: string[] = []
  const days = state.days
  const dates = Object.keys(days).sort()

  if (!state.badges.includes('first-prayer')) {
    const hasPrayer = dates.some(d => {
      const dr = days[d]
      return dr.prayers && Object.values(dr.prayers).some(v => v)
    })
    if (hasPrayer) newBadges.push('first-prayer')
  }

  if (!state.badges.includes('first-deposit')) {
    if (Object.values(state.deposits).some(v => v)) newBadges.push('first-deposit')
  }

  if (!state.badges.includes('week-streak')) {
    if (state.streaks.main && state.streaks.main.current >= 7) newBadges.push('week-streak')
  }

  if (!state.badges.includes('iron-will')) {
    if (state.streaks.main && state.streaks.main.current >= 30) newBadges.push('iron-will')
  }

  if (!state.badges.includes('reader')) {
    if (state.streaks.development && state.streaks.development.current >= 7) newBadges.push('reader')
  }

  if (!state.badges.includes('athlete')) {
    const exerciseDays = dates.filter(d => days[d].habits?.exercise).length
    if (exerciseDays >= 10) newBadges.push('athlete')
  }

  if (!state.badges.includes('early-bird')) {
    if (state.streaks.fajr && state.streaks.fajr.current >= 10) newBadges.push('early-bird')
  }

  if (!state.badges.includes('halfway')) {
    if (state.currentSaved >= 531250) newBadges.push('halfway')
  }

  if (!state.badges.includes('tashkent')) {
    if (state.currentSaved >= 1062500) newBadges.push('tashkent')
  }

  return newBadges
}
