import { supabase } from './supabase'
import type { SupabaseClient } from '@supabase/supabase-js'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as SupabaseClient<any>

export interface Friend {
  userId: string
  displayName: string
  email?: string
}

export async function searchUsers(
  query: string,
  excludeUserId: string
): Promise<Array<{ id: string; name: string }>> {
  if (!query.trim()) return []

  const { data, error } = await db
    .from('user_profiles')
    .select('id, name')
    .ilike('name', `%${query.trim()}%`)
    .neq('id', excludeUserId)
    .limit(10)

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({ id: row.id, name: row.name }))
}

export async function addFriend(userId: string, friendId: string): Promise<void> {
  // Insert both directions for easy querying
  const { error } = await db.from('friends').insert([
    { user_id: userId, friend_id: friendId },
    { user_id: friendId, friend_id: userId },
  ])

  if (error) throw new Error(error.message)
}

export async function removeFriend(userId: string, friendId: string): Promise<void> {
  const { error: e1 } = await db
    .from('friends')
    .delete()
    .eq('user_id', userId)
    .eq('friend_id', friendId)

  if (e1) throw new Error(e1.message)

  const { error: e2 } = await db
    .from('friends')
    .delete()
    .eq('user_id', friendId)
    .eq('friend_id', userId)

  if (e2) throw new Error(e2.message)
}

export async function fetchFriends(userId: string): Promise<Array<{ id: string; name: string }>> {
  // Fetch friend_ids for this user, then join with user_profiles
  const { data: friendRows, error: friendError } = await db
    .from('friends')
    .select('friend_id')
    .eq('user_id', userId)

  if (friendError) throw new Error(friendError.message)
  if (!friendRows || friendRows.length === 0) return []

  const friendIds = friendRows.map((r) => r.friend_id)

  const { data: profiles, error: profileError } = await db
    .from('user_profiles')
    .select('id, name')
    .in('id', friendIds)

  if (profileError) throw new Error(profileError.message)
  if (!profiles) return []

  return profiles.map((row) => ({ id: row.id, name: row.name }))
}
