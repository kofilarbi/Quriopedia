import { supabase } from './supabase'

export interface Entry {
  id: string
  categoryId: string
  headline: string
  body: string
  readMore: string | null
  type: 'fact' | 'vocab' | 'insight'
  publishedDate: string
  createdAt: string
}

function mapRow(row: {
  id: string
  category_id: string
  headline: string
  body: string
  read_more: string | null
  type: 'fact' | 'vocab' | 'insight'
  published_date: string
  created_at: string
}): Entry {
  return {
    id: row.id,
    categoryId: row.category_id,
    headline: row.headline,
    body: row.body,
    readMore: row.read_more,
    type: row.type,
    publishedDate: row.published_date,
    createdAt: row.created_at,
  }
}

export async function fetchTodaysEntries(categoryIds: string[]): Promise<Entry[]> {
  if (categoryIds.length === 0) return []

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .in('category_id', categoryIds)
    .eq('published_date', today)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[entryService] fetchTodaysEntries error:', error)
    throw error
  }

  if (data && data.length > 0) {
    return data.map(mapRow)
  }

  // Fallback: fetch the most recent entry per category
  const fallbackResults: Entry[] = []
  for (const categoryId of categoryIds) {
    const { data: fallback, error: fallbackError } = await supabase
      .from('entries')
      .select('*')
      .eq('category_id', categoryId)
      .order('published_date', { ascending: false })
      .limit(1)

    if (fallbackError) {
      console.error('[entryService] fetchTodaysEntries fallback error:', fallbackError)
      continue
    }

    if (fallback && fallback.length > 0) {
      fallbackResults.push(mapRow(fallback[0]))
    }
  }

  return fallbackResults
}

export async function fetchCategoryEntries(categoryId: string): Promise<Entry[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('category_id', categoryId)
    .order('published_date', { ascending: false })

  if (error) {
    console.error('[entryService] fetchCategoryEntries error:', error)
    throw error
  }

  return (data ?? []).map(mapRow)
}

export async function fetchEntriesByIds(entryIds: string[]): Promise<Entry[]> {
  if (entryIds.length === 0) return []

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .in('id', entryIds)

  if (error) {
    console.error('[entryService] fetchEntriesByIds error:', error)
    throw error
  }

  return (data ?? []).map(mapRow)
}

export async function searchEntries(query: string): Promise<Entry[]> {
  if (!query.trim()) return []

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .or(`headline.ilike.%${query}%,body.ilike.%${query}%`)
    .order('published_date', { ascending: false })
    .limit(20)

  if (error) {
    console.error('[entryService] searchEntries error:', error)
    throw error
  }

  return (data ?? []).map(mapRow)
}
