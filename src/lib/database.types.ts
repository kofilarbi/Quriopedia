export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      categories: {
        Row: { id: string; name: string; emoji: string; color: string; bg_class: string; sort_order: number }
        Insert: { id: string; name: string; emoji: string; color: string; bg_class: string; sort_order?: number }
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
      }
      entries: {
        Row: { id: string; category_id: string; headline: string; body: string; read_more: string | null; type: 'fact' | 'vocab' | 'insight'; published_date: string; created_at: string }
        Insert: { id?: string; category_id: string; headline: string; body: string; read_more?: string | null; type: 'fact' | 'vocab' | 'insight'; published_date: string }
        Update: Partial<Database['public']['Tables']['entries']['Insert']>
      }
      user_profiles: {
        Row: { id: string; name: string; notifications_enabled: boolean; notification_time: string; dark_mode: boolean; streak_count: number; last_active_date: string | null; created_at: string; updated_at: string }
        Insert: { id: string; name?: string; notifications_enabled?: boolean; notification_time?: string; dark_mode?: boolean; streak_count?: number; last_active_date?: string | null }
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
    }
  }
}
