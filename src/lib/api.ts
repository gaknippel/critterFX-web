import { supabase } from "@/lib/supabase"

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


  previewGif?: string  // alias for preview_gif_url
  fileName?: string    // alias for file_name
  aeVersion?: string   // alias for ae_version
}

export const categories = [
  { id: 'all', name: 'all presets', icon: 'LayoutGrid' },
  { id: 'textAnims', name: 'text animations', icon: 'Type' },
  { id: 'transitions', name: 'transitions', icon: 'MoveHorizontal' },
  { id: 'shapeAnims', name: 'shape animations', icon: 'Shapes' },
  { id: 'effects', name: 'effects', icon: 'Sparkles' },
  { id: 'backgrounds', name: 'backgrounds', icon: 'Image' },
  { id: 'scripts', name: 'scripts', icon: 'Code' },
  { id: 'compositions', name: 'compositions', icon: 'Layers' },
]

export async function fetchPresets(): Promise<Preset[]> {
   console.log('fetchPresets called')
    const {data, error} = await supabase
    .from('presets')
    .select('*')
    .eq('is_approved', true)  // only show approved presets
    .order('created_at', { ascending: false })  // newest 

  console.log('fetchPresets result:', data, error)  // ← add this


  if (error) {
    console.error('error fetching presets:', error)
    return []
  }

   return (data || []).map(preset => ({
    ...preset,
    previewGif: preset.preview_gif_url,  // add alias
    fileName: preset.file_name,           // add alias
    aeVersion: preset.ae_version,         // add alias
  }))
}