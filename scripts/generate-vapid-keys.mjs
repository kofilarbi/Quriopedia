#!/usr/bin/env node
// Run once: node scripts/generate-vapid-keys.mjs
// Copy the output into .env.local and your Supabase Edge Function secrets.
import { webcrypto } from 'node:crypto'

const { subtle } = webcrypto

const keyPair = await subtle.generateKey(
  { name: 'ECDH', namedCurve: 'P-256' },
  true,
  ['deriveKey', 'deriveBits']
)

const publicRaw  = Buffer.from(await subtle.exportKey('raw', keyPair.publicKey))
const privateRaw = Buffer.from(await subtle.exportKey('pkcs8', keyPair.privateKey))

const pub  = publicRaw.toString('base64url')
const priv = privateRaw.toString('base64url')

console.log('\n=== VAPID Keys (save these securely) ===\n')
console.log('Public key  (add to .env.local):')
console.log(`VITE_VAPID_PUBLIC_KEY=${pub}\n`)
console.log('Private key (add as Supabase Edge Function secret):')
console.log(`VAPID_PRIVATE_KEY=${priv}\n`)
console.log('Also add to Supabase secrets:')
console.log(`VAPID_SUBJECT=mailto:kadjeikoranteng@gmail.com\n`)
