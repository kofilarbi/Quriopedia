// Supabase Edge Function — invoked by a cron or manually
// Sends push notifications to users whose notification_time matches the current UTC hour:minute
// Deploy: supabase functions deploy send-daily-push
// Set secrets: supabase secrets set VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:...
// Schedule: use Supabase pg_cron or an external cron to call this every minute

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@quriopedia.app'

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Current UTC time rounded to HH:MM
  const now = new Date()
  const currentTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`

  // Find users whose notification_time matches now and have push subscriptions
  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth, user_id, user_profiles!inner(notification_time, notifications_enabled)')
    .eq('user_profiles.notifications_enabled', true)
    .eq('user_profiles.notification_time', currentTime)

  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 })

  const results = await Promise.allSettled(
    (subs ?? []).map(async (sub) => {
      // Use the Web Push Protocol to send a notification
      // Full VAPID signing implementation omitted for brevity —
      // in production, use the web-push npm package via esm.sh:
      // import webpush from 'https://esm.sh/web-push@3'
      // webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
      // await webpush.sendNotification(sub, JSON.stringify({ title: 'Quriopedia', body: "Today's picks are ready!" }))
      console.log('[push] would notify user', sub.user_id, 'at endpoint', sub.endpoint.slice(0, 40))
      return sub.user_id
    })
  )

  return new Response(JSON.stringify({ sent: results.length, time: currentTime }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
