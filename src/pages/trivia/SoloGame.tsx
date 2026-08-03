import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { fetchTriviaQuestions, type TriviaQuestion } from '@/lib/triviaService'

interface LocationState {
  categoryId: string
  count: number
}

const COUNTDOWN_SECONDS = 12
const CIRCUMFERENCE = 2 * Math.PI * 40 // r=40

export default function SoloGame() {
  const navigate = useNavigate()
  const location = useLocation()
  const state = location.state as LocationState | null

  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS)
  const [scores, setScores] = useState<number[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!state?.categoryId) {
      navigate('/trivia/solo', { replace: true })
      return
    }
    fetchTriviaQuestions(state.categoryId, state.count)
      .then((qs) => {
        if (qs.length === 0) {
          setError('No questions found for this category.')
        } else {
          setQuestions(qs)
        }
        setLoading(false)
      })
      .catch(() => {
        setError('Failed to load questions. Please try again.')
        setLoading(false)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Countdown timer
  useEffect(() => {
    if (loading || showFeedback || questions.length === 0) return
    setTimeLeft(COUNTDOWN_SECONDS)
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!)
          handleTimeout()
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [currentIndex, loading, showFeedback, questions.length]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimeout = () => {
    setSelectedAnswer(-1)
    setShowFeedback(true)
    setScores((prev) => [...prev, 0])
  }

  const handleAnswer = (index: number) => {
    if (showFeedback) return
    if (timerRef.current) clearInterval(timerRef.current)
    setSelectedAnswer(index)
    setShowFeedback(true)
    const question = questions[currentIndex]
    const isCorrect = index === question.correctIndex
    const earned = isCorrect ? Math.round(100 + (timeLeft / COUNTDOWN_SECONDS) * 50) : 0
    setScores((prev) => [...prev, earned])
  }

  const handleNext = () => {
    const isLast = currentIndex === questions.length - 1
    if (isLast) {
      navigate('/trivia/solo/results', {
        state: { questions, scores: [...scores], categoryId: state?.categoryId },
      })
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelectedAnswer(null)
    setShowFeedback(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-navy">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-amber animate-pulse mx-auto mb-3" />
          <p className="text-sm text-warmGray dark:text-gray-400">Loading questions…</p>
        </div>
      </div>
    )
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cream dark:bg-navy text-center">
        <p className="text-warmGray dark:text-gray-400 mb-6">{error ?? 'No questions available.'}</p>
        <button
          onClick={() => navigate('/trivia/solo')}
          className="px-6 py-3 bg-amber text-white rounded-xl font-semibold"
        >
          Back to Setup
        </button>
      </div>
    )
  }

  const question = questions[currentIndex]
  const dashOffset = ((COUNTDOWN_SECONDS - timeLeft) / COUNTDOWN_SECONDS) * CIRCUMFERENCE

  const getChoiceStyle = (index: number): string => {
    const base =
      'w-full text-left p-4 rounded-xl border-2 font-medium text-sm transition-all duration-200 '
    if (!showFeedback) {
      return base + 'bg-white dark:bg-navy-surface border-sand dark:border-white/10 text-gray-800 dark:text-gray-200 hover:border-amber/40 hover:bg-amber/5'
    }
    if (index === question.correctIndex) {
      return base + 'bg-emerald-100 border-emerald-500 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-500 dark:text-emerald-200'
    }
    if (index === selectedAnswer && selectedAnswer !== question.correctIndex) {
      return base + 'bg-red-100 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-500 dark:text-red-200'
    }
    return base + 'bg-white dark:bg-navy-surface border-sand dark:border-white/10 text-gray-400 dark:text-gray-500 opacity-60'
  }

  return (
    <div className="min-h-screen bg-cream dark:bg-navy px-4 pt-5 pb-10">
      <div className="max-w-md mx-auto">
        {/* Top row */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate('/trivia/solo')}
            aria-label="Back to Solo Setup"
            className="flex items-center gap-1 text-warmGray hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {questions.length}
          </span>
        </div>

        {/* Countdown ring */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="6" className="dark:stroke-white/10" />
              <motion.circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#E8A838"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={showFeedback ? dashOffset : 0}
                animate={{ strokeDashoffset: showFeedback ? dashOffset : dashOffset }}
                style={{ strokeDashoffset: dashOffset }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-2xl font-bold ${timeLeft <= 3 && !showFeedback ? 'text-red-500' : 'text-gray-800 dark:text-gray-200'}`}>
                {showFeedback ? '' : timeLeft}
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <h2 className="text-lg font-bold text-gray-900 dark:text-gray-50 leading-snug mb-6 text-center">
              {question.question}
            </h2>

            {/* Choices */}
            <div role="group" aria-label="Answer choices" className="space-y-3 mb-6">
              {question.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(i)}
                  disabled={showFeedback}
                  aria-pressed={selectedAnswer === i}
                  className={getChoiceStyle(i)}
                >
                  <span className="font-semibold text-xs opacity-60 mr-2">
                    {String.fromCharCode(65 + i)}.
                  </span>
                  {choice}
                </button>
              ))}
            </div>

            {/* Feedback */}
            <AnimatePresence>
              {showFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {/* Score earned */}
                  <div className="text-center">
                    {scores[scores.length - 1] > 0 ? (
                      <span className="text-2xl font-bold text-amber">
                        +{scores[scores.length - 1]}
                      </span>
                    ) : (
                      <span className="text-lg font-semibold text-red-500 dark:text-red-400">
                        {selectedAnswer === -1 ? 'Time up!' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="bg-white dark:bg-navy-surface rounded-xl p-4 border border-sand dark:border-white/10">
                    <p className="text-xs font-semibold text-amber mb-1 uppercase tracking-wide">Explanation</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>

                  {/* Next / Results button */}
                  <button
                    onClick={handleNext}
                    className="w-full py-4 bg-amber text-white rounded-2xl font-bold text-base hover:bg-amber-dark transition-colors shadow-md"
                  >
                    {currentIndex === questions.length - 1 ? 'See Results' : 'Next →'}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
