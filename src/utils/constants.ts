import type { HabitDefinition, LevelDefinition, CityDefinition } from '../types'

export const HABITS: HabitDefinition[] = [
  { id: 'fajr', label: 'Фаджр намаз', category: 'islam', isPrayer: true },
  { id: 'dhuhr', label: 'Зухр намаз', category: 'islam', isPrayer: true },
  { id: 'asr', label: 'Аср намаз', category: 'islam', isPrayer: true },
  { id: 'maghrib', label: 'Магриб намаз', category: 'islam', isPrayer: true },
  { id: 'isha', label: 'Иша намаз', category: 'islam', isPrayer: true },
  { id: 'quran', label: 'Чтение Корана (5 аятов)', category: 'islam' },
  { id: 'water', label: 'Выпил 8 стаканов воды', category: 'health' },
  { id: 'exercise', label: 'Зал / прогулка 30 мин', category: 'health' },
  { id: 'sleep', label: 'Лёг спать до 23:15', category: 'health' },
  { id: 'no-cola', label: 'Без колы и энергетиков', category: 'health' },
  { id: 'reading', label: 'Чтение книги (20 мин)', category: 'development' },
  { id: 'english', label: 'Английский (15 мин)', category: 'development' },
  { id: 'budget', label: 'Не выходил за рамки бюджета', category: 'finance' },
  { id: 'pc-off', label: 'Закрыл компьютер в 22:45', category: 'work' },
  { id: 'plan-tomorrow', label: 'Записал план на завтра', category: 'work' },
]

export const PRAYER_IDS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const

export const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Фаджр', dhuhr: 'Зухр', asr: 'Аср', maghrib: 'Магриб', isha: 'Иша',
}

export const LEVELS: LevelDefinition[] = [
  { level: 1, name: 'Мурид', minXp: 0, maxXp: 500 },
  { level: 2, name: 'Устоз', minXp: 500, maxXp: 1500 },
  { level: 3, name: 'Сабрли', minXp: 1500, maxXp: 3000 },
  { level: 4, name: 'Иродали', minXp: 3000, maxXp: 5000 },
  { level: 5, name: 'Ишончли', minXp: 5000, maxXp: 8000 },
  { level: 6, name: 'Кучли', minXp: 8000, maxXp: 12000 },
  { level: 7, name: 'Донишманд', minXp: 12000, maxXp: 17000 },
  { level: 8, name: 'Лидер', minXp: 17000, maxXp: 23000 },
  { level: 9, name: 'Банкир', minXp: 23000, maxXp: 30000 },
  { level: 10, name: 'Дониёр', minXp: 30000, maxXp: Infinity },
]

export const QUOTES: string[] = [
  '«Воистину, после тяготы наступает облегчение» — Коран 94:6',
  '«И терпи, ибо Аллах не теряет награды творящих добро» — Коран 11:115',
  '«Лучший из вас тот, кто полезнее для людей» — Хадис',
  '«Кто идёт по пути знания, тому Аллах облегчит путь в Рай» — Хадис',
  '«Сильный — не тот, кто побеждает в борьбе, а тот, кто владеет собой в гневе» — Хадис',
  '«Начинай с малого, но не прекращай» — Хадис',
  '«Каждое доброе дело — это садака» — Хадис',
  '«Аллах не меняет положения народа, пока они сами не изменят себя» — Коран 13:11',
  '«И что бы вы ни делали доброго — Аллах знает об этом» — Коран 2:197',
  '«Самые любимые дела перед Аллахом — постоянные, даже если малые» — Хадис',
]

export const CITIES: CityDefinition[] = [
  { name: 'Москва', lat: 55.7558, lon: 37.6173 },
  { name: 'Санкт-Петербург', lat: 59.9343, lon: 30.3351 },
  { name: 'Казань', lat: 55.7887, lon: 49.1221 },
  { name: 'Ташкент', lat: 41.2995, lon: 69.2401 },
  { name: 'Самарканд', lat: 39.6542, lon: 66.9597 },
  { name: 'Бухара', lat: 39.7747, lon: 64.4286 },
  { name: 'Дубай', lat: 25.2048, lon: 55.2708 },
  { name: 'Стамбул', lat: 41.0082, lon: 28.9784 },
]

export const CATEGORY_LABELS: Record<string, string> = {
  islam: 'Ислам', health: 'Здоровье', development: 'Развитие', finance: 'Финансы', work: 'Работа',
}

export const CATEGORY_COLORS: Record<string, string> = {
  islam: 'sacred', health: 'calm', development: 'gold', finance: 'gold', work: 'gold-hi',
}

export const DEPOSIT_MONTHS = [
  { month: '2026-04', label: 'Апрель', amount: 100000 },
  { month: '2026-05', label: 'Май', amount: 100000 },
  { month: '2026-06', label: 'Июнь', amount: 100000 },
  { month: '2026-07', label: 'Июль', amount: 100000 },
  { month: '2026-08', label: 'Август', amount: 100000 },
  { month: '2026-09', label: 'Сентябрь', amount: 100000 },
  { month: '2026-10', label: 'Октябрь', amount: 100000 },
]

export const SPECIAL_PAYMENTS = [
  { id: 'deposit-return', label: 'Залог', amount: 85000 },
  { id: 'vacation-pay', label: 'Отпускные', amount: 150000 },
  { id: 'bonus-13', label: '13-я премия', amount: 200000 },
]

export const FINANCIAL_GOAL_RUB = 1_062_500
export const FINANCIAL_GOAL_USD = 12_500

export const PATH_START = new Date('2026-04-19')
export const PATH_END = new Date('2026-10-31')
