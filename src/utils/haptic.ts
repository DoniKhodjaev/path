/** Haptic feedback for mobile PWA */
export function haptic(pattern: number | number[] = 10) {
  navigator.vibrate?.(pattern)
}

export const hapticTap = () => haptic(10)
export const hapticSuccess = () => haptic([10, 50, 10])
export const hapticLevelUp = () => haptic([20, 100, 20, 100, 50])
