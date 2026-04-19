import { getPathProgress } from '../utils/dates'

const PHASES = [
  {
    num: '01', title: 'Фундамент', dates: '19 апр — 30 апр',
    cards: [
      { title: '⚕ Здоровье — ПРИОРИТЕТ', items: ['Записаться к терапевту на этой неделе', 'Сдать комплексные анализы', 'Начать вечернее промывание носа и ирригатор', 'Вода — 2 литра каждый день'] },
      { title: '💰 Финансы', items: ['Открыть депозитный счёт в Узбекистане', 'Первый перевод 100,000 ₽', 'Буфер 35k — часть уйдёт на обследование'] },
      { title: '💼 Работа', items: ['Закрыть дашборд — до 30 апреля', 'Стоп-сигнал в 18:30 на работе'] },
      { title: '🕌 Ислам', items: ['Начать с одного намаза — Магриб', 'Muslim Pro установлено', 'Изучить правила омовения'] },
    ],
  },
  {
    num: '02', title: 'Строительство', dates: '1 май — 30 июн',
    cards: [
      { title: '⚕ Здоровье', items: ['Получить результаты анализов, начать лечение', 'Зал 3 раза в неделю стабильно', 'Убрать сахар, фастфуд, колу', 'Цель: минус 3-4 кг'] },
      { title: '💰 Финансы', items: ['100,000 ₽ строго 1-го числа', 'Таблица расходов — еженедельно'] },
      { title: '💼 Карьера', items: ['Обновить LinkedIn', 'Контакт в головном офисе Капиталбанка', 'Написать 3-5 людям в LinkedIn'] },
      { title: '🕌 Ислам', items: ['Добавить Фаджр и Иша', 'Начать тафсир — 1 сура в неделю'] },
    ],
  },
  {
    num: '03', title: 'Ускорение', dates: '1 июл — 31 авг',
    cards: [
      { title: '⚕ Здоровье', items: ['Контрольные анализы — проверить динамику', 'Цель: минус 7-8 кг', 'Круги под глазами уменьшились', 'Сон стабильно до 23:15'] },
      { title: '💰 Финансы', items: ['400,000 ₽ на депозите + проценты', 'Следить за курсом ₽/$'] },
      { title: '💼 Карьера', items: ['Онлайн-собеседования', 'Презентация инструментов и кейсов', 'Целевые: Капиталбанк HQ, Октобанк, InfinBank'] },
      { title: '🕌 Ислам', items: ['Все 5 намазов стабильно', 'Джума в мечети', 'Коран на арабском — 5 аятов/день'] },
    ],
  },
  {
    num: '04', title: 'Финишная прямая', dates: '1 сен — 31 окт',
    cards: [
      { title: '⚕ Здоровье', items: ['Цель: минус 10-12 кг (вес 73-75 кг)', '7 симптомов резко уменьшились или ушли', 'Новое фото — сравнить с апрельским', 'Сон без будильника'] },
      { title: '💰 Финансы', items: ['Залог + отпускные + 13-я = всё на депозит', 'Итог: ~$12,500+'] },
      { title: '💼 Карьера', items: ['Оффер из Ташкента до увольнения', 'Правильно уволиться — без конфликтов', 'Позиция: Head of Analytics / Digital от $3,000/мес'] },
      { title: '🕌 Ислам', items: ['5 намазов — часть тебя, не усилие', 'Возвращение домой изменённым человеком', 'Намерение на Умру'] },
    ],
  },
]

