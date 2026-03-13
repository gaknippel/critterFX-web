import { useState, useEffect } from 'react'
import { fetchPresets, type Preset } from '../../lib/api'
import { Input } from '../../components/ui/input'
import { Search } from 'lucide-react'

export default function Home() {
  const [presets, setPresets] = useState<Preset[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = async () => {
    setIsLoading(true)
    const data = await fetchPresets()
    setPresets(data)
    setIsLoading(false)
  }

  const filteredPresets = presets.filter(preset =>
    preset.name.toLowerCase().includes(searchQuery.toLowerCase())
  )



  return (
     <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-4">critterFX Presets</h1>
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading presets...</p>
        </div>
      )}

      {/* Preset Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPresets.map((preset) => (
            <div key={preset.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              {/* Preview Image */}
              {preset.preview_gif_url && (
                <div className="aspect-video bg-muted">
                  <img 
                    src={preset.preview_gif_url} 
                    alt={preset.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              {/* Preset Info */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{preset.name}</h3>
                <p className="text-sm text-muted-foreground mb-2">{preset.description}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{preset.category}</span>
                  <span>{preset.download_count} downloads</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredPresets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No presets found</p>
        </div>
      )}
    </div>


  )
}