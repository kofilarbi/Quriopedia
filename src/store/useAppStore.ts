import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AppState {
  name: string
  selectedCategories: string[]
  notificationsEnabled: boolean
  notificationTime: string
  darkMode: boolean
  hasCompletedOnboarding: boolean
  streak: number
  bookmarks: string[]

  setName: (name: string) => void
  toggleCategory: (id: string) => void
  setNotificationsEnabled: (v: boolean) => void
  setNotificationTime: (t: string) => void
  toggleDarkMode: () => void
  completeOnboarding: () => void
  toggleBookmark: (cardId: string) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      name: '',
      selectedCategories: [],
      notificationsEnabled: false,
      notificationTime: '08:00',
      darkMode: false,
      hasCompletedOnboarding: false,
      streak: 0,
      bookmarks: [],

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

      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),

      completeOnboarding: () => set({ hasCompletedOnboarding: true, streak: 1 }),

      toggleBookmark: (cardId) => {
        const current = get().bookmarks
        if (current.includes(cardId)) {
          set({ bookmarks: current.filter((b) => b !== cardId) })
        } else {
          set({ bookmarks: [...current, cardId] })
        }
      },
    }),
    { name: 'quriopedia' }
  )
)
