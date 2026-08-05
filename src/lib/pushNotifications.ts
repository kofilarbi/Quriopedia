import { supabase } from './supabase'

// push_subscriptions isn't in generated types yet — cast at call sites
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY as string

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)))
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  return Notification.requestPermission()
}

export async function subscribeToPush(userId: string): Promise<boolean> {
  console.log('[push] subscribeToPush called', { userId })

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('[push] STOP: serviceWorker or PushManager not supported', {
      sw: 'serviceWorker' in navigator,
      pm: 'PushManager' in window,
    })
    return false
  }

  if (!VAPID_PUBLIC_KEY || VAPID_PUBLIC_KEY === 'REPLACE_WITH_GENERATED_KEY') {
    console.error('[push] STOP: VAPID_PUBLIC_KEY missing or placeholder', { VAPID_PUBLIC_KEY })
    return false
  }
  console.log('[push] VAPID key present, length:', VAPID_PUBLIC_KEY.length)

  try {
    console.log('[push] waiting for serviceWorker.ready…')
    const registration = await navigator.serviceWorker.ready
    console.log('[push] SW ready, scope:', registration.scope)

    console.log('[push] calling pushManager.subscribe…')
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY).buffer as ArrayBuffer,
    })
    console.log('[push] subscription created, endpoint:', subscription.endpoint)

    const json = subscription.toJSON()
    const keys = json.keys as { p256dh: string; auth: string }

    console.log('[push] upserting to push_subscriptions…')
    const { error } = await db.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: json.endpoint!,
      p256dh: keys.p256dh,
      auth: keys.auth,
    })
    if (error) console.error('[push] upsert error:', error)
    else console.log('[push] upsert success ✓')
    return !error
  } catch (err) {
    console.error('[push] subscribe error:', err)
    return false
  }
}

export async function unsubscribeFromPush(userId: string): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    if (subscription) await subscription.unsubscribe()
    await db.from('push_subscriptions').delete().eq('user_id', userId)
  } catch (err) {
    console.error('[push] unsubscribe error:', err)
  }
}

export function isPushSupported(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}
