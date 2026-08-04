import { useState } from 'react'
import { motion } from 'framer-motion'
import { supabase } from '@/lib/supabase'

type Tab = 'signin' | 'signup'

export default function Auth() {
  const [tab, setTab] = useState<Tab>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (tab === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      if (tab === 'signin') {
        const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })
        if (signInError) throw signInError
      } else {
        const { error: signUpError } = await supabase.auth.signUp({ email, password })
        if (signUpError) throw signUpError
      }
      // Navigation is handled by the route layer in App.tsx (user state change triggers redirect).
      // When Auth is embedded inline (e.g. inside JoinRoom), we intentionally don't navigate away.
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong.'
      setError(message)
      console.error('[Auth] error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-cream to-sand dark:from-navy dark:to-navy-surface flex flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Wordmark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber flex items-center justify-center shadow-lg mb-4">
            <span className="text-white font-bold text-3xl font-serif">Q</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Quriopedia</h1>
          <p className="text-sm text-warmGray dark:text-gray-400 mt-1">Learn one new thing, every day.</p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 shadow-sm p-6">
          {/* Tab switcher */}
          <div className="flex rounded-xl bg-sand dark:bg-white/10 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setTab('signin'); setError(null) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === 'signin'
                  ? 'bg-white dark:bg-navy shadow text-gray-900 dark:text-gray-50'
                  : 'text-warmGray dark:text-gray-400'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setError(null) }}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                tab === 'signup'
                  ? 'bg-white dark:bg-navy shadow text-gray-900 dark:text-gray-50'
                  : 'text-warmGray dark:text-gray-400'
              }`}
            >
              Create account
            </button>
          </div>

          {/* Error message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-full text-center text-xs font-medium text-red-600 dark:text-red-400"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-cream dark:bg-navy border border-sand dark:border-white/20 focus:border-amber rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-warmGray dark:placeholder:text-gray-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-cream dark:bg-navy border border-sand dark:border-white/20 focus:border-amber rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-warmGray dark:placeholder:text-gray-500 outline-none transition-colors"
              />
            </div>

            {tab === 'signup' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Confirm password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-cream dark:bg-navy border border-sand dark:border-white/20 focus:border-amber rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-warmGray dark:placeholder:text-gray-500 outline-none transition-colors"
                />
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber hover:bg-amber-dark text-white font-semibold py-3.5 rounded-full transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? tab === 'signin' ? 'Signing in…' : 'Creating account…'
                : tab === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
