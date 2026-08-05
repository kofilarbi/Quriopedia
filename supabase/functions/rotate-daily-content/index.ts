// Supabase Edge Function — ensures every category has a published entry for today.
// Picks the next hand-written pool entry in round-robin order; inserts a dated copy.
// Deploy: supabase functions deploy rotate-daily-content
// Schedule: pg_cron at 00:05 UTC daily (5 min after midnight to avoid races).
//   SELECT cron.schedule(
//     'rotate-daily-content',
//     '5 0 * * *',
//     $$SELECT net.http_post(
//       url  := 'https://<project-ref>.supabase.co/functions/v1/rotate-daily-content',
//       headers := jsonb_build_object('Authorization','Bearer <service-role-key>')
//     )$$
//   );

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// Stable epoch for day-offset calculation — must match entryService.ts
const EPOCH = new Date('2026-01-01T00:00:00Z').getTime()

Deno.serve(async () => {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const today = new Date().toISOString().split('T')[0]
  const dayOffset = Math.floor((Date.now() - EPOCH) / (1000 * 60 * 60 * 24))

  // All categories
  const { data: categories, error: catError } = await supabase
    .from('categories')
    .select('id')

  if (catError) {
    return new Response(JSON.stringify({ error: catError.message }), { status: 500 })
  }

  const results: { category: string; status: string; detail?: string }[] = []

  for (const cat of categories ?? []) {
    // Skip if today's entry already exists (idempotent)
    const { data: existing } = await supabase
      .from('entries')
      .select('id')
      .eq('category_id', cat.id)
      .eq('published_date', today)
      .limit(1)

    if (existing && existing.length > 0) {
      results.push({ category: cat.id, status: 'already_exists' })
      continue
    }

    // Pool = hand-written entries only, stable order
    const { data: pool, error: poolError } = await supabase
      .from('entries')
      .select('headline, body, read_more, type')
      .eq('category_id', cat.id)
      .eq('is_generated', false)
      .order('published_date', { ascending: true })
      .order('id', { ascending: true })

    if (poolError || !pool || pool.length === 0) {
      results.push({ category: cat.id, status: 'no_pool', detail: poolError?.message })
      continue
    }

    const source = pool[dayOffset % pool.length]

    const { error: insertError } = await supabase.from('entries').insert({
      category_id: cat.id,
      headline: source.headline,
      body: source.body,
      read_more: source.read_more,
      type: source.type,
      published_date: today,
      is_generated: true,
    })

    if (insertError) {
      // 23505 = unique_violation → concurrent run already inserted, that's fine
      const status = insertError.code === '23505' ? 'conflict_ok' : 'insert_error'
      results.push({ category: cat.id, status, detail: insertError.message })
    } else {
      results.push({ category: cat.id, status: 'inserted' })
    }
  }

  const inserted = results.filter((r) => r.status === 'inserted').length
  const skipped = results.filter((r) => r.status === 'already_exists').length

  return new Response(
    JSON.stringify({ today, day_offset: dayOffset, inserted, skipped, results }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
