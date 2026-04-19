interface XpEvent {
  id: number
  amount: number
}

let eventId = 0

export function createXpEvent(amount: number): XpEvent {
  return { id: ++eventId, amount }
}

export function XpPopup({ events }: { events: XpEvent[] }) {
  return (
    <div className="fixed top-20 right-4 z-50 pointer-events-none">
      {events.map((e) => (
        <div key={e.id} className="text-gold font-mono text-lg font-bold animate-float-up">
          +{e.amount} XP
        </div>
      ))}
    </div>
  )
}
