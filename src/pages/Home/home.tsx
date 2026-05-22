import './home.css'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Input } from "@/components/ui/input"
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
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchPresets, categories, type Preset } from '@/lib/api'
import SplitText from '@/components/SplitText'
import FadeContent from '@/components/FadeContent'
import { formatDate } from '@/lib/utils'
import { useUserContext } from '@/context/UserContext'
import { supabase } from '@/lib/supabase'

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
  const [userFavorites, setUserFavorites] = useState<Set<string>>(new Set())
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15
  const navigate = useNavigate()
  const { user } = useUserContext()

  useEffect(() => {
    loadPresets()
  }, [])

  useEffect(() => {
    if (user) {
      fetchUserFavorites()
    } else {
      setUserFavorites(new Set())
    }
  }, [user])

  // reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, sortBy])

  // scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentPage])

  const fetchUserFavorites = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('favorites')
        .select('preset_id')
        .eq('user_id', user.id)
      
      if (error) throw error
      if (data) {
        setUserFavorites(new Set(data.map(fav => fav.preset_id)))
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    }
  }

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
    console.log('All letters have animated!')
  }

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

  const totalPages = Math.ceil(sortedPresets.length / itemsPerPage)
  const paginatedPresets = sortedPresets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handlePresetClick = (presetId: string) => {
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
          <div className="categories-scroll">
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
          </div>
        </aside>

        {/* presets grid */}
        <FadeContent blur={false} duration={1000} ease="power2.out" initialOpacity={0} className='presets-main'>
          <div className="presets-scroll">
            {isLoading ? (
              <div className="presets-grid">
                {Array.from({ length: itemsPerPage }).map((_, i) => (
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
              <>
                <div className="presets-grid">
                  {paginatedPresets.map((preset) => {
                    const category = categories.find(c => c.id === preset.category)
                    const CategoryIcon = category ? IconMap[category.icon || 'LayoutGrid'] : LayoutGrid
                    
                    return (
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
                            <div className="category-badge-pill">
                              {CategoryIcon && <CategoryIcon size={10} />}
                              <span>{category?.name}</span>
                            </div>
                            <h3 className="preset-name">{preset.name}</h3>
                            <p className="preset-description">{preset.description}</p>
                          </div>
                          <div className="preset-metadata">
                            <div className="flex items-center gap-2">
                              <span className="preset-author">{preset.author_name || 'Unknown'}</span>
                              <span className="metadata-dot">•</span>
                              <span className="preset-date">{formatDate(preset.created_at)}</span>
                            </div>
                            {userFavorites.has(preset.id) && (
                              <Heart size={12} className="favorite-indicator-icon" fill="currentColor" />
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* page stuff */}
                {totalPages > 1 && (
                  <div className="pagination-container">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="pagination-btn"
                    >
                      <ChevronLeft size={16} />
                      <span>previous</span>
                    </Button>
                    
                    <div className="pagination-info">
                      <span className="current-page">{currentPage}</span>
                      <span className="page-separator">/</span>
                      <span className="total-pages">{totalPages}</span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="pagination-btn"
                    >
                      <span>next</span>
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </FadeContent>
      </div>
    </div>
  )
}
