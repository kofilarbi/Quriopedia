import { supabase } from './supabase'

export interface TriviaQuestion {
  id: string
  categoryId: string
  question: string
  choices: string[]
  correctIndex: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

interface TriviaRow {
  id: string
  category_id: string
  question: string
  choices: string[]
  correct_index: number
  explanation: string
  difficulty: 'easy' | 'medium' | 'hard'
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export async function fetchTriviaQuestions(
  categoryId: string,
  count: number
): Promise<TriviaQuestion[]> {
  let query = supabase
    .from('trivia_questions')
    .select('id, category_id, question, choices, correct_index, explanation, difficulty')
    .limit(count * 2)

  if (categoryId !== 'mixed') {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  if (!data) return []

  const rows = data as unknown as TriviaRow[]
  const shuffled = shuffle(rows)
  return shuffled.slice(0, count).map((row) => ({
    id: row.id,
    categoryId: row.category_id,
    question: row.question,
    choices: row.choices,
    correctIndex: row.correct_index,
    explanation: row.explanation,
    difficulty: row.difficulty,
  }))
}
