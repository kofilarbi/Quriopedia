import { supabase } from './supabase'
import type { RealtimeChannel, SupabaseClient } from '@supabase/supabase-js'

// Cast to untyped client to avoid Database generic resolution issues for new tables
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as unknown as SupabaseClient<any>

export interface Session {
  id: string
  hostId: string
  categoryId: string | null
  status: 'waiting' | 'active' | 'finished'
  roundCount: number
  roomCode: string
  isPrivate: boolean
  questionIds: string[]
  currentQuestionIndex: number
  questionStartedAt: string | null
  createdAt: string
}

export interface SessionPlayer {
  sessionId: string
  userId: string
  displayName: string
  isReady: boolean
  joinedAt: string
}

export interface SessionAnswer {
  sessionId: string
  userId: string
  questionIndex: number
  questionId: string | null
  answerIndex: number | null
  isCorrect: boolean
  responseTimeMs: number | null
  scoreEarned: number
  createdAt: string
}

function mapSession(row: {
  id: string
  host_id: string
  category_id: string | null
  status: string
  round_count: number
  room_code: string
  is_private: boolean
  question_ids: string[]
  current_question_index: number
  question_started_at: string | null
  created_at: string
}): Session {
  return {
    id: row.id,
    hostId: row.host_id,
    categoryId: row.category_id,
    status: row.status as 'waiting' | 'active' | 'finished',
    roundCount: row.round_count,
    roomCode: row.room_code,
    isPrivate: row.is_private,
    questionIds: row.question_ids,
    currentQuestionIndex: row.current_question_index,
    questionStartedAt: row.question_started_at,
    createdAt: row.created_at,
  }
}

function mapPlayer(row: {
  session_id: string
  user_id: string
  display_name: string
  is_ready: boolean
  joined_at: string
}): SessionPlayer {
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    displayName: row.display_name,
    isReady: row.is_ready,
    joinedAt: row.joined_at,
  }
}

function mapAnswer(row: {
  session_id: string
  user_id: string
  question_index: number
  question_id: string | null
  answer_index: number | null
  is_correct: boolean
  response_time_ms: number | null
  score_earned: number
  created_at: string
}): SessionAnswer {
  return {
    sessionId: row.session_id,
    userId: row.user_id,
    questionIndex: row.question_index,
    questionId: row.question_id,
    answerIndex: row.answer_index,
    isCorrect: row.is_correct,
    responseTimeMs: row.response_time_ms,
    scoreEarned: row.score_earned,
    createdAt: row.created_at,
  }
}

function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let code = ''
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)]
  }
  return code
}

export async function createSession(hostId: string, displayName: string): Promise<Session> {
  const roomCode = generateRoomCode()

  const { data: sessionData, error: sessionError } = await db
    .from('sessions')
    .insert({ host_id: hostId, room_code: roomCode })
    .select()
    .single()

  if (sessionError) throw new Error(sessionError.message)
  if (!sessionData) throw new Error('Failed to create session')

  const { error: playerError } = await db.from('session_players').insert({
    session_id: sessionData.id,
    user_id: hostId,
    display_name: displayName,
    is_ready: true,
  })

  if (playerError) throw new Error(playerError.message)

  return mapSession(sessionData as Parameters<typeof mapSession>[0])
}

export async function fetchSessionByCode(roomCode: string): Promise<Session | null> {
  const { data, error } = await db
    .from('sessions')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  if (!data) return null

  return mapSession(data as Parameters<typeof mapSession>[0])
}