const SCHEDULE = [
  { time: '05:30', title: 'Фаджр', tag: 'islam', desc: 'Омовение, намаз, 5 минут тихого зикра' },
  { time: '05:45', title: 'Утренняя рутина', tag: 'health', desc: 'Стакан воды. Контрастное умывание. Промывание носа' },
  { time: '06:00', title: 'Чтение', tag: 'self', desc: '20 минут — книга' },
  { time: '06:20', title: 'Завтрак', tag: 'health', desc: 'Белок: яйца, творог. БЕЗ сладкого' },
  { time: '07:30', title: 'Дорога на работу', desc: 'Пешком часть пути — 20 мин кардио бесплатно' },
  { time: '09:00', title: 'Утренняя рутина в офисе', tag: 'work', desc: '7 задач — кнопки, фильтры, отправка' },
  { time: '10:00', title: 'Глубокая работа', tag: 'work', desc: 'Проектные задачи — дашборды, автоматизация' },
  { time: '13:00', title: 'Зухр', tag: 'islam', desc: 'Намаз. 5 минут паузы' },
  { time: '13:00', title: 'Обед', tag: 'health', desc: 'Белок + овощи + медленные углеводы. Воздух 10 мин' },
  { time: '14:00', title: 'Операционная работа', tag: 'work', desc: 'Запросы, отчёты. Вода каждый час' },
  { time: '16:30', title: 'Аср', tag: 'islam', desc: 'Намаз. Встать, отойти от стола' },
  { time: '18:00', title: 'Планирование завтра', tag: 'work', desc: 'Блокнот: что сделано, что на завтра' },
  { time: '19:00', title: 'Магриб', tag: 'islam', desc: 'Намаз дома. Время с женой' },
  { time: '19:15', title: 'Зал / прогулка', tag: 'health', desc: '3 раза в неделю — силовые. Остальные — прогулка с женой' },
  { time: '20:30', title: 'Ужин', desc: 'С женой, без телефонов' },
  { time: '21:30', title: 'Иша', tag: 'islam', desc: 'Намаз. Вечерний зикр' },
  { time: '21:45', title: 'Личное время', tag: 'self', desc: 'Ислам, чтение, английский 15 мин' },
  { time: '22:30', title: 'Вечерняя рутина', tag: 'health', desc: 'Чистка зубов + ирригатор. Душ. Витамины' },
  { time: '22:45', title: 'Стоп-сигнал', tag: 'health', desc: 'Компьютер закрыт. Телефон в другой комнате' },
  { time: '23:15', title: 'Сон', desc: '7 часов минимум — главное лекарство' },
]

const FINANCE_TABLE = [
  { month: 'Апрель (врачи)', deposit: '−25,000 ₽', total: 'Обследование', usd: 'Инвестиция', neg: true },
  { month: 'Апрель (депозит)', deposit: '+100,000 ₽', total: '100,000 ₽', usd: '~$1,175' },
  { month: 'Май', deposit: '+100,000 ₽', total: '200,000 ₽', usd: '~$2,350' },
  { month: 'Июнь', deposit: '+100,000 ₽', total: '300,000 ₽', usd: '~$3,530' },
  { month: 'Июль', deposit: '+100,000 ₽', total: '400,000 ₽', usd: '~$4,705' },
  { month: 'Август', deposit: '+100,000 ₽', total: '500,000 ₽', usd: '~$5,880' },
  { month: 'Сентябрь', deposit: '+100,000 ₽', total: '600,000 ₽', usd: '~$7,060' },
  { month: 'Октябрь (увольнение)', deposit: '+435,000 ₽', total: '1,035,000 ₽', usd: '~$12,175' },
  { month: 'Проценты (21%)', deposit: '+~32,000 ₽', total: '1,067,000 ₽', usd: '', gold: true },
]

const RULES = [
  { num: '00', text: 'Здоровье — приоритет №1. Без тела нет ничего', priority: true },
  { num: '01', text: '100,000 ₽ уходят на депозит в первый день каждого месяца' },
  { num: '02', text: 'В 22:45 компьютер закрыт. Работа переносится на утро' },
  { num: '03', text: 'Кола, энергетики, фастфуд, сахар — заменены водой и белком' },
  { num: '04', text: 'Намаз начинается с одного — Магриб. Добавляю по одному' },
  { num: '05', text: 'Буфер 35,000 ₽ — только форс-мажор. Врачи — это форс-мажор' },
  { num: '06', text: 'Зал 3 раза в неделю. Пропустил — не наказываю, иду на следующей' },
  { num: '07', text: 'В Ташкенте нужна позиция в головном офисе — не в филиале' },
  { num: '08', text: 'Разовые выплаты (435k ₽) — полностью на депозит' },
  { num: '09', text: '20 минут чтения каждое утро — это часть утра' },
  { num: '10', text: 'Shortcut не существует. Мой путь реален' },
]

