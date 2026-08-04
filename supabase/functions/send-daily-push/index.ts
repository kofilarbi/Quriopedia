// Supabase Edge Function — sends daily push notifications
// Deploy: supabase functions deploy send-daily-push
// Required secrets:
//   supabase secrets set VAPID_PUBLIC_KEY=<key> VAPID_PRIVATE_KEY=<key> VAPID_SUBJECT=mailto:you@example.com
// Schedule: run via pg_cron every minute (see migration 008 / Supabase SQL editor instructions)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
// deno-lint-ignore-file no-explicit-any
import webpush from 'https://esm.sh/web-push@3'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@quriopedia.app'

// Return HH:MM for a given IANA timezone, falling back to UTC on invalid zones.
function localTimeInZone(timezone: string): string {
  const now = new Date()
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now)
    const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
    const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  } catch {
    return `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`
  }
}

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  ;(webpush as any).setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

  // Fetch all subscriptions for users with notifications enabled.
  // Time filtering is done in JS so we can respect each user's stored timezone.
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select(
      'endpoint, p256dh, auth, user_id, user_profiles!inner(notification_time, notification_timezone, notifications_enabled)'
    )
    .eq('user_profiles.notifications_enabled', true)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  const staleUserIds: string[] = []

  const results = await Promise.allSettled(
    (subs ?? []).map(async (sub) => {
      const profile = sub.user_profiles as {
        notification_time: string
        notification_timezone: string
        notifications_enabled: boolean
      }

      // Check whether it's the right minute in this user's local timezone.
      const localTime = localTimeInZone(profile.notification_timezone ?? 'UTC')
      if (localTime !== profile.notification_time) return 'skipped'

      const subscription = {
        endpoint: sub.endpoint,
        keys: { p256dh: sub.p256dh, auth: sub.auth },
      }

      const payload = JSON.stringify({
        title: 'Quriopedia',
        body: "Today's learning picks are ready — come see what's new!",
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-96.png',
        url: '/',
      })

      try {
        await (webpush as any).sendNotification(subscription, payload)
        return sub.user_id
      } catch (err: unknown) {
        // 410 Gone / 404 = subscription is permanently invalid; remove it so
        // we don't keep attempting dead endpoints.
        const status = (err as { statusCode?: number }).statusCode
        if (status === 410 || status === 404) {
          staleUserIds.push(sub.user_id as string)
        }
        throw err
      }
    })
  )

  if (staleUserIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('user_id', staleUserIds)
  }

  const sent = results.filter(
    (r) => r.status === 'fulfilled' && r.value !== 'skipped'
  ).length
  const skipped = results.filter(
    (r) => r.status === 'fulfilled' && r.value === 'skipped'
  ).length

  return new Response(
    JSON.stringify({
      sent,
      skipped,
      total: subs?.length ?? 0,
      stale_removed: staleUserIds.length,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
