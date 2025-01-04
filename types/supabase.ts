export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          created_at: string
          name?: string | null
          avatar_url?: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          name?: string | null
          avatar_url?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          name?: string | null
          avatar_url?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          amount: number
          type: 'income' | 'expense'
          category: string
          description: string
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          amount: number
          type: 'income' | 'expense'
          category: string
          description: string
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          amount?: number
          type?: 'income' | 'expense'
          category?: string
          description?: string
          date?: string
          created_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          title: string
          target_amount: number
          current_amount: number
          category: string
          deadline: string | null
          status: 'in_progress' | 'completed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          target_amount: number
          current_amount?: number
          category: string
          deadline?: string | null
          status?: 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          target_amount?: number
          current_amount?: number
          category?: string
          deadline?: string | null
          status?: 'in_progress' | 'completed' | 'cancelled'
          created_at?: string
        }
      }
    }
  }
} 