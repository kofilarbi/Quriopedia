export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; color: string; bg_class: string; sort_order: number }
        Insert: { id: string; name: string; color: string; bg_class: string; sort_order?: number }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      entries: {
        Row: { id: string; category_id: string; headline: string; body: string; read_more: string | null; type: 'fact' | 'vocab' | 'insight'; published_date: string; created_at: string; is_generated: boolean }
        Insert: { id?: string; category_id: string; headline: string; body: string; read_more?: string | null; type: 'fact' | 'vocab' | 'insight'; published_date: string; is_generated?: boolean }
        Update: Partial<Database['public']['Tables']['entries']['Insert']>
      }
      user_profiles: {
        Row: { id: string; name: string; notifications_enabled: boolean; notification_time: string; notification_timezone: string; dark_mode: boolean; streak_count: number; last_active_date: string | null; created_at: string; updated_at: string }
        Insert: { id: string; name?: string; notifications_enabled?: boolean; notification_time?: string; notification_timezone?: string; dark_mode?: boolean; streak_count?: number; last_active_date?: string | null }
        Update: Partial<Omit<Database['public']['Tables']['user_profiles']['Insert'], 'id'>>
      }
      user_categories: {
        Row: { user_id: string; category_id: string }
        Insert: { user_id: string; category_id: string }
        Update: never
      }
      bookmarks: {
        Row: { user_id: string; entry_id: string; created_at: string }
        Insert: { user_id: string; entry_id: string }
        Update: never
      }
      trivia_questions: {
        Row: {
          id: string
          category_id: string
          question: string
          choices: string[]
          correct_index: number
          explanation: string
          difficulty: 'easy' | 'medium' | 'hard'
          created_at: string
        }
        Insert: {
          id?: string
          category_id: string
          question: string
          choices: string[]
          correct_index: number
          explanation: string
          difficulty?: 'easy' | 'medium' | 'hard'
        }
        Update: Partial<Omit<Database['public']['Tables']['trivia_questions']['Insert'], 'id'>>
      }
      sessions: {
        Row: {
          id: string
          host_id: string
          category_id: string | null
          status: 'waiting' | 'active' | 'finished'
          round_count: number
          room_code: string
          is_private: boolean
          question_ids: string[]
          current_question_index: number
          question_started_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          host_id: string
          category_id?: string | null
          status?: string
          round_count?: number
          room_code?: string
          is_private?: boolean
          question_ids?: string[]
          current_question_index?: number
          question_started_at?: string | null
        }
        Update: {
          category_id?: string | null
          status?: string
          round_count?: number
          room_code?: string
          is_private?: boolean
          question_ids?: string[]
          current_question_index?: number
          question_started_at?: string | null
        }
      }
      session_players: {
        Row: {
          session_id: string
          user_id: string
          display_name: string
          is_ready: boolean
          joined_at: string
        }
        Insert: {
          session_id: string
          user_id: string
          display_name: string
          is_ready?: boolean
        }
        Update: {
          is_ready?: boolean
          display_name?: string
        }
      }
      session_answers: {
        Row: {
          session_id: string
          user_id: string
          question_index: number
          question_id: string | null
          answer_index: number | null
          is_correct: boolean
          response_time_ms: number | null
          score_earned: number
          created_at: string
        }
        Insert: {
          session_id: string
          user_id: string
          question_index: number
          question_id?: string | null
          answer_index?: number | null
          is_correct?: boolean
          response_time_ms?: number | null
          score_earned?: number
        }
        Update: {
          score_earned?: number
        }
      }
      match_results: {
        Row: {
          id: string
          session_id: string | null
          user_id: string
          final_rank: number
          final_score: number
          questions_correct: number
          questions_total: number
          category_id: string | null
          opponent_count: number
          created_at: string
        }
        Insert: {
          session_id?: string | null
          user_id: string
          final_rank: number
          final_score: number
          questions_correct: number
          questions_total: number
          category_id?: string | null
          opponent_count?: number
        }
        Update: {
          final_score?: number
        }
      }
      matchmaking_queue: {
        Row: {
          user_id: string
          category_id: string | null
          display_name: string
          joined_at: string
        }
        Insert: {
          user_id: string
          category_id?: string | null
          display_name: string
        }
        Update: {
          category_id?: string | null
          display_name?: string
        }
      }
      friends: {
        Row: { user_id: string; friend_id: string; created_at: string }
        Insert: { user_id: string; friend_id: string }
        Update: { created_at?: string }
      }
    }
  }
}
