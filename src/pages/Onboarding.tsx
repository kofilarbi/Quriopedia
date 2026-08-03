import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Bell, BellOff, Check } from 'lucide-react'
import type { Category } from '@/data/mockData'
import { categories } from '@/data/mockData'
import { useAppStore } from '@/store/useAppStore'
import CategoryTile from '@/components/CategoryTile'

const STEP_COUNT = 4

const variants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
}

export default function Onboarding() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)
  const {
    selectedCategories,
    toggleCategory,
    notificationsEnabled,
    setNotificationsEnabled,
    notificationTime,
    setNotificationTime,
    name,
    setName,
    completeOnboarding,
  } = useAppStore()

  const goNext = () => {
    setDir(1)
    setStep((s) => s + 1)
  }

  const finish = () => {
    completeOnboarding()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-navy overflow-hidden relative">
      {/* Progress dots */}
      {step > 0 && (
        <div className="absolute top-6 left-0 right-0 flex justify-center gap-2 z-10">
          {Array.from({ length: STEP_COUNT }).map((_, i) => (
            <div
              key={i}
              className={`rounded-full transition-all duration-300 ${
                i === step
                  ? 'w-6 h-2 bg-amber'
                  : i < step
                  ? 'w-2 h-2 bg-amber/50'
                  : 'w-2 h-2 bg-sand dark:bg-white/20'
              }`}
            />
          ))}
        </div>
      )}

      <AnimatePresence mode="wait" custom={dir}>
        <motion.div
          key={step}
          custom={dir}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.3, ease: 'easeInOut' }}
          className="absolute inset-0 overflow-y-auto"
        >
          {step === 0 && <WelcomeStep onNext={goNext} />}
          {step === 1 && (
            <CategoriesStep
              selected={selectedCategories}
              onToggle={toggleCategory}
              onNext={goNext}
            />
          )}
          {step === 2 && (
            <NotificationsStep
              enabled={notificationsEnabled}
              time={notificationTime}
              onToggle={setNotificationsEnabled}
              onTimeChange={setNotificationTime}
              onNext={goNext}
            />
          )}
          {step === 3 && (
            <PersonalizationStep
              name={name}
              onNameChange={setName}
              onFinish={finish}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function WelcomeStep({ onNext }: { onNext: () => void }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 bg-gradient-to-b from-cream to-sand dark:from-navy dark:to-navy-surface text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="w-24 h-24 rounded-3xl bg-amber flex items-center justify-center shadow-lg mb-8"
      >
        <span className="text-white font-bold text-5xl font-serif">Q</span>
      </motion.div>

      <motion.h1
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="text-4xl font-bold text-gray-900 dark:text-gray-50 mb-3"
      >
        Quriopedia
      </motion.h1>

      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-lg text-warmGray dark:text-gray-400 mb-12 leading-relaxed"
      >
        Learn one new thing, every day.
      </motion.p>

      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.4 }}
        onClick={onNext}
        className="inline-flex items-center gap-2 bg-amber hover:bg-amber-dark text-white font-semibold text-lg px-8 py-4 rounded-full shadow-lg transition-colors"
      >
        Get started
        <ArrowRight size={20} />
      </motion.button>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-6 text-xs text-warmGray dark:text-gray-500"
      >
        No account required · Free forever
      </motion.p>
    </div>
  )
}

