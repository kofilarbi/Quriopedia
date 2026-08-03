import { supabase } from './supabase'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as SupabaseClient<any>

export async function joinQueue(
  userId: string,
  categoryId: string,
  displayName: string
): Promise<void> {
  // Upsert so rejoining after a leave works cleanly
  const { error } = await db.from('matchmaking_queue').upsert({
    user_id: userId,
    category_id: categoryId,
    display_name: displayName,
  })

  if (error) throw new Error(error.message)
}

export async function leaveQueue(userId: string): Promise<void> {
  const { error } = await db
    .from('matchmaking_queue')
    .delete()
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function findQueuedPlayers(
  categoryId: string,
  excludeUserId: string
): Promise<Array<{ userId: string; displayName: string }>> {
  const { data, error } = await db
    .from('matchmaking_queue')
    .select('user_id, display_name')
    .eq('category_id', categoryId)
    .neq('user_id', excludeUserId)
    .order('joined_at', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    userId: row.user_id,
    displayName: row.display_name,
  }))
}

export function subscribeToQueue(
  categoryId: string,
  callback: () => void
): RealtimeChannel {
  const channel = db
    .channel('queue-' + categoryId)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'matchmaking_queue',
        filter: 'category_id=eq.' + categoryId,
      },
      () => {
        callback()
      }
    )
    .subscribe()

  return channel
}