export async function fetchSession(sessionId: string): Promise<Session | null> {
  const { data, error } = await db
    .from('sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  if (!data) return null

  return mapSession(data as Parameters<typeof mapSession>[0])
}

export async function joinSession(
  sessionId: string,
  userId: string,
  displayName: string
): Promise<void> {
  const { error } = await db.from('session_players').insert({
    session_id: sessionId,
    user_id: userId,
    display_name: displayName,
    is_ready: false,
  })

  if (error) throw new Error(error.message)
}

export async function leaveSession(sessionId: string, userId: string): Promise<void> {
  const { error } = await db
    .from('session_players')
    .delete()
    .eq('session_id', sessionId)
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
}

export async function updateSessionSettings(
  sessionId: string,
  categoryId: string,
  roundCount: number
): Promise<void> {
  const { error } = await db
    .from('sessions')
    .update({ category_id: categoryId, round_count: roundCount })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function startGame(sessionId: string, questionIds: string[]): Promise<void> {
  const { error } = await db
    .from('sessions')
    .update({
      question_ids: questionIds,
      status: 'active',
      current_question_index: 0,
      question_started_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function advanceQuestion(sessionId: string, nextIndex: number): Promise<void> {
  const { error } = await db
    .from('sessions')
    .update({
      current_question_index: nextIndex,
      question_started_at: new Date().toISOString(),
    })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function finishGame(sessionId: string): Promise<void> {
  const { error } = await db
    .from('sessions')
    .update({ status: 'finished' })
    .eq('id', sessionId)

  if (error) throw new Error(error.message)
}

export async function fetchPlayers(sessionId: string): Promise<SessionPlayer[]> {
  const { data, error } = await db
    .from('session_players')
    .select('*')
    .eq('session_id', sessionId)
    .order('joined_at', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return (data as Parameters<typeof mapPlayer>[0][]).map(mapPlayer)
}

export async function submitAnswer(params: {
  sessionId: string
  userId: string
  questionIndex: number
  questionId: string
  answerIndex: number | null
  isCorrect: boolean
  responseTimeMs: number
  scoreEarned: number
}): Promise<void> {
  const { error } = await db.from('session_answers').insert({
    session_id: params.sessionId,
    user_id: params.userId,
    question_index: params.questionIndex,
    question_id: params.questionId,
    answer_index: params.answerIndex,
    is_correct: params.isCorrect,
    response_time_ms: params.responseTimeMs,
    score_earned: params.scoreEarned,
  })

  if (error) throw new Error(error.message)
}

export async function fetchAllAnswers(sessionId: string): Promise<SessionAnswer[]> {
  const { data, error } = await db
    .from('session_answers')
    .select('*')
    .eq('session_id', sessionId)
    .order('question_index', { ascending: true })

  if (error) throw new Error(error.message)
  if (!data) return []

  return (data as Parameters<typeof mapAnswer>[0][]).map(mapAnswer)
}

export async function saveMatchResult(params: {
  sessionId: string
  userId: string
  finalRank: number
  finalScore: number
  questionsCorrect: number
  questionsTotal: number
  categoryId: string | null
  opponentCount: number
}): Promise<void> {
  const { error } = await db.from('match_results').insert({
    session_id: params.sessionId,
    user_id: params.userId,
    final_rank: params.finalRank,
    final_score: params.finalScore,
    questions_correct: params.questionsCorrect,
    questions_total: params.questionsTotal,
    category_id: params.categoryId,
    opponent_count: params.opponentCount,
  })

  if (error) throw new Error(error.message)
}

export async function fetchMatchHistory(userId: string): Promise<
  Array<{
    id: string
    sessionId: string | null
    finalRank: number
    finalScore: number
    questionsCorrect: number
    questionsTotal: number
    categoryId: string | null
    opponentCount: number
    createdAt: string
  }>
> {
  const { data, error } = await db
    .from('match_results')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) throw new Error(error.message)
  if (!data) return []

  return data.map((row) => ({
    id: row.id,
    sessionId: row.session_id,
    finalRank: row.final_rank,
    finalScore: row.final_score,
    questionsCorrect: row.questions_correct,
    questionsTotal: row.questions_total,
    categoryId: row.category_id,
    opponentCount: row.opponent_count,
    createdAt: row.created_at,
  }))
}

export function subscribeToSession(
  sessionId: string,
  onUpdate: (session: Session) => void
): RealtimeChannel {
  const channel = db
    .channel('session-' + sessionId)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sessions',
        filter: 'id=eq.' + sessionId,
      },
      (payload) => {
        const row = payload.new as Parameters<typeof mapSession>[0]
        onUpdate(mapSession(row))
      }
    )
    .subscribe()

  return channel
}

export function subscribeToPlayers(
  sessionId: string,
  onUpdate: (players: SessionPlayer[]) => void
): RealtimeChannel {
  const channel = db
    .channel('players-' + sessionId)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'session_players',
        filter: 'session_id=eq.' + sessionId,
      },
      () => {
        fetchPlayers(sessionId)
          .then(onUpdate)
          .catch((err) => console.error('[subscribeToPlayers] refetch error:', err))
      }
    )
    .subscribe()

  return channel
}

export function subscribeToAnswers(
  sessionId: string,
  questionIndex: number,
  onInsert: (answer: SessionAnswer) => void
): RealtimeChannel {
  const channel = db
    .channel('answers-' + sessionId + '-' + questionIndex)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'session_answers',
        filter: 'session_id=eq.' + sessionId,
      },
      (payload) => {
        const row = payload.new as Parameters<typeof mapAnswer>[0]
        if (row.question_index === questionIndex) {
          onInsert(mapAnswer(row))
        }
      }
    )
    .subscribe()

  return channel
}
