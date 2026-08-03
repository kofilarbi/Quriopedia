import { useEffect, useState } from 'react'
import type { User, Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { loadProfile, ensureProfile, updateStreak } from './profileService'
import { fetchBookmarks } from './bookmarkService'
import { useAppStore } from '@/store/useAppStore'

interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      const { data } = await supabase.auth.getSession()
      if (!mounted) return

      const currentUser = data.session?.user ?? null
      setSession(data.session)
      setUser(currentUser)

      if (currentUser) {
        await initUserData(currentUser.id)
      }

      if (mounted) setLoading(false)
    }

    void bootstrap()

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return
      setSession(newSession)
      setUser(newSession?.user ?? null)

      if (_event === 'SIGNED_IN' && newSession?.user) {
        setLoading(true)
        await initUserData(newSession.user.id)
        if (mounted) setLoading(false)
      } else if (_event === 'SIGNED_OUT') {
        useAppStore.getState().clearAuthState()
      }
    })

    return () => {
      mounted = false
      listener.subscription.unsubscribe()
    }
  }, [])

  return { user, session, loading }
}

async function initUserData(userId: string): Promise<void> {
  try {
    await ensureProfile(userId)
    await loadProfile(userId)
    await updateStreak(userId)
    const bookmarkIds = await fetchBookmarks(userId)
    useAppStore.getState().setBookmarks(bookmarkIds)
    useAppStore.getState().setUserId(userId)
  } catch (err) {
    console.error('[useAuth] initUserData error:', err)
  }
}