function CategoriesStep({
  selected,
  onToggle,
  onNext,
}: {
  selected: string[]
  onToggle: (id: string) => void
  onNext: () => void
}) {
  const canContinue = selected.length >= 3

  return (
    <div className="min-h-screen flex flex-col pt-16 pb-32">
      <div className="px-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
          What are you curious about?
        </h1>
        <p className="text-warmGray dark:text-gray-400">
          Pick at least 3 topics to personalize your feed.
        </p>
      </div>

      <div className="px-4 grid grid-cols-2 gap-3 flex-1">
        {categories.map((cat: Category) => (
          <CategoryTile
            key={cat.id}
            category={cat}
            selected={selected.includes(cat.id)}
            onClick={() => onToggle(cat.id)}
          />
        ))}
      </div>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-cream/95 dark:bg-navy/95 backdrop-blur-sm border-t border-sand dark:border-white/10 px-6 py-4"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)' }}
      >
        <div className="max-w-md mx-auto flex items-center justify-between">
          <span className="text-sm text-warmGray">
            {selected.length < 3
              ? `${3 - selected.length} more to go`
              : `${selected.length} selected`}
          </span>
          <button
            onClick={onNext}
            disabled={!canContinue}
            className={`inline-flex items-center gap-2 font-semibold px-6 py-3 rounded-full transition-all ${
              canContinue
                ? 'bg-amber text-white hover:bg-amber-dark shadow-md'
                : 'bg-sand dark:bg-white/10 text-warmGray cursor-not-allowed'
            }`}
          >
            Continue
            <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}

function NotificationsStep({
  enabled,
  time,
  onToggle,
  onTimeChange,
  onNext,
}: {
  enabled: boolean
  time: string
  onToggle: (v: boolean) => void
  onTimeChange: (t: string) => void
  onNext: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pt-16">
      <div className="w-20 h-20 rounded-2xl bg-amber/10 border-2 border-amber/30 flex items-center justify-center mb-8">
        {enabled ? (
          <Bell size={36} className="text-amber" />
        ) : (
          <BellOff size={36} className="text-warmGray" />
        )}
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2 text-center">
        Never miss your daily dose
      </h1>
      <p className="text-warmGray dark:text-gray-400 text-center mb-10">
        We'll send you one notification a day with fresh knowledge.
      </p>

      {/* Toggle */}
      <div className="w-full max-w-sm bg-white dark:bg-navy-surface rounded-2xl border border-sand dark:border-white/10 p-5 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-gray-50">Daily reminder</p>
            <p className="text-sm text-warmGray dark:text-gray-400 mt-0.5">
              {enabled ? 'Notifications on' : 'Notifications off'}
            </p>
          </div>
          <button
            onClick={() => onToggle(!enabled)}
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

        <AnimatePresence>
          {enabled && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-sand dark:border-white/10">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  What time?
                </label>
                <input
                  type="time"
                  value={time}
                  onChange={(e) => onTimeChange(e.target.value)}
                  className="w-full bg-cream dark:bg-navy border border-sand dark:border-white/20 rounded-xl px-4 py-3 text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-amber"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <button
        onClick={onNext}
        className="w-full max-w-sm bg-amber hover:bg-amber-dark text-white font-semibold py-4 rounded-full transition-colors shadow-md mt-2"
      >
        Continue
      </button>

      <button
        onClick={onNext}
        className="mt-3 text-sm text-warmGray hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        Skip for now
      </button>
    </div>
  )
}

function PersonalizationStep({
  name,
  onNameChange,
  onFinish,
}: {
  name: string
  onNameChange: (n: string) => void
  onFinish: () => void
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 pt-16">
      <div className="w-20 h-20 rounded-2xl bg-amber/10 border-2 border-amber/30 flex items-center justify-center mb-8">
        <Check size={36} className="text-amber" />
      </div>

      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-2 text-center">
        What should we call you?
      </h1>
      <p className="text-warmGray dark:text-gray-400 text-center mb-10">
        This is optional — skip if you prefer.
      </p>

      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Your first name"
        className="w-full max-w-sm bg-white dark:bg-navy-surface border-2 border-sand dark:border-white/20 focus:border-amber rounded-2xl px-5 py-4 text-lg text-gray-900 dark:text-gray-100 placeholder:text-warmGray dark:placeholder:text-gray-500 outline-none transition-colors mb-4"
        autoFocus
      />

      <button
        onClick={onFinish}
        className="w-full max-w-sm bg-amber hover:bg-amber-dark text-white font-semibold py-4 rounded-full transition-colors shadow-md flex items-center justify-center gap-2"
      >
        Start learning
        <ArrowRight size={18} />
      </button>

      <button
        onClick={onFinish}
        className="mt-3 text-sm text-warmGray hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
      >
        Skip
      </button>
    </div>
  )
}
