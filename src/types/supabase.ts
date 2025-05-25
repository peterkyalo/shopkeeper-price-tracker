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
      suppliers: {
        Row: {
          id: string
          created_at: string
          name: string
          contact: string | null
          phone: string | null
          address: string | null
          notes: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          contact?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          contact?: string | null
          phone?: string | null
          address?: string | null
          notes?: string | null
          user_id?: string
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          name: string
          category: string | null
          description: string | null
          sku: string | null
          unit: string | null
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          category?: string | null
          description?: string | null
          sku?: string | null
          unit?: string | null
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          category?: string | null
          description?: string | null
          sku?: string | null
          unit?: string | null
          user_id?: string
        }
      }
      prices: {
        Row: {
          id: string
          created_at: string
          price: number
          date: string
          notes: string | null
          product_id: string
          supplier_id: string
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          price: number
          date: string
          notes?: string | null
          product_id: string
          supplier_id: string
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          price?: number
          date?: string
          notes?: string | null
          product_id?: string
          supplier_id?: string
          user_id?: string
        }
      }
    }
  }
}

export type Supplier = Database['public']['Tables']['suppliers']['Row'];
export type Product = Database['public']['Tables']['products']['Row'];
export type Price = Database['public']['Tables']['prices']['Row'];