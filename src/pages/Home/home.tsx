import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

type Preset = {
  id: string
  name: string
  description: string
  category: string
  preview_gif_url: string | null
  author_name: string
  download_count: number
  tags: string[]
}

export default function Home() {
  const [presets, setPresets] = useState<Preset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = async () => {
    setIsLoading(true)
    
    // Fetch approved presets from Supabase
    const { data, error } = await supabase
      .from('presets')
      .select('*')
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading presets:', error)
    } else {
      setPresets(data || [])
    }
    
    setIsLoading(false)
  }

  const filteredPresets = presets.filter(preset => {
    if (selectedCategory === 'all') return true
    return preset.category === selectedCategory
  })

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Community Presets</h1>
      
      {isLoading ? (
        <p>Loading presets...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map(preset => (
            <div key={preset.id} className="border rounded-lg p-4">
              {preset.preview_gif_url && (
                <img 
                  src={preset.preview_gif_url} 
                  alt={preset.name}
                  className="w-full aspect-video object-cover rounded mb-4"
                />
              )}
              <h3 className="font-semibold text-lg">{preset.name}</h3>
              <p className="text-sm text-muted-foreground mb-2">{preset.description}</p>
              <p className="text-xs text-muted-foreground">by {preset.author_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}