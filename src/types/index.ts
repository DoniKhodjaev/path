export interface HabitDefinition {
  id: string
  label: string
  category: 'islam' | 'health' | 'development' | 'finance' | 'work'
  isPrayer?: boolean
}

export interface DayRecord {
  date: string // "YYYY-MM-DD"
  habits: Record<string, boolean>
  prayers: Record<string, boolean>
}

export interface StreakInfo {
  current: number
  lastDate: string // "YYYY-MM-DD"
}

export interface LevelDefinition {
  level: number
  name: string
  minXp: number
  maxXp: number
}

export type Screen = 'dashboard' | 'habits' | 'finance' | 'levels' | 'settings'

export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha'

export interface CityDefinition {
  name: string
  lat: number
  lon: number
}

export interface NotificationSettings {
  prayers: boolean
  sleep: boolean
  deposit: boolean
  morning: boolean
}

export interface AppState {
  // Profile
  city: string
  lat: number
  lon: number
  calculationMethod: string
  exchangeRate: number

  // Daily records keyed by "YYYY-MM-DD"
  days: Record<string, DayRecord>

  // Finance
  deposits: Record<string, boolean>
  currentSaved: number
  specialPayments: Record<string, 'waiting' | 'received' | 'deposited'>

  // Gamification
  xp: number
  badges: string[]
  streaks: Record<string, StreakInfo>

  // Notifications
  notificationSettings: NotificationSettings
  pushSubscription: string | null

  // Actions
  toggleHabit: (date: string, habitId: string) => void
  togglePrayer: (date: string, prayerId: string) => void
  toggleDeposit: (month: string) => void
  setCurrentSaved: (amount: number) => void
  setSpecialPayment: (id: string, status: 'waiting' | 'received' | 'deposited') => void
  addXp: (amount: number) => void
  awardBadge: (badgeId: string) => void
  updateStreak: (category: string, date: string) => void
  setCity: (city: string, lat: number, lon: number) => void
  setCalculationMethod: (method: string) => void
  setExchangeRate: (rate: number) => void
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void
  setPushSubscription: (sub: string | null) => void
  resetAll: () => void
}
