// Supabase Edge Function — sends daily push notifications.
// Uses Deno crypto.subtle for VAPID JWT signing and aes128gcm payload
// encryption (RFC 8291 + RFC 8188) to avoid Node.js crypto shim issues
// that cause Apple's web.push.apple.com to return 403 BadJwtToken.
// Deploy: supabase functions deploy send-daily-push

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')!
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!
const VAPID_SUBJECT = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@quriopedia.app'

// ── base64url helpers ────────────────────────────────────────────────────────

function b64uEncode(buf: Uint8Array): string {
  let s = ''
  for (const b of buf) s += String.fromCharCode(b)
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function b64uDecode(s: string): Uint8Array {
  const padded = s + '='.repeat((4 - (s.length % 4)) % 4)
  return Uint8Array.from(atob(padded.replace(/-/g, '+').replace(/_/g, '/')), c =>
    c.charCodeAt(0)
  )
}

// ── VAPID JWT (ES256 via crypto.subtle) ──────────────────────────────────────

async function buildVapidJwt(endpoint: string): Promise<string> {
  const { protocol, host } = new URL(endpoint)
  const aud = `${protocol}//${host}`
  const now = Math.floor(Date.now() / 1000)

  // VAPID keys from web-push are raw base64url EC P-256 keys.
  // Public key = uncompressed point: 0x04 || 32-byte x || 32-byte y
  const pubBytes = b64uDecode(VAPID_PUBLIC_KEY)
  const privKey = await crypto.subtle.importKey(
    'jwk',
    {
      kty: 'EC',
      crv: 'P-256',
      x: b64uEncode(pubBytes.slice(1, 33)),
      y: b64uEncode(pubBytes.slice(33, 65)),
      d: VAPID_PRIVATE_KEY,
    } satisfies JsonWebKey,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  )

  const enc = (o: unknown) => b64uEncode(new TextEncoder().encode(JSON.stringify(o)))
  const header = enc({ typ: 'JWT', alg: 'ES256' })
  const payload = enc({ aud, sub: VAPID_SUBJECT, iat: now, exp: now + 43200 })
  const unsigned = `${header}.${payload}`

  // crypto.subtle returns IEEE P1363 format (r||s) which is what JWT ES256 requires
  const sig = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    privKey,
    new TextEncoder().encode(unsigned)
  )
  return `${unsigned}.${b64uEncode(new Uint8Array(sig))}`
}

// ── Web Push payload encryption (RFC 8291 + RFC 8188 aes128gcm) ─────────────

async function encryptPayload(
  payload: string,
  p256dhB64u: string,
  authB64u: string
): Promise<Uint8Array> {
  const recipientPub = b64uDecode(p256dhB64u)
  const authSecret = b64uDecode(authB64u)

  // Ephemeral sender EC key pair
  const senderPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveBits']
  )
  const senderPubJwk = await crypto.subtle.exportKey('jwk', senderPair.publicKey) as JsonWebKey
  const senderPubBytes = new Uint8Array([
    0x04,
    ...b64uDecode(senderPubJwk.x!),
    ...b64uDecode(senderPubJwk.y!),
  ])

  // ECDH: shared x-coordinate (32 bytes)
  const recipientCryptoKey = await crypto.subtle.importKey(
    'raw',
    recipientPub,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    []
  )
  const ecdhSecret = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: recipientCryptoKey },
    senderPair.privateKey,
    256
  )

  // RFC 8291 §3.3 — IKM = HKDF-Expand(HKDF-Extract(auth_secret, ecdh_secret), key_info, 32)
  const keyInfo = new Uint8Array([
    ...new TextEncoder().encode('WebPush: info\x00'),
    ...recipientPub,   // user-agent public key (65 bytes uncompressed)
    ...senderPubBytes, // app-server public key (65 bytes uncompressed)
  ])
  const ecdhKey = await crypto.subtle.importKey('raw', ecdhSecret, 'HKDF', false, ['deriveBits'])
  const ikm = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: keyInfo },
    ecdhKey,
    256
  )

  // Random 16-byte salt for RFC 8188 content-encoding header
  const salt = crypto.getRandomValues(new Uint8Array(16))

  // CEK (16 bytes) — import ikm twice so Deno doesn't balk at reuse
  const cekBytes = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: new TextEncoder().encode('Content-Encoding: aes128gcm\x00'),
    },
    await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']),
    128
  )

  // Nonce (12 bytes)
  const nonceBytes = await crypto.subtle.deriveBits(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: new TextEncoder().encode('Content-Encoding: nonce\x00'),
    },
    await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']),
    96
  )

  // AES-128-GCM encrypt; 0x02 = last-record padding delimiter (RFC 8188)
  const cek = await crypto.subtle.importKey('raw', cekBytes, 'AES-GCM', false, ['encrypt'])
  const plaintext = new Uint8Array([...new TextEncoder().encode(payload), 0x02])
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonceBytes, tagLength: 128 }, cek, plaintext)
  )

  // RFC 8188 §2.1 header: salt(16) | rs(4,BE) | idlen(1) | keyid(65) | ciphertext
  const header = new Uint8Array(16 + 4 + 1 + senderPubBytes.length)
  header.set(salt)
  new DataView(header.buffer).setUint32(16, 4096, false)
  header[20] = senderPubBytes.length // 65
  header.set(senderPubBytes, 21)

  const body = new Uint8Array(header.length + ciphertext.length)
  body.set(header)
  body.set(ciphertext, header.length)
  return body
}

