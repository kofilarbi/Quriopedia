import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Check, Moon, Sun, Bell, BellOff, User, LogOut } from 'lucide-react'
import type { Category } from '@/data/mockData'
import { categories } from '@/data/mockData'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import { updateProfile, updateUserCategories } from '@/lib/profileService'

export default function Profile() {
  const {
    userId,
    name,
    setName,
    selectedCategories,
    toggleCategory,
    darkMode,
    toggleDarkMode,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationTime,
    setNotificationTime,
    streak,
    bookmarks,
  } = useAppStore()

  const [editingName, setEditingName] = useState(false)
  const [nameInput, setNameInput] = useState(name)
  const [signingOut, setSigningOut] = useState(false)

  const initials = name
    .trim()
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  const saveName = async () => {
    const trimmed = nameInput.trim()
    setName(trimmed)
    setEditingName(false)
    if (userId) {
      try {
        await updateProfile(userId, { name: trimmed })
      } catch (err) {
        console.error('[Profile] saveName error:', err)
      }
    }
  }

  const handleToggleCategory = async (id: string) => {
    if (!canDeselect(id)) return
    toggleCategory(id)
    if (userId) {
      const updated = selectedCategories.includes(id)
        ? selectedCategories.filter((c) => c !== id)
        : [...selectedCategories, id]
      try {
        await updateUserCategories(userId, updated)
      } catch (err) {
        console.error('[Profile] handleToggleCategory error:', err)
        // Revert
        toggleCategory(id)
      }
    }
  }

  const handleToggleDarkMode = async () => {
    toggleDarkMode()
    if (userId) {
      try {
        await updateProfile(userId, { dark_mode: !darkMode })
      } catch (err) {
        console.error('[Profile] toggleDarkMode error:', err)
      }
    }
  }

  const handleToggleNotifications = async () => {
    const next = !notificationsEnabled
    setNotificationsEnabled(next)
    if (userId) {
      try {
        await updateProfile(userId, { notifications_enabled: next })
      } catch (err) {
        console.error('[Profile] toggleNotifications error:', err)
      }
    }
  }

  const handleNotificationTimeChange = async (t: string) => {
    setNotificationTime(t)
    if (userId) {
      try {
        await updateProfile(userId, { notification_time: t })
      } catch (err) {
        console.error('[Profile] notificationTime error:', err)
      }
    }
  }

  const handleSignOut = async () => {
    setSigningOut(true)
    try {
      await supabase.auth.signOut()
    } catch (err) {
      console.error('[Profile] signOut error:', err)
      setSigningOut(false)
    }
  }

  const canDeselect = (id: string) => {
    if (!selectedCategories.includes(id)) return true
    return selectedCategories.length > 3
  }

  return (
    <div className="px-4 pt-6 pb-28 space-y-6">
      {/* Avatar + name */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center py-6"
      >
        <div className="w-20 h-20 rounded-full bg-amber flex items-center justify-center mb-4 shadow-md">
          {initials ? (
            <span className="text-white text-2xl font-bold">{initials}</span>
          ) : (
            <User size={32} className="text-white" />
          )}
        </div>

        {editingName ? (
          <div className="flex items-center gap-2">
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void saveName()
                if (e.key === 'Escape') setEditingName(false)
              }}
              className="border-b-2 border-amber bg-transparent text-xl font-semibold text-gray-900 dark:text-gray-50 text-center outline-none w-40"
              autoFocus
            />
            <button
              onClick={() => void saveName()}
              className="w-8 h-8 bg-amber rounded-full flex items-center justify-center"
            >
              <Check size={16} className="text-white" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-50">
              {name || 'Anonymous'}
            </h2>
            <button
              onClick={() => {
                setNameInput(name)
                setEditingName(true)
              }}
              className="text-warmGray hover:text-amber transition-colors"
            >
              <Pencil size={16} />
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4">
          <Stat label="Day streak" value={streak} emoji="🔥" />
          <div className="w-px h-8 bg-sand dark:bg-white/10" />
          <Stat label="Bookmarks" value={bookmarks.length} emoji="📌" />
          <div className="w-px h-8 bg-sand dark:bg-white/10" />
          <Stat label="Topics" value={selectedCategories.length} emoji="🎯" />
        </div>
      </motion.div>

      {/* My topics */}
      <Section title="My topics">
        <p className="text-xs text-warmGray dark:text-gray-400 mb-3">
          Keep at least 3 selected.
        </p>
        <div className="grid grid-cols-3 gap-2">
          {categories.map((cat: Category) => {
            const isSelected = selectedCategories.includes(cat.id)
            const disabled = isSelected && !canDeselect(cat.id)
            return (
              <button
                key={cat.id}
                onClick={() => { void handleToggleCategory(cat.id) }}
                disabled={disabled}
                className={`flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 text-xs font-medium transition-all ${
                  isSelected
                    ? 'border-amber bg-amber/10 text-gray-800 dark:text-gray-200'
                    : 'border-sand dark:border-white/10 bg-white dark:bg-navy-surface text-warmGray dark:text-gray-400 hover:border-amber/40'
                } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                <span className="text-xl">{cat.emoji}</span>
                <span className="leading-tight text-center">{cat.name}</span>
              </button>
            )
          })}
        </div>
      </Section>

      {/* Preferences */}
      <Section title="Preferences">
        {/* Dark mode */}
        <ToggleRow
          icon={darkMode ? <Moon size={18} /> : <Sun size={18} />}
          label="Dark mode"
          description={darkMode ? 'Dark theme active' : 'Light theme active'}
          enabled={darkMode}
          onToggle={() => { void handleToggleDarkMode() }}
        />

        <div className="h-px bg-sand dark:bg-white/10 my-1" />

        {/* Notifications */}
        <ToggleRow
          icon={notificationsEnabled ? <Bell size={18} /> : <BellOff size={18} />}
          label="Daily reminder"
          description={notificationsEnabled ? `Sends at ${notificationTime}` : 'No reminders set'}
          enabled={notificationsEnabled}
          onToggle={() => { void handleToggleNotifications() }}
        />

        <AnimatePresence>
          {notificationsEnabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="pt-3 pb-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reminder time
                </label>
                <input
                  type="time"
                  value={notificationTime}
                  onChange={(e) => { void handleNotificationTimeChange(e.target.value) }}
                  className="w-full bg-cream dark:bg-navy border border-sand dark:border-white/20 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      {/* App info */}
      <Section title="App info">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-warmGray dark:text-gray-400">Version</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            2.0.0 · Phase 2
          </span>
        </div>
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-warmGray dark:text-gray-400">Built with</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            React + Supabase
          </span>
        </div>
      </Section>

      {/* Sign out */}
      <Section title="Account">
        <button
          onClick={() => { void handleSignOut() }}
          disabled={signingOut}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-60"
        >
          <LogOut size={16} />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </Section>
    </div>
  )
}

function Stat({ label, value, emoji }: { label: string; value: number; emoji: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-gray-900 dark:text-gray-50">
        {emoji} {value}
      </span>
      <span className="text-xs text-warmGray dark:text-gray-400">{label}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 overflow-hidden">
      <div className="px-4 py-3 border-b border-sand dark:border-white/10">
        <h3 className="text-xs font-semibold text-warmGray dark:text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )
}

function ToggleRow({
  icon,
  label,
  description,
  enabled,
  onToggle,
}: {
  icon: React.ReactNode
  label: string
  description: string
  enabled: boolean
  onToggle: () => void
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center gap-3">
        <span className={`${enabled ? 'text-amber' : 'text-warmGray'}`}>{icon}</span>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
          <p className="text-xs text-warmGray dark:text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        onClick={onToggle}
        className={`relative inline-flex w-12 h-6 rounded-full transition-colors duration-300 ${
          enabled ? 'bg-amber' : 'bg-sand dark:bg-white/20'
        }`}
      >
        <motion.span
          layout
          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
          animate={{ left: enabled ? '28px' : '4px' }}
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      </button>
    </div>
  )
}
