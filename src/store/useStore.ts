import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { AppState, DayRecord, HabitDefinition, NotificationSettings, ThemeMode } from '../types'

const initialState = {
  city: 'Москва',
  lat: 55.7558,
  lon: 37.6173,
  calculationMethod: 'MuslimWorldLeague',
  exchangeRate: 85,
  theme: 'dark' as ThemeMode,
  days: {} as Record<string, DayRecord>,
  deposits: {} as Record<string, boolean>,
  currentSaved: 0,
  specialPayments: {
    'deposit-return': 'waiting' as const,
    'vacation-pay': 'waiting' as const,
    'bonus-13': 'waiting' as const,
  },
  xp: 0,
  badges: [] as string[],
  streaks: {} as Record<string, { current: number; lastDate: string }>,
  notificationSettings: {
    prayers: true,
    sleep: true,
    deposit: true,
    morning: true,
  },
  pushSubscription: null as string | null,
  customHabits: [] as HabitDefinition[],
}

function ensureDay(days: Record<string, DayRecord>, date: string): DayRecord {
  if (!days[date]) {
    return { date, habits: {}, prayers: {} }
  }
  return days[date]
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      ...initialState,

      addCustomHabit: (habit: HabitDefinition) =>
        set((s) => ({
          customHabits: [...s.customHabits, habit],
        })),

      removeCustomHabit: (id: string) =>
        set((s) => ({
          customHabits: s.customHabits.filter(h => h.id !== id),
        })),

      toggleHabit: (date: string, habitId: string) =>
        set((s) => {
          const day = ensureDay(s.days, date)
          const current = day.habits[habitId] || false
          return {
            days: {
              ...s.days,
              [date]: {
                ...day,
                habits: { ...day.habits, [habitId]: !current },
              },
            },
          }
        }),

      togglePrayer: (date: string, prayerId: string) =>
        set((s) => {
          const day = ensureDay(s.days, date)
          const current = day.prayers[prayerId] || false
          return {
            days: {
              ...s.days,
              [date]: {
                ...day,
                prayers: { ...day.prayers, [prayerId]: !current },
              },
            },
          }
        }),

      toggleDeposit: (month: string) =>
        set((s) => ({
          deposits: { ...s.deposits, [month]: !s.deposits[month] },
        })),

      setCurrentSaved: (amount: number) => set({ currentSaved: amount }),

      setSpecialPayment: (id: string, status: 'waiting' | 'received' | 'deposited') =>
        set((s) => ({
          specialPayments: { ...s.specialPayments, [id]: status },
        })),

      addXp: (amount: number) => set((s) => ({ xp: s.xp + amount })),

      awardBadge: (badgeId: string) =>
        set((s) => ({
          badges: s.badges.includes(badgeId) ? s.badges : [...s.badges, badgeId],
        })),

      updateStreak: (category: string, date: string) =>
        set((s) => {
          const prev = s.streaks[category]
          if (!prev) {
            return { streaks: { ...s.streaks, [category]: { current: 1, lastDate: date } } }
          }
          const lastDate = new Date(prev.lastDate)
          const thisDate = new Date(date)
          const diffDays = Math.round((thisDate.getTime() - lastDate.getTime()) / 86_400_000)

          if (diffDays === 0) return s
          if (diffDays <= 2) {
            return {
              streaks: {
                ...s.streaks,
                [category]: { current: prev.current + 1, lastDate: date },
              },
            }
          }
          return {
            streaks: {
              ...s.streaks,
              [category]: { current: 1, lastDate: date },
            },
          }
        }),

      setCity: (city: string, lat: number, lon: number) => set({ city, lat, lon }),
      setCalculationMethod: (method: string) => set({ calculationMethod: method }),
      setExchangeRate: (rate: number) => set({ exchangeRate: rate }),
      setTheme: (theme: ThemeMode) => set({ theme }),
      setNotificationSettings: (settings: Partial<NotificationSettings>) =>
        set((s) => ({
          notificationSettings: { ...s.notificationSettings, ...settings },
        })),
      setPushSubscription: (sub: string | null) => set({ pushSubscription: sub }),
      resetAll: () => set(initialState),
    }),
    {
      name: 'path2026-storage',
    }
  )
)
