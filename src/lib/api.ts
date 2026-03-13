import { supabase } from "./supabase";

export interface Preset {
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


export async function fetchPresets(): Promise<Preset[]> {
    const {data, error} = await supabase
    .from('presets')
    .select('*')
    .eq('is_approved', true)  // only show approved presets
    .order('created_at', { ascending: false })  // newest 

  if (error) {
    console.error('error fetching presets:', error)
    return []
  }

  return data || []
}