export function Plan() {
  const { percent, daysLeft } = getPathProgress()

  const tagColors: Record<string, string> = {
    islam: 'bg-accent-green/15 text-accent-green border-accent-green/20',
    health: 'bg-accent-red/12 text-accent-red border-accent-red/20',
    work: 'bg-accent-blue/12 text-accent-blue border-accent-blue/20',
    self: 'bg-gold/12 text-gold border-gold/20',
  }
  const tagLabels: Record<string, string> = {
    islam: 'ИСЛАМ', health: 'ЗДОРОВЬЕ', work: 'РАБОТА', self: 'РАЗВИТИЕ',
  }

  return (
    <div className="p-4 pb-20 space-y-8">
      {/* Header */}
      <div className="text-center">
        <p className="font-mono text-[10px] tracking-[4px] text-gold/80 uppercase mb-3">личный план · дониёр ходжаев</p>
        <h1 className="font-heading text-3xl text-white">Путь к <span className="text-gold italic">новой жизни</span></h1>
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto my-4" />
        <p className="font-mono text-[11px] text-txt/40">19 апреля — 31 октября 2026 · Москва → Ташкент</p>
      </div>

      {/* Progress */}
      <div className="bg-navy-2 rounded-xl p-5 border border-gold/15">
        <div className="flex justify-between mb-3 font-mono text-[11px] text-txt/40 tracking-wider">
          <span>ПРОГРЕСС</span>
          <span>{percent.toFixed(1)}%</span>
        </div>
        <div className="h-1 bg-navy-3 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-gradient-to-r from-gold to-gold-2 rounded-full transition-all duration-700" style={{ width: `${percent}%` }} />
        </div>
        <div className="grid grid-cols-4 gap-3 text-center">
          <div><span className="font-mono text-xl text-gold-2 block">{daysLeft}</span><span className="font-mono text-[9px] text-txt/40 uppercase tracking-wider">дней</span></div>
          <div><span className="font-mono text-xl text-gold-2 block">$12,500</span><span className="font-mono text-[9px] text-txt/40 uppercase tracking-wider">цель</span></div>
          <div><span className="font-mono text-xl text-gold-2 block">4</span><span className="font-mono text-[9px] text-txt/40 uppercase tracking-wider">фазы</span></div>
          <div><span className="font-mono text-xl text-gold-2 block">23</span><span className="font-mono text-[9px] text-txt/40 uppercase tracking-wider">возраст</span></div>
        </div>
      </div>

      {/* Daily Schedule */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gold/10" />
          <span className="font-mono text-[10px] tracking-[3px] text-gold/60 uppercase">ежедневный распорядок</span>
          <div className="h-px flex-1 bg-gold/10" />
        </div>
        <div className="bg-navy-2 rounded-xl border border-gold/12 overflow-hidden">
          <div className="p-4 border-b border-navy-3 flex justify-between items-center">
            <h3 className="font-heading text-xl text-white">Идеальный день</h3>
            <span className="font-mono text-[10px] text-txt/40 tracking-wider">БУДНИЙ ДЕНЬ</span>
          </div>
          {SCHEDULE.map((item, i) => (
            <div key={i} className="flex border-b border-navy-3/50 last:border-0 hover:bg-gold/[0.02] transition-colors">
              <div className="w-20 p-3 font-mono text-[11px] text-gold/70 border-r border-navy-3/50 flex items-center tracking-wider">{item.time}</div>
              <div className="flex-1 p-3">
                <div className="font-mono text-[12px] text-white mb-0.5">
                  {item.title}
                  {item.tag && (
                    <span className={`inline-block ml-2 text-[9px] px-2 py-0.5 rounded-full border ${tagColors[item.tag]}`}>
                      {tagLabels[item.tag]}
                    </span>
                  )}
                </div>
                <div className="font-mono text-[11px] text-txt/40 leading-relaxed">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Phases */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gold/10" />
          <span className="font-mono text-[10px] tracking-[3px] text-gold/60 uppercase">фазы плана</span>
          <div className="h-px flex-1 bg-gold/10" />
        </div>
        {PHASES.map(phase => (
          <div key={phase.num} className="mb-8">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-gold/10">
              <span className="font-mono text-[10px] text-gold/70 tracking-wider">ФАЗА {phase.num}</span>
              <span className="font-heading text-xl text-white">{phase.title}</span>
              <span className="ml-auto font-mono text-[10px] text-txt/40 tracking-wider">{phase.dates}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {phase.cards.map((card, i) => (
                <div key={i} className="bg-navy-2 rounded-lg p-4 border border-navy-3 hover:border-gold/20 transition-colors">
                  <p className="font-mono text-[10px] tracking-wider text-gold/85 uppercase mb-3">{card.title}</p>
                  <div className="space-y-2">
                    {card.items.map((item, j) => (
                      <p key={j} className="font-mono text-[11px] text-txt/70 leading-relaxed pl-3 relative">
                        <span className="absolute left-0 text-gold/50 text-[10px]">—</span>
                        {item}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Finance table */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-px flex-1 bg-gold/10" />
          <span className="font-mono text-[10px] tracking-[3px] text-gold/60 uppercase">финансовый план</span>
          <div className="h-px flex-1 bg-gold/10" />
        </div>
        <div className="bg-navy-2 rounded-xl border border-gold/12 overflow-hidden">
          <div className="grid grid-cols-4 gap-0 border-b border-gold/15">
            {['МЕСЯЦ', 'ДЕПОЗИТ', 'ВСЕГО', '~ $'].map(h => (
              <span key={h} className="font-mono text-[9px] tracking-wider text-gold/70 p-3">{h}</span>
            ))}
          </div>
          {FINANCE_TABLE.map((row, i) => (
            <div key={i} className="grid grid-cols-4 gap-0 border-b border-navy-3/50 last:border-0 hover:bg-gold/[0.02]">
              <span className="font-mono text-[11px] text-txt/70 p-3">{row.month}</span>
              <span className={`font-mono text-[11px] p-3 ${row.neg ? 'text-accent-red' : row.gold ? 'text-gold' : 'text-accent-green'}`}>{row.deposit}</span>
              <span className="font-mono text-[11px] text-txt/60 p-3">{row.total}</span>
              <span className="font-mono text-[11px] text-gold/60 p-3">{row.usd}</span>
            </div>
          ))}
          <div className="grid grid-cols-4 gap-0 border-t border-gold/20 bg-gold/[0.03]">
            <span className="font-mono text-[11px] text-txt font-bold p-3">ИТОГО</span>
            <span className="p-3" />
            <span className="font-mono text-[11px] text-gold font-bold p-3">~1,067,000 ₽</span>
            <span className="font-mono text-[11px] text-gold font-bold p-3">~$12,500+</span>
          </div>
        </div>
      </div>

      {/* Rules */}
      <div className="bg-gradient-to-br from-gold/[0.06] to-accent-blue/[0.04] rounded-xl p-5 border border-gold/15">
        <h3 className="font-heading text-xl text-white mb-5">11 правил этого периода</h3>
        <div className="grid grid-cols-1 gap-2">
          {RULES.map(rule => (
            <div key={rule.num} className="flex items-start gap-3 p-3 bg-black/20 rounded-lg">
              <span className="font-mono text-[10px] text-gold/60 min-w-[20px] mt-0.5">{rule.num}</span>
              <span className={`font-mono text-[12px] leading-relaxed ${rule.priority ? 'text-[#e08a3c] font-bold' : 'text-txt/70'}`}>{rule.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer quote */}
      <div className="text-center py-6">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-gold to-transparent mx-auto mb-4" />
        <p className="font-heading text-lg text-white/40 italic">"Поистине, вместе с трудностью — облегчение"</p>
        <p className="font-mono text-[10px] text-txt/30 tracking-wider mt-2">Коран · Сура Аш-Шарх · 94:6</p>
      </div>
    </div>
  )
}
