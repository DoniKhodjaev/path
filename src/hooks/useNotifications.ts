import { useCallback } from 'react'
import { useStore } from '../store/useStore'

const WORKER_URL = ''

export function useNotifications() {
  const { notificationSettings, setNotificationSettings, setPushSubscription } = useStore()

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) return false
    const result = await Notification.requestPermission()
    return result === 'granted'
  }, [])

  const subscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: '',
      })
      setPushSubscription(JSON.stringify(subscription))

      if (WORKER_URL) {
        await fetch(`${WORKER_URL}/subscribe`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        })
      }
    } catch (err) {
      console.error('Push subscription failed:', err)
    }
  }, [setPushSubscription])

  const unsubscribe = useCallback(async () => {
    try {
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        setPushSubscription(null)

        if (WORKER_URL) {
          await fetch(`${WORKER_URL}/unsubscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ endpoint: subscription.endpoint }),
          })
        }
      }
    } catch (err) {
      console.error('Push unsubscribe failed:', err)
    }
  }, [setPushSubscription])

  const scheduleLocalNotification = useCallback((title: string, body: string, delayMs: number) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return
    setTimeout(() => {
      new Notification(title, { body, icon: '/path/icons/icon-192.png' })
    }, delayMs)
  }, [])

  return {
    notificationSettings,
    setNotificationSettings,
    requestPermission,
    subscribe,
    unsubscribe,
    scheduleLocalNotification,
  }
}
