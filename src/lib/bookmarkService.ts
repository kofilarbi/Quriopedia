import { supabase } from './supabase'
import type { Database } from './database.types'

type BookmarkInsert = Database['public']['Tables']['bookmarks']['Insert']

export async function fetchBookmarks(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('entry_id')
    .eq('user_id', userId)
    .returns<{ entry_id: string }[]>()

  if (error) {
    console.error('[bookmarkService] fetchBookmarks error:', error)
    throw error
  }

  return (data ?? []).map((r) => r.entry_id)
}

export async function addBookmark(userId: string, entryId: string): Promise<void> {
  const payload: BookmarkInsert = { user_id: userId, entry_id: entryId }
  const { error } = await supabase
    .from('bookmarks')
    .insert(payload as never)

  if (error) {
    console.error('[bookmarkService] addBookmark error:', error)
    throw error
  }
}

export async function removeBookmark(userId: string, entryId: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('entry_id', entryId)

  if (error) {
    console.error('[bookmarkService] removeBookmark error:', error)
    throw error
  }
}
