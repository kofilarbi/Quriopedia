import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '@/store/useAppStore'
import { supabase } from '@/lib/supabase'
import type { SupabaseClient } from '@supabase/supabase-js'
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as SupabaseClient<any>
import {
  fetchSession,
  fetchPlayers,
  fetchAllAnswers,
  submitAnswer,
  advanceQuestion,
  finishGame,
  subscribeToSession,
  subscribeToAnswers,
  type Session,
  type SessionPlayer,
  type SessionAnswer,
} from '@/lib/sessionService'
import type { TriviaQuestion } from '@/lib/triviaService'

const COUNTDOWN_SECONDS = 12
const CIRCUMFERENCE = 2 * Math.PI * 40

interface TriviaRow {
  id: string
  category_id: string
  question: string
  choices: string[]
  correct_index: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
  created_at: string
}

function mapRow(row: TriviaRow): TriviaQuestion {
  return {
    id: row.id,
    categoryId: row.category_id,
    question: row.question,
    choices: row.choices,
    correctIndex: row.correct_index,
    explanation: row.explanation,
    difficulty: row.difficulty,
  }
}

function computeScores(players: SessionPlayer[], answers: SessionAnswer[]): Record<string, number> {
  const scores: Record<string, number> = {}
  for (const p of players) scores[p.userId] = 0
  for (const a of answers) {
    if (a.userId in scores) scores[a.userId] += a.scoreEarned
    else scores[a.userId] = a.scoreEarned
  }
  return scores
}

