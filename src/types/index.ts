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

export type Screen = 'dashboard' | 'habits' | 'finance' | 'health' | 'settings'

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

export type ThemeMode = 'light' | 'dark' | 'auto'

export interface AppState {
  // Profile
  city: string
  lat: number
  lon: number
  calculationMethod: string
  exchangeRate: number
  theme: ThemeMode

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
  setTheme: (theme: ThemeMode) => void
  setNotificationSettings: (settings: Partial<NotificationSettings>) => void
  setPushSubscription: (sub: string | null) => void
  resetAll: () => void
}

// ===== Health Module Types =====

export type HealthSubScreen = 'main' | 'doctors' | 'symptoms' | 'weight' | 'sleep' | 'vitamins' | 'photos' | 'plan'

export interface DoctorVisit {
  id: string
  date: string // "YYYY-MM-DD"
  time: string // "HH:MM"
  specialist: string
  clinic: string
  reason: string
  status: 'planned' | 'visited' | 'cancelled'
  notes: string
  nextStep: string
}

export interface TestResult {
  id: string
  date: string
  testName: string
  value: number
  unit: string
  normalMin: number
  normalMax: number
  status: 'normal' | 'low' | 'high'
  source: string
}

export interface SymptomEntry {
  date: string // "YYYY-MM-DD"
  ratings: Record<string, number> // symptomId -> 0-10
  notes: string
}

export interface WeightEntry {
  date: string
  weight: number // kg
}

export interface BodyMeasurement {
  date: string
  waist?: number
  chest?: number
  bicep?: number
  thigh?: number
}

export interface SleepEntry {
  date: string
  bedtime: string // "HH:MM"
  wakeTime: string // "HH:MM"
  quality: number // 1-10
  awakenings: number
}

export interface Medication {
  id: string
  name: string
  dosage: string
  timing: string // "утром с едой"
  courseEnd: string // "YYYY-MM-DD"
  takenDays: Record<string, boolean> // date -> taken
}

export interface HealthState {
  doctorVisits: DoctorVisit[]
  testResults: TestResult[]
  symptoms: SymptomEntry[]
  weightEntries: WeightEntry[]
  bodyMeasurements: BodyMeasurement[]
  sleepEntries: SleepEntry[]
  medications: Medication[]
  testChecklist: Record<string, boolean> // testName -> done

  // Actions
  addDoctorVisit: (visit: DoctorVisit) => void
  updateDoctorVisit: (id: string, updates: Partial<DoctorVisit>) => void
  removeDoctorVisit: (id: string) => void
  addTestResult: (result: TestResult) => void
  removeTestResult: (id: string) => void
  addSymptomEntry: (entry: SymptomEntry) => void
  addWeightEntry: (entry: WeightEntry) => void
  addBodyMeasurement: (entry: BodyMeasurement) => void
  addSleepEntry: (entry: SleepEntry) => void
  addMedication: (med: Medication) => void
  updateMedication: (id: string, updates: Partial<Medication>) => void
  removeMedication: (id: string) => void
  toggleMedicationDay: (medId: string, date: string) => void
  toggleTestChecklist: (testName: string) => void
}
