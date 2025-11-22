export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      students: {
        Row: {
          id: string
          name: string
          class: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          class: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          class?: string
          created_at?: string
        }
      }
      class_settings: {
        Row: {
          id: string
          class: string
          weekly_amount: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          class: string
          weekly_amount?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          class?: string
          weekly_amount?: number
          created_at?: string
          updated_at?: string
        }
      }
      periods: {
        Row: {
          id: string
          class: string
          month: number
          year: number
          created_at: string
        }
        Insert: {
          id?: string
          class: string
          month: number
          year: number
          created_at?: string
        }
        Update: {
          id?: string
          class?: string
          month?: number
          year?: number
          created_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          period_id: string
          student_id: string
          week: number
          paid: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          period_id: string
          student_id: string
          week: number
          paid?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          period_id?: string
          student_id?: string
          week?: number
          paid?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          period_id: string
          date: string
          description: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          period_id: string
          date?: string
          description: string
          amount: number
          created_at?: string
        }
        Update: {
          id?: string
          period_id?: string
          date?: string
          description?: string
          amount?: number
          created_at?: string
        }
      }
    }
  }
}
