import './home'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Search, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { fetchPresets, categories, type Preset } from '@/lib/api'

export default function Home() {
  const [presets, setPresets] = useState<Preset[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const navigate = useNavigate()

   useEffect(() => {
    loadPresets()
  }, [])

  const loadPresets = async () => {
    setIsLoading(true)
    try {
      const data = await fetchPresets()
      setPresets(data)
    } catch (error) {
      console.error('failed to load presets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const data = await fetchPresets()
      setPresets(data)
    } catch (error) {
      console.error('failed to refresh presets:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  const filteredPresets = presets.filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const handlePresetClick = (presetId: string) => {  // changed from number to string
    navigate(`/preset/${presetId}`)
  }



  return(

        <div className="home-page-wrapper">
      <div className="home-header">
        <h1 className="home-title">preset browser</h1>
        <div className="search-container">
          <Search className="search-icon" />
          <Input
            type="text"
            placeholder="search presets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      <div className="home-content-layout">
        <aside className="categories-sidebar">
          <h2 className="sidebar-title">categories</h2>
          <ScrollArea className="categories-scroll">
            <nav className="categories-nav">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                >
                  {category.name}
                </button>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        <main className="presets-main">
          <ScrollArea className="presets-scroll">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">loading presets...</p>
              </div>
            ) : filteredPresets.length === 0 ? (
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">no presets found</p>
              </div>
            ) : (
              <div className="presets-grid">
                {filteredPresets.map((preset) => (
                  <div 
                    key={preset.id} 
                    className="preset-card"
                    onClick={() => handlePresetClick(preset.id)}
                  >
                    <div className="preset-preview">
                      {preset.previewGif ? (
                        <img 
                          src={preset.previewGif} 
                          alt={preset.name}
                          loading="lazy"
                        />
                      ) : (
                        <div className="preview-placeholder">No Preview</div>
                      )}
                    </div>
                    <div className="preset-info">
                      <h3 className="preset-name">{preset.name}</h3>
                      <p className="preset-description">{preset.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </main>
      </div>
    </div>
  )
}