import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
console.log('creating supabase client')  // ← add this

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export type Preset = {
  id: string
  created_at: string
  user_id: string
  author_name: string
  name: string
  description: string
  long_description?: string
category: string
  file_name: string
  file_url: string
  preview_gif_url?: string
  file_size?: string
  ae_version?: string
  tags?: string[]
  dependencies?: string[]
  download_count: number
  view_count: number
  is_approved: boolean
  is_featured: boolean
}

export type Comment = {
  id: string
  created_at: string
  preset_id: string
  user_id: string
  author_name: string
  content: string
  profiles?: {
    avatar_url: string | null
  }
}
