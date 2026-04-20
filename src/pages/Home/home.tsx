import './home.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  Search, 
  RefreshCw, 
  Type, 
  MoveHorizontal, 
  Shapes, 
  Sparkles, 
  Image, 
  Code, 
  Layers, 
  LayoutGrid,
  Download,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchPresets, categories, type Preset } from '@/lib/api'
import SplitText from '@/components/SplitText'
import FadeContent from '@/components/FadeContent'
import { formatDate } from '@/lib/utils'

const IconMap: Record<string, any> = {
  LayoutGrid,
  Type,
  MoveHorizontal,
  Shapes,
  Sparkles,
  Image,
  Code,
  Layers,
}

export default function Home() {
  const [presets, setPresets] = useState<Preset[]>([])
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [sortBy, setSortBy] = useState('newest')
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
  
  const handleAnimationComplete = () => {
  console.log('All letters have animated!');
};

  const filteredPresets = presets.filter(preset => {
    const matchesCategory = selectedCategory === 'all' || preset.category === selectedCategory
    const matchesSearch = preset.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

    const sortedPresets = [...filteredPresets].sort((a,b) => {
  switch (sortBy){
    case 'most_downloads':
      return b.download_count - a.download_count
    case 'newest':
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    case 'oldest':
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    case 'az':
      return a.name.localeCompare(b.name)
    default:
      return 0
  }
})

  const handlePresetClick = (presetId: string) => {  // changed from number to string
    navigate(`/preset/${presetId}`)
  }



  return(

    <div className="home-page-wrapper">
      <div className="home-header">
        <div className="title-container">
          <SplitText
            text="preset browser"
            className="home-title"
            delay={20}
            duration={1.5}
            ease="elastic.out(1, 0.3)"
            splitType="chars"
            from={{ opacity: 0, y: 5 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
            onLetterAnimationComplete={handleAnimationComplete}
          />
        </div>
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
            type="button"
            variant="ghost" 
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="refresh-button"
            aria-label={isRefreshing ? 'refreshing presets' : 'refresh presets'}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="sort-select">
              <ArrowUpDown size={14} className="mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectItem value="newest">newest</SelectItem>
              <SelectItem value="oldest">oldest</SelectItem>
              <SelectItem value="most_downloads">most downloads</SelectItem>
              <SelectItem value="az">a-z</SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>

      <div className="home-content-layout">
        {/* categories sidebar */}
        <aside className="categories-sidebar">
          <ScrollArea className="categories-scroll">
            <h2 className="sidebar-title">categories</h2>
            <nav className="categories-nav">
              {categories.map((category) => {
                const Icon = IconMap[category.icon || 'LayoutGrid']
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
                  >
                    <Icon className="category-icon" />
                    <span className="category-name">{category.name}</span>
                  </button>
                )
              })}
            </nav>
          </ScrollArea>
        </aside>

        {/* presets grid */}
        <FadeContent blur={false} duration={1000} ease="power2.out" initialOpacity={0} className='presets-main'>
          <main className="presets-main">
            <ScrollArea className="presets-scroll">
              {isLoading ? (
                    <div className="presets-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="preset-card">
                  <Skeleton className="w-full aspect-video" />
                  <div className="preset-info">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                </div>
              ))}
             </div>
              ) : (
                <div className="presets-grid">
                  {sortedPresets.map((preset) => (
                    <div 
                      key={preset.id} 
                      className="preset-card"
                      onClick={() => handlePresetClick(preset.id)}
                    >
                      <div className="preset-preview">
                        <img 
                          src={preset.previewGif} 
                          alt={preset.name}
                          loading="lazy"
                        />
                        <div className="preset-download-badge">
                          <Download size={12} />
                          <span>{preset.download_count}</span>
                        </div>
                      </div>
                      <div className="preset-info">
                        <div className="preset-details">
                          <h3 className="preset-name">{preset.name}</h3>
                          <p className="preset-author">by {preset.author_name || 'Unknown'}</p>
                          <p className="preset-description">{preset.description}</p>
                        </div>
                        <p className="preset-date">{formatDate(preset.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </main>
        </FadeContent>
      </div>
    </div>
  )
}