// ── Send one push notification ───────────────────────────────────────────────

async function sendPush(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: string
): Promise<{ ok: boolean; status: number; body: string }> {
  const [jwt, body] = await Promise.all([
    buildVapidJwt(endpoint),
    encryptPayload(payload, p256dh, auth),
  ])

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'Authorization': `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`,
      'TTL': '86400',
    },
    body,
  })
  return { ok: res.ok, status: res.status, body: await res.text() }
}

// ── Timezone helper ──────────────────────────────────────────────────────────

function localTimeInZone(timezone: string): string {
  const now = new Date()
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now)
    const hour = parts.find(p => p.type === 'hour')?.value ?? '00'
    const minute = parts.find(p => p.type === 'minute')?.value ?? '00'
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
  } catch {
    return `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`
  }
}

// ── Edge function entry point ────────────────────────────────────────────────

Deno.serve(async (req) => {
  const url = new URL(req.url)
  const force = url.searchParams.get('force') === 'true'



  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

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
  const errorDetails: { user_id: string; status: number; body: string }[] = []

  const results = await Promise.allSettled(
    (subs ?? []).map(async sub => {
      const profile = sub.user_profiles as {
        notification_time: string
        notification_timezone: string
        notifications_enabled: boolean
      }

      const localTime = localTimeInZone(profile.notification_timezone ?? 'UTC')
      if (!force && localTime !== profile.notification_time) return 'skipped'

      const notifPayload = JSON.stringify({
        title: 'Quriopedia',
        body: "Today's learning picks are ready — come see what's new!",
        icon: '/icon.svg',
        badge: '/icon.svg',
        url: '/',
      })

      try {
        const result = await sendPush(sub.endpoint, sub.p256dh, sub.auth, notifPayload)
        if (!result.ok) {
          console.error('[send-daily-push] send failed', {
            user_id: sub.user_id,
            endpoint: sub.endpoint,
            status: result.status,
            body: result.body,
          })
          errorDetails.push({ user_id: sub.user_id as string, status: result.status, body: result.body })
          if (result.status === 410 || result.status === 404) {
            staleUserIds.push(sub.user_id as string)
          }
          throw new Error(`HTTP ${result.status}: ${result.body}`)
        }
        return sub.user_id
      } catch (err) {
        console.error('[send-daily-push] exception', { user_id: sub.user_id, error: String(err) })
        throw err
      }
    })
  )

  if (staleUserIds.length > 0) {
    await supabase.from('push_subscriptions').delete().in('user_id', staleUserIds)
  }

  const sent = results.filter(r => r.status === 'fulfilled' && r.value !== 'skipped').length
  const skipped = results.filter(r => r.status === 'fulfilled' && r.value === 'skipped').length
  const failed = results.filter(r => r.status === 'rejected').length

  return new Response(
    JSON.stringify({
      sent,
      skipped,
      failed,
      total: subs?.length ?? 0,
      stale_removed: staleUserIds.length,
      ...(force && errorDetails.length > 0 ? { errors: errorDetails } : {}),
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
