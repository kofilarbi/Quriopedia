import { supabase } from './supabase'
import type { Database } from './database.types'
import { useAppStore } from '@/store/useAppStore'

type ProfileRow = Database['public']['Tables']['user_profiles']['Row']
type ProfileInsert = Database['public']['Tables']['user_profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['user_profiles']['Update']
type UserCategoryInsert = Database['public']['Tables']['user_categories']['Insert']

export async function loadProfile(userId: string): Promise<void> {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .returns<ProfileRow[]>()
    .single()

  if (profileError) {
    if (profileError.code === 'PGRST116') {
      useAppStore.getState().setHasCompletedOnboarding(false)
      return
    }
    console.error('[profileService] loadProfile error:', profileError)
    return
  }

  const { data: userCategories, error: catError } = await supabase
    .from('user_categories')
    .select('category_id')
    .eq('user_id', userId)

  if (catError) {
    console.error('[profileService] loadProfile categories error:', catError)
  }

  const selectedCategories = (userCategories ?? []).map((r) => (r as { category_id: string }).category_id)

  useAppStore.getState().hydrateFromProfile({
    name: profile.name,
    selectedCategories,
    notificationsEnabled: profile.notifications_enabled,
    notificationTime: profile.notification_time,
    darkMode: profile.dark_mode,
    streak: profile.streak_count,
  })
  useAppStore.getState().setHasCompletedOnboarding(true)
}

export async function ensureProfile(userId: string): Promise<void> {
  const { data: existing, error: fetchError } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .returns<{ id: string }[]>()
    .single()

  if (fetchError && fetchError.code !== 'PGRST116') {
    console.error('[profileService] ensureProfile fetch error:', fetchError)
    return
  }

  if (!existing) {
    const insertPayload: ProfileInsert = { id: userId }
    const { error: insertError } = await supabase
      .from('user_profiles')
      .insert(insertPayload as never)

    if (insertError) {
      console.error('[profileService] ensureProfile insert error:', insertError)
    }
  }
}

export async function saveOnboarding(
  userId: string,
  data: {
    name: string
    selectedCategories: string[]
    notificationsEnabled: boolean
    notificationTime: string
  }
): Promise<void> {
  const upsertPayload: ProfileInsert = {
    id: userId,
    name: data.name,
    notifications_enabled: data.notificationsEnabled,
    notification_time: data.notificationTime,
    streak_count: 1,
    last_active_date: new Date().toISOString().split('T')[0],
  }

  const { error: upsertError } = await supabase
    .from('user_profiles')
    .upsert(upsertPayload as never)

  if (upsertError) {
    console.error('[profileService] saveOnboarding upsert error:', upsertError)
    throw upsertError
  }

  const { error: deleteError } = await supabase
    .from('user_categories')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('[profileService] saveOnboarding delete categories error:', deleteError)
    throw deleteError
  }

  if (data.selectedCategories.length > 0) {
    const rows: UserCategoryInsert[] = data.selectedCategories.map((categoryId) => ({
      user_id: userId,
      category_id: categoryId,
    }))
    const { error: insertError } = await supabase
      .from('user_categories')
      .insert(rows as never[])
    if (insertError) {
      console.error('[profileService] saveOnboarding insert categories error:', insertError)
      throw insertError
    }
  }

  useAppStore.getState().setHasCompletedOnboarding(true)
  useAppStore.getState().setStreak(1)
}

export async function updateProfile(userId: string, patch: ProfileUpdate): Promise<void> {
  const { error } = await supabase
    .from('user_profiles')
    .update(patch as never)
    .eq('id', userId)

  if (error) {
    console.error('[profileService] updateProfile error:', error)
    throw error
  }
}

export async function updateUserCategories(userId: string, selectedCategories: string[]): Promise<void> {
  const { error: deleteError } = await supabase
    .from('user_categories')
    .delete()
    .eq('user_id', userId)

  if (deleteError) {
    console.error('[profileService] updateUserCategories delete error:', deleteError)
    throw deleteError
  }

  if (selectedCategories.length > 0) {
    const rows: UserCategoryInsert[] = selectedCategories.map((categoryId) => ({
      user_id: userId,
      category_id: categoryId,
    }))
    const { error: insertError } = await supabase
      .from('user_categories')
      .insert(rows as never[])
    if (insertError) {
      console.error('[profileService] updateUserCategories insert error:', insertError)
      throw insertError
    }
  }
}

export async function updateStreak(userId: string): Promise<void> {
  const { data: profile, error: fetchError } = await supabase
    .from('user_profiles')
    .select('streak_count, last_active_date')
    .eq('id', userId)
    .returns<Pick<ProfileRow, 'streak_count' | 'last_active_date'>[]>()
    .single()

  if (fetchError) {
    console.error('[profileService] updateStreak fetch error:', fetchError)
    return
  }

  const today = new Date().toISOString().split('T')[0]
  const lastActive = profile.last_active_date

  if (lastActive === today) {
    return
  }

  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const newStreak = lastActive === yesterday ? profile.streak_count + 1 : 1

  const updatePayload: ProfileUpdate = { streak_count: newStreak, last_active_date: today }
  const { error: updateError } = await supabase
    .from('user_profiles')
    .update(updatePayload as never)
    .eq('id', userId)

  if (updateError) {
    console.error('[profileService] updateStreak update error:', updateError)
    return
  }

  useAppStore.getState().setStreak(newStreak)
}