export default function MultiGame() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { userId } = useAppStore()

  const [session, setSession] = useState<Session | null>(null)
  const [players, setPlayers] = useState<SessionPlayer[]>([])
  const [questions, setQuestions] = useState<TriviaQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(-1)
  const [questionStartedAt, setQuestionStartedAt] = useState<Date | null>(null)
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [answeredThisQuestion, setAnsweredThisQuestion] = useState(false)
  const [currentQAnswers, setCurrentQAnswers] = useState<SessionAnswer[]>([])
  const [allAnswers, setAllAnswers] = useState<SessionAnswer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [scoreEarnedThisQ, setScoreEarnedThisQ] = useState(0)
  const [advancing, setAdvancing] = useState(false)

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const timeoutSubmittedRef = useRef(false)
  const answersChannelRef = useRef<ReturnType<typeof subscribeToAnswers> | null>(null)

  const isHost = session?.hostId === userId
  const isLastQuestion = session ? currentIndex === session.questionIds.length - 1 : false

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const handleTimeout = useCallback(async () => {
    if (answeredThisQuestion || timeoutSubmittedRef.current) return
    timeoutSubmittedRef.current = true
    setAnsweredThisQuestion(true)
    setShowFeedback(true)
    setScoreEarnedThisQ(0)

    const q = questions[currentIndex]
    if (!sessionId || !userId || !q) return
    try {
      await submitAnswer({
        sessionId,
        userId,
        questionIndex: currentIndex,
        questionId: q.id,
        answerIndex: null,
        isCorrect: false,
        responseTimeMs: COUNTDOWN_SECONDS * 1000,
        scoreEarned: 0,
      })
    } catch (err) {
      console.error('[MultiGame] timeout submitAnswer error:', err)
    }
  }, [answeredThisQuestion, questions, currentIndex, sessionId, userId])

  // Start countdown from server timestamp
  const startCountdown = useCallback(
    (startedAt: Date) => {
      stopTimer()
      timeoutSubmittedRef.current = false

      const tick = () => {
        const elapsed = Date.now() - startedAt.getTime()
        const remaining = Math.max(0, COUNTDOWN_SECONDS * 1000 - elapsed)
        const secs = Math.ceil(remaining / 1000)
        setTimeLeft(secs)
        if (remaining <= 0) {
          stopTimer()
          void handleTimeout()
        }
      }
      tick()
      timerRef.current = setInterval(tick, 200)
    },
    [stopTimer, handleTimeout]
  )

  useEffect(() => {
    if (!sessionId) return

    const load = async () => {
      try {
        const [s, p, existingAnswers] = await Promise.all([
          fetchSession(sessionId),
          fetchPlayers(sessionId),
          fetchAllAnswers(sessionId),
        ])

        if (!s) {
          setError('Session not found.')
          setLoading(false)
          return
        }

        if (s.status === 'finished') {
          navigate(`/trivia/multi/results/${sessionId}`, { replace: true })
          return
        }

        setSession(s)
        setPlayers(p)
        setAllAnswers(existingAnswers)

        // Load questions by IDs in order
        if (s.questionIds.length > 0) {
          const { data, error: qError } = await db
            .from('trivia_questions')
            .select('*')
            .in('id', s.questionIds)

          if (qError) throw new Error(qError.message)
          if (data) {
            // Sort by question_ids order
            const ordered = s.questionIds
              .map((id) => (data as TriviaRow[]).find((r) => r.id === id))
              .filter((r): r is TriviaRow => !!r)
              .map(mapRow)
            setQuestions(ordered)
          }
        }

        const idx = s.currentQuestionIndex
        setCurrentIndex(idx)
        if (s.questionStartedAt) {
          const startedAt = new Date(s.questionStartedAt)
          setQuestionStartedAt(startedAt)

          // Check if already answered this question
          const myAnswer = existingAnswers.find(
            (a) => a.userId === userId && a.questionIndex === idx
          )
          if (myAnswer) {
            setAnsweredThisQuestion(true)
            setSelectedAnswer(myAnswer.answerIndex)
            setShowFeedback(true)
            setScoreEarnedThisQ(myAnswer.scoreEarned)
          }

          const currentQA = existingAnswers.filter((a) => a.questionIndex === idx)
          setCurrentQAnswers(currentQA)
        }

        setLoading(false)
      } catch (err) {
        console.error('[MultiGame] load error:', err)
        setError('Failed to load game.')
        setLoading(false)
      }
    }

    void load()
  }, [sessionId, userId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Start countdown when questionStartedAt changes and not showing feedback
  useEffect(() => {
    if (!questionStartedAt || showFeedback || answeredThisQuestion) return
    startCountdown(questionStartedAt)
    return () => stopTimer()
  }, [questionStartedAt, showFeedback, answeredThisQuestion, startCountdown, stopTimer])

  // Subscribe to session updates
  useEffect(() => {
    if (!sessionId) return

    const sessionChannel = subscribeToSession(sessionId, (updatedSession) => {
      setSession(updatedSession)

      if (updatedSession.status === 'finished') {
        stopTimer()
        navigate(`/trivia/multi/results/${sessionId}`, { replace: true })
        return
      }

      const newIdx = updatedSession.currentQuestionIndex
      if (newIdx !== currentIndex) {
        // Question advanced
        setCurrentIndex(newIdx)
        setSelectedAnswer(null)
        setShowFeedback(false)
        setAnsweredThisQuestion(false)
        setCurrentQAnswers([])
        setScoreEarnedThisQ(0)
        setAdvancing(false)
        if (updatedSession.questionStartedAt) {
          const startedAt = new Date(updatedSession.questionStartedAt)
          setQuestionStartedAt(startedAt)
        }
      }
    })

    return () => {
      void sessionChannel.unsubscribe()
    }
  }, [sessionId, currentIndex, navigate, stopTimer])

  // Subscribe to answers for current question
  useEffect(() => {
    if (!sessionId || currentIndex < 0) return

    if (answersChannelRef.current) {
      void answersChannelRef.current.unsubscribe()
    }

    answersChannelRef.current = subscribeToAnswers(sessionId, currentIndex, (answer) => {
      setCurrentQAnswers((prev) => {
        if (prev.some((a) => a.userId === answer.userId)) return prev
        return [...prev, answer]
      })
      setAllAnswers((prev) => {
        if (prev.some((a) => a.userId === answer.userId && a.questionIndex === answer.questionIndex))
          return prev
        return [...prev, answer]
      })
    })

    return () => {
      if (answersChannelRef.current) {
        void answersChannelRef.current.unsubscribe()
        answersChannelRef.current = null
      }
    }
  }, [sessionId, currentIndex])

  const handleAnswer = async (index: number) => {
    if (showFeedback || answeredThisQuestion) return
    stopTimer()

    const q = questions[currentIndex]
    if (!q || !sessionId || !userId || !questionStartedAt) return

    const isCorrect = index === q.correctIndex
    const elapsed = Date.now() - questionStartedAt.getTime()
    const responseTimeMs = Math.min(elapsed, COUNTDOWN_SECONDS * 1000)
    const earned = isCorrect ? Math.round(100 + ((COUNTDOWN_SECONDS * 1000 - responseTimeMs) / (COUNTDOWN_SECONDS * 1000)) * 50) : 0

    setSelectedAnswer(index)
    setShowFeedback(true)
    setAnsweredThisQuestion(true)
    setScoreEarnedThisQ(earned)

    try {
      await submitAnswer({
        sessionId,
        userId,
        questionIndex: currentIndex,
        questionId: q.id,
        answerIndex: index,
        isCorrect,
        responseTimeMs,
        scoreEarned: earned,
      })
    } catch (err) {
      console.error('[MultiGame] submitAnswer error:', err)
    }
  }

  const handleAdvance = async () => {
    if (!sessionId || !session || advancing) return
    setAdvancing(true)
    try {
      if (isLastQuestion) {
        await finishGame(sessionId)
        navigate(`/trivia/multi/results/${sessionId}`)
      } else {
        await advanceQuestion(sessionId, currentIndex + 1)
      }
    } catch (err) {
      console.error('[MultiGame] advanceQuestion error:', err)
      setAdvancing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream dark:bg-navy">
        <div className="w-12 h-12 rounded-xl bg-amber animate-pulse" />
      </div>
    )
  }

  if (error || !session || questions.length === 0 || currentIndex < 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-cream dark:bg-navy text-center">
        <p className="text-warmGray dark:text-gray-400 mb-6">{error ?? 'Game not available.'}</p>
        <button
          onClick={() => navigate('/trivia/multi')}
          className="px-6 py-3 bg-amber text-white rounded-xl font-semibold"
        >
          Back to Multiplayer
        </button>
      </div>
    )
  }

  const question = questions[currentIndex]
  if (!question) return null

  const dashOffset = ((COUNTDOWN_SECONDS - timeLeft) / COUNTDOWN_SECONDS) * CIRCUMFERENCE
  const scores = computeScores(players, allAnswers)

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
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
            {currentIndex + 1} / {questions.length}
          </span>
          {/* Player answered indicators */}
          <div className="flex items-center gap-1.5">
            {players.map((p) => {
              const hasAnswered = currentQAnswers.some((a) => a.userId === p.userId)
              return (
                <div
                  key={p.userId}
                  title={p.displayName}
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                    hasAnswered
                      ? 'bg-emerald-500 text-white'
                      : 'bg-sand dark:bg-white/10 text-warmGray dark:text-gray-400'
                  }`}
                >
                  {p.displayName.charAt(0).toUpperCase()}
                </div>
              )
            })}
          </div>
          <span className="text-xs text-warmGray dark:text-gray-400">
            {currentQAnswers.length}/{players.length} answered
          </span>
        </div>

        {/* Countdown ring */}
        <div className="flex justify-center mb-6">
          <div className="relative w-24 h-24">
            <svg width="96" height="96" viewBox="0 0 96 96" className="rotate-[-90deg]">
              <circle cx="48" cy="48" r="40" fill="none" stroke="#E5E7EB" strokeWidth="6" className="dark:stroke-white/10" />
              <circle
                cx="48"
                cy="48"
                r="40"
                fill="none"
                stroke="#E8A838"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
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

            <div role="group" aria-label="Answer choices" className="space-y-3 mb-6">
              {question.choices.map((choice, i) => (
                <button
                  key={i}
                  onClick={() => void handleAnswer(i)}
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
                    {scoreEarnedThisQ > 0 ? (
                      <span className="text-2xl font-bold text-amber">+{scoreEarnedThisQ}</span>
                    ) : (
                      <span className="text-lg font-semibold text-red-500 dark:text-red-400">
                        {selectedAnswer === null ? 'Time up!' : 'Incorrect'}
                      </span>
                    )}
                  </div>

                  {/* Explanation */}
                  <div className="bg-white dark:bg-navy-surface rounded-xl p-4 border border-sand dark:border-white/10">
                    <p className="text-xs font-semibold text-amber mb-1 uppercase tracking-wide">
                      Explanation
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {question.explanation}
                    </p>
                  </div>

                  {/* Live leaderboard snippet */}
                  <div className="bg-white dark:bg-navy-surface rounded-xl p-4 border border-sand dark:border-white/10">
                    <p className="text-xs font-semibold text-warmGray dark:text-gray-400 uppercase tracking-wide mb-2">
                      Scores
                    </p>
                    <div className="space-y-1">
                      {players
                        .slice()
                        .sort((a, b) => (scores[b.userId] ?? 0) - (scores[a.userId] ?? 0))
                        .map((p) => (
                          <div key={p.userId} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {currentQAnswers.some((a) => a.userId === p.userId) && (
                                <CheckCircle2 size={12} className="text-emerald-500" />
                              )}
                              <span className={`text-xs ${p.userId === userId ? 'font-bold text-amber' : 'text-gray-700 dark:text-gray-300'}`}>
                                {p.displayName}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                              {scores[p.userId] ?? 0}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  {/* Host: next button. Guest: waiting message */}
                  {isHost ? (
                    <button
                      onClick={() => void handleAdvance()}
                      disabled={advancing}
                      className="w-full py-4 bg-amber text-white rounded-2xl font-bold text-base hover:bg-amber-dark transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isLastQuestion ? 'See Results' : (
                        <>
                          Next Question
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-warmGray dark:text-gray-400">
                        Waiting for host to advance…
                      </p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Waiting for others message (answered but no feedback yet) */}
            {answeredThisQuestion && !showFeedback && (
              <div className="text-center py-4">
                <p className="text-sm text-warmGray dark:text-gray-400">
                  Waiting for others… ({currentQAnswers.length}/{players.length})
                </p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
