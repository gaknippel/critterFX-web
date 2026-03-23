import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Info, Package, FileCode } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import './PresetDetail.css'
import { fetchPresets, categories, type Preset } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import SplitText from '@/components/SplitText'
import { Skeleton } from '@/components/ui/skeleton'

export default function PresetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [preset, setPreset] = useState<Preset | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // load preset data
  useEffect(() => {
    loadPreset()
  }, [id])

  const loadPreset = async () => {
    setIsLoading(true)
    const presets = await fetchPresets()
    const found = presets.find(p => p.id === id)
    setPreset(found || null)
    setIsLoading(false  )
    window.scrollTo(0, 0)
  }
  
    if (isLoading) {
    return (
      <div className="preset-detail-wrapper">
        <div className="preset-detail-header">
          <Skeleton className="h-9 w-32" />
        </div>
        <div className="preset-detail-content">
          <div className="preset-preview-section">
            <Skeleton className="w-full aspect-video rounded-xl" />
            <Skeleton className="h-12 w-full" />
          </div>
          <div className="preset-details-section">
            <Skeleton className="h-10 w-3/4" />
            <Skeleton className="h-5 w-1/4" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )
  }

 if (!preset) {
    return (
      <div className="preset-detail-wrapper">
        <div className="preset-not-found">
          <h1>Preset not found</h1>
          <Button onClick={() => navigate('/')}>
            <ArrowLeft className="mr-2" />
            back to browser
          </Button>
        </div>
      </div>
    )
  }

  const handleAnimationComplete = () => {
    console.log('All letters have animated!')
  }

  const categoryName = categories.find(cat => cat.id === preset.category)?.name || preset.category

  return (
    <div className="preset-detail-wrapper">
      <div className="preset-detail-header">
        <Button variant="ghost" onClick={() => navigate('/')} className="back-button">
          <ArrowLeft className="mr-2" size={20} />
          back to browser
        </Button>
      </div>

      <div className="preset-detail-content">
        <div className="preset-preview-section">
          <div className="preset-preview-large">
            <img src={preset.previewGif} alt={preset.name} />
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="download-button" size="lg">
                <Download className="mr-2" />
                install to AE
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>get critterFX desktop!</DialogTitle>
                <DialogDescription>
                  install presets directly into after effects with one click. :D
                </DialogDescription>
              </DialogHeader>
              <div className="bg-muted p-4 rounded-lg flex items-center justify-between gap-4">
                <p className="text-sm text-muted-foreground">
                  download the critterFX desktop app to install presets.
                </p>
                <Button asChild size="sm">
                  <a href="https://github.com/gaknippel/critterFX/releases" target="_blank" rel="noopener noreferrer">
                    download app
                  </a>
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {preset.file_name.endsWith('.aep') && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full mt-4">
                  <Info className="mr-2 h-5 w-5" />
                  how to install!!! (IMPORTANT)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>how to import compositions</DialogTitle>
                  <DialogDescription>
                    this is a composition preset, so you have to import it manually through AE.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="rounded-lg overflow-hidden border">
                    <img src="/howtoinstallcomps.gif" alt="import tutorial animation" className="w-full" />
                  </div>
                  <ol className="space-y-2 list-decimal list-inside">
                    <li className="text-sm">open AE</li>
                    <li className="text-sm">go to <strong>file → import → file</strong> (or press <kbd className="px-2 py-1 bg-muted rounded text-xs">Ctrl+I</kbd>)</li>
                    <li className="text-sm">go to: <code className="px-2 py-1 bg-muted rounded text-xs">Documents\critterFX\Compositions</code></li>
                    <li className="text-sm">select <strong>{preset.file_name}</strong></li>
                    <li className="text-sm">click "import" and use it in the project panel</li>
                  </ol>
                  <div className="bg-muted p-3 rounded-lg">
                    <p className="text-sm text-muted-foreground">
                      💡 <strong>tip:</strong> you can also drag and drop the .aep file directly into the AE project panel.
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="preset-details-section">
          <div className="preset-header-info">
            <h1>
              <SplitText
                text={preset.name}
                className="preset-detail-title"
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
            </h1>
            <p className="preset-detail-category">{categoryName}</p>
          </div>

          <div className="preset-tags">
            {preset.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary" className="preset-tag">{tag}</Badge>
            ))}
          </div>

          <div className="detail-section">
            <div className="section-header">
              <Info size={20} />
              <h2>description</h2>
            </div>
            <p className="detail-text">{preset.long_description || preset.description}</p>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <FileCode size={20} />
              <h2>technical info</h2>
            </div>
            <div className="tech-info-grid">
              <div className="tech-info-item">
                <span className="tech-label">after effects version:</span>
                <span className="tech-value">{preset.ae_version || 'N/A'}</span>
              </div>
              <div className="tech-info-item">
                <span className="tech-label">file size:</span>
                <span className="tech-value">{preset.file_size || 'N/A'}</span>
              </div>
              <div className="tech-info-item">
                <span className="tech-label">author:</span>
                <span className="tech-value">{preset.author_name || 'Unknown'}</span>
              </div>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <Package size={20} />
              <h2>dependencies</h2>
            </div>
            <ul className="dependencies-list">
              {preset.dependencies?.map((dep, index) => (
                <li key={index}>{dep}</li>
              )) || <li>no dependencies</li>}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}