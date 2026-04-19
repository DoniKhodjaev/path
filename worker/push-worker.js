const NOTIFICATIONS = {
  sleep: { title: '😴 Пора закрывать компьютер', body: '22:45 — ты это обещал себе. Завтра всё доделаешь.' },
  morning: { title: '☀️ Доброе утро, Дониёр!', body: 'Открой чеклист и начни день правильно' },
  deposit: { title: '💰 Первое число!', body: 'Перевести 100,000 ₽ на депозит сегодня' },
  fajr: { title: '🌙 Время Фаджра', body: 'Начни день с Аллаха' },
  dhuhr: { title: '☀️ Время Зухра', body: 'Сделай паузу — это твоё право' },
  asr: { title: '🌤 Время Аср', body: 'Встань, отойди от стола' },
  maghrib: { title: '🌅 Время Магриба', body: 'День завершается — ты молодец' },
  isha: { title: '🌙 Время Иша', body: 'Последний намаз дня' },
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url)

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    }

    const corsHeaders = { 'Access-Control-Allow-Origin': '*' }

    if (url.pathname === '/ping') {
      return Response.json({ status: 'ok' }, { headers: corsHeaders })
    }

    if (url.pathname === '/subscribe' && request.method === 'POST') {
      const subscription = await request.json()
      await env.DB.prepare(
        'INSERT OR REPLACE INTO subscriptions (endpoint, data) VALUES (?, ?)'
      ).bind(subscription.endpoint, JSON.stringify(subscription)).run()
      return Response.json({ success: true }, { headers: corsHeaders })
    }

    if (url.pathname === '/unsubscribe' && request.method === 'POST') {
      const { endpoint } = await request.json()
      await env.DB.prepare('DELETE FROM subscriptions WHERE endpoint = ?').bind(endpoint).run()
      return Response.json({ success: true }, { headers: corsHeaders })
    }

    if (url.pathname === '/send' && request.method === 'POST') {
      const { type } = await request.json()
      const notif = NOTIFICATIONS[type]
      if (!notif) return Response.json({ error: 'Unknown type' }, { status: 400, headers: corsHeaders })

      const subs = await env.DB.prepare('SELECT data FROM subscriptions').all()
      const results = await Promise.allSettled(
        subs.results.map(row => sendPush(JSON.parse(row.data), notif, env))
      )
      return Response.json({ sent: results.length }, { headers: corsHeaders })
    }

    return Response.json({ error: 'Not found' }, { status: 404, headers: corsHeaders })
  },

  async scheduled(event, env) {
    const hour = new Date().getUTCHours()
    const minute = new Date().getUTCMinutes()
    const day = new Date().getUTCDate()

    let type = null
    if (hour === 19 && minute === 45) type = 'sleep'
    if (hour === 3 && minute === 0) type = 'morning'
    if (hour === 6 && minute === 0 && day === 1) type = 'deposit'

    if (type) {
      const notif = NOTIFICATIONS[type]
      const subs = await env.DB.prepare('SELECT data FROM subscriptions').all()
      await Promise.allSettled(
        subs.results.map(row => sendPush(JSON.parse(row.data), notif, env))
      )
    }
  },
}

async function sendPush(subscription, payload, env) {
  console.log('Sending push to:', subscription.endpoint, payload)
}
