import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppState {
  // Auth
  userId: string | null

  // Profile
  name: string
  selectedCategories: string[]
  notificationsEnabled: boolean
  notificationTime: string
  notificationTimezone: string
  darkMode: boolean
  streak: number

  // Onboarding (non-persisted, set by loadProfile)
  hasCompletedOnboarding: boolean

  // Bookmarks cache
  bookmarks: string[]

  // Actions
  setUserId: (id: string | null) => void
  setName: (name: string) => void
  toggleCategory: (id: string) => void
  setNotificationsEnabled: (v: boolean) => void
  setNotificationTime: (t: string) => void
  setNotificationTimezone: (tz: string) => void
  toggleDarkMode: () => void
  setDarkMode: (v: boolean) => void
  setHasCompletedOnboarding: (v: boolean) => void
  setStreak: (n: number) => void
  setBookmarks: (ids: string[]) => void
  toggleBookmark: (cardId: string) => void
  hydrateFromProfile: (data: {
    name: string
    selectedCategories: string[]
    notificationsEnabled: boolean
    notificationTime: string
    notificationTimezone: string
    darkMode: boolean
    streak: number
  }) => void
  clearAuthState: () => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      userId: null,
      name: '',
      selectedCategories: [],
      notificationsEnabled: false,
      notificationTime: '08:00',
      notificationTimezone: 'UTC',
      darkMode: false,
      hasCompletedOnboarding: false,
      streak: 0,
      bookmarks: [],

      setUserId: (id) => set({ userId: id }),

      setName: (name) => set({ name }),

      toggleCategory: (id) => {
        const current = get().selectedCategories
        if (current.includes(id)) {
          set({ selectedCategories: current.filter((c) => c !== id) })
        } else {
          set({ selectedCategories: [...current, id] })
        }
      },

      setNotificationsEnabled: (v) => set({ notificationsEnabled: v }),

      setNotificationTime: (t) => set({ notificationTime: t }),

      setNotificationTimezone: (tz) => set({ notificationTimezone: tz }),

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      setDarkMode: (v) => set({ darkMode: v }),

      setHasCompletedOnboarding: (v) => set({ hasCompletedOnboarding: v }),

      setStreak: (n) => set({ streak: n }),

      setBookmarks: (ids) => set({ bookmarks: ids }),

      toggleBookmark: (cardId) => {
        const current = get().bookmarks
        if (current.includes(cardId)) {
          set({ bookmarks: current.filter((b) => b !== cardId) })
        } else {
          set({ bookmarks: [...current, cardId] })
        }
      },

      hydrateFromProfile: (data) =>
        set({
          name: data.name,
          selectedCategories: data.selectedCategories,
          notificationsEnabled: data.notificationsEnabled,
          notificationTime: data.notificationTime,
          notificationTimezone: data.notificationTimezone,
          darkMode: data.darkMode,
          streak: data.streak,
        }),

      clearAuthState: () =>
        set({
          userId: null,
          hasCompletedOnboarding: false,
          name: '',
          selectedCategories: [],
          notificationsEnabled: false,
          notificationTime: '08:00',
          notificationTimezone: 'UTC',
          darkMode: false,
          streak: 0,
          bookmarks: [],
        }),
    }),
    {
      name: 'quriopedia',
      // Exclude hasCompletedOnboarding from persistence — derived from DB
      partialize: (state) => ({
        userId: state.userId,
        name: state.name,
        selectedCategories: state.selectedCategories,
        notificationsEnabled: state.notificationsEnabled,
        notificationTime: state.notificationTime,
        notificationTimezone: state.notificationTimezone,
        darkMode: state.darkMode,
        streak: state.streak,
        bookmarks: state.bookmarks,
      }),
    }
  )
)
