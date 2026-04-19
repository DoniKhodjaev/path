import { useCallback, useRef } from 'react'
import { useStore } from '../store/useStore'
import { getLevelForXp, checkBadges } from '../utils/gamification'
import confetti from 'canvas-confetti'

export function useGamification() {
  const store = useStore()
  const { xp, addXp, badges, awardBadge } = store
  const prevLevelRef = useRef(getLevelForXp(xp).level)

  const awardPoints = useCallback((amount: number) => {
    const oldLevel = getLevelForXp(xp).level
    addXp(amount)
    const newLevel = getLevelForXp(xp + amount).level

    if (newLevel > oldLevel) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#c9a84c', '#e8c96a', '#ffd700'],
      })
    }

    prevLevelRef.current = newLevel
  }, [xp, addXp])

  const checkAndAwardBadges = useCallback(() => {
    const state = useStore.getState()
    const newBadges = checkBadges(state)
    for (const badgeId of newBadges) {
      awardBadge(badgeId)
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#c9a84c', '#4caf82', '#5a9ae0'],
      })
    }
    return newBadges
  }, [awardBadge])

  const currentLevel = getLevelForXp(xp)

  return { awardPoints, checkAndAwardBadges, currentLevel, xp, badges }
}
