import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Pencil, Check, Moon, Sun, Bell, BellOff, User, LogOut, Flame, Bookmark, Layers, Trophy, UserPlus, UserMinus, Search, Medal, type LucideIcon } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Category } from '@/data/mockData'
import { categories } from '@/data/mockData'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import { updateProfile, updateUserCategories } from '@/lib/profileService'
import { getCategoryIcon } from '@/lib/categoryIcons'
import { fetchMatchHistory } from '@/lib/sessionService'
import { fetchFriends, addFriend, removeFriend, searchUsers } from '@/lib/friendService'
import { requestNotificationPermission, subscribeToPush, unsubscribeFromPush } from '@/lib/pushNotifications'

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
    setNotificationTimezone,
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
        if (next) {
          const permission = await requestNotificationPermission()
          if (permission === 'granted') {
            void subscribeToPush(userId)
          }
        } else {
          void unsubscribeFromPush(userId)
        }
      } catch (err) {
        console.error('[Profile] toggleNotifications error:', err)
      }
    }
  }

  const handleNotificationTimeChange = async (t: string) => {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    setNotificationTime(t)
    setNotificationTimezone(tz)
    if (userId) {
      try {
        await updateProfile(userId, { notification_time: t, notification_timezone: tz } as never)
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
              aria-label="Edit name"
              className="text-warmGray hover:text-amber transition-colors"
            >
              <Pencil size={16} />
            </button>
          </div>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-6 mt-4">
          <Stat label="Day streak" value={streak} lucideIcon={Flame} />
          <div className="w-px h-8 bg-sand dark:bg-white/10" />
          <Stat label="Bookmarks" value={bookmarks.length} lucideIcon={Bookmark} />
          <div className="w-px h-8 bg-sand dark:bg-white/10" />
          <Stat label="Topics" value={selectedCategories.length} lucideIcon={Layers} />
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
            const CatIcon = getCategoryIcon(cat.id)
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
                <CatIcon size={14} style={{ color: cat.color }} />
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

      {/* Match History */}
      {userId && <MatchHistorySection userId={userId} />}

      {/* Friends */}
      {userId && <FriendsSection userId={userId} />}

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

function MatchHistorySection({ userId }: { userId: string }) {
  const { data: history, isLoading, error } = useQuery({
    queryKey: ['matchHistory', userId],
    queryFn: () => fetchMatchHistory(userId),
  })

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  }

  return (
    <Section title="Match History">
      {isLoading && (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-12 rounded-xl bg-sand dark:bg-white/10 animate-pulse" />
          ))}
        </div>
      )}
      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">Failed to load match history.</p>
      )}
      {!isLoading && !error && (!history || history.length === 0) && (
        <p className="text-sm text-warmGray dark:text-gray-400">
          No matches yet — play with friends to see results here.
        </p>
      )}
      {!isLoading && history && history.length > 0 && (
        <div className="space-y-2">
          {history.slice(0, 5).map((match) => {
            const CatIcon = match.categoryId ? getCategoryIcon(match.categoryId) : Trophy
            return (
              <div key={match.id} className="flex items-center gap-3 py-1">
                <CatIcon size={16} className="text-amber flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    #{match.finalRank} of {match.opponentCount + 1}
                  </p>
                  <p className="text-xs text-warmGray dark:text-gray-400">
                    {match.questionsCorrect}/{match.questionsTotal} correct
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="flex items-center gap-1">
                    <Medal size={12} className="text-amber" />
                    <span className="text-sm font-bold text-amber">{match.finalScore}</span>
                  </div>
                  <p className="text-xs text-warmGray dark:text-gray-400">
                    {formatDate(match.createdAt)}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Section>
  )
}

function FriendsSection({ userId }: { userId: string }) {
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<Array<{ id: string; name: string }>>([])
  const [searching, setSearching] = useState(false)

  const { data: friends, isLoading } = useQuery({
    queryKey: ['friends', userId],
    queryFn: () => fetchFriends(userId),
  })

  const addMutation = useMutation({
    mutationFn: (friendId: string) => addFriend(userId, friendId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['friends', userId] })
      setSearchResults([])
      setSearchQuery('')
    },
  })

  const removeMutation = useMutation({
    mutationFn: (friendId: string) => removeFriend(userId, friendId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['friends', userId] })
    },
  })

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setSearching(true)
    try {
      const results = await searchUsers(searchQuery, userId)
      setSearchResults(results)
    } catch (err) {
      console.error('[FriendsSection] searchUsers error:', err)
    } finally {
      setSearching(false)
    }
  }

  const friendIds = friends?.map((f) => f.id) ?? []

  return (
    <Section title="Friends">
      {/* Add friend row */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') void handleSearch() }}
          placeholder="Search by name…"
          className="flex-1 bg-cream dark:bg-navy border border-sand dark:border-white/20 rounded-xl px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder-warmGray dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber"
        />
        <button
          onClick={() => void handleSearch()}
          disabled={searching}
          className="px-3 py-2.5 bg-amber text-white rounded-xl hover:bg-amber-dark transition-colors disabled:opacity-60"
          aria-label="Search"
        >
          <Search size={16} />
        </button>
      </div>

      {/* Search results */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mb-4 bg-cream dark:bg-navy rounded-xl border border-sand dark:border-white/10 overflow-hidden"
          >
            {searchResults.map((user) => {
              const alreadyFriend = friendIds.includes(user.id)
              return (
                <div key={user.id} className="flex items-center justify-between px-3 py-2.5 border-b border-sand dark:border-white/5 last:border-0">
                  <span className="text-sm text-gray-800 dark:text-gray-200">{user.name}</span>
                  {alreadyFriend ? (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Already friends</span>
                  ) : (
                    <button
                      onClick={() => addMutation.mutate(user.id)}
                      disabled={addMutation.isPending}
                      className="flex items-center gap-1 text-xs font-semibold text-amber hover:text-amber-dark transition-colors disabled:opacity-60"
                    >
                      <UserPlus size={14} />
                      Add
                    </button>
                  )}
                </div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friends list */}
      {isLoading && (
        <div className="space-y-2">
          {[0, 1].map((i) => (
            <div key={i} className="h-10 rounded-xl bg-sand dark:bg-white/10 animate-pulse" />
          ))}
        </div>
      )}
      {!isLoading && (!friends || friends.length === 0) && (
        <p className="text-sm text-warmGray dark:text-gray-400">
          No friends yet. Search by name to add someone.
        </p>
      )}
      {!isLoading && friends && friends.length > 0 && (
        <div className="space-y-1">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-amber">
                    {friend.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-gray-800 dark:text-gray-200">{friend.name}</span>
              </div>
              <button
                onClick={() => removeMutation.mutate(friend.id)}
                disabled={removeMutation.isPending}
                className="text-red-400 hover:text-red-600 transition-colors disabled:opacity-40"
                aria-label="Remove friend"
              >
                <UserMinus size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </Section>
  )
}

function Stat({ label, value, lucideIcon: Icon }: { label: string; value: number; lucideIcon: LucideIcon }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="flex items-center gap-1 text-lg font-bold text-gray-900 dark:text-gray-50">
        <Icon size={16} className="text-amber" />
        {value}
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
        aria-label={`${label}: ${enabled ? 'on' : 'off'}`}
        aria-pressed={enabled}
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
