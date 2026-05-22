import { useState, useEffect } from 'react'
import { useUserContext } from '@/context/UserContext'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/lib/supabase'
import { categories } from '@/lib/api'
import { 
  Loader2, 
  Upload as UploadIcon,
  Type,
  MoveHorizontal,
  Shapes,
  Sparkles,
  Image,
  Code,
  Layers,
  Trash2,
  Pencil,
  FileCode,
  FileText
} from 'lucide-react'
import { toast } from 'sonner'
import SplitText from '@/components/SplitText'
import './Upload.css'

const categoryIcons: Record<string, React.ReactNode> = {
  textAnims: <Type className="size-4" />,
  transitions: <MoveHorizontal className="size-4" />,
  shapeAnims: <Shapes className="size-4" />,
  effects: <Sparkles className="size-4" />,
  backgrounds: <Image className="size-4" />,
  scripts: <Code className="size-4" />,
  compositions: <Layers className="size-4" />,
}

export default function Upload() {

  const { user } = useUserContext()
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [category, setCategory] = useState('')
  const [tags, setTags] = useState('')
  const [dependencies, setDependencies] = useState('')
  const [aeVersion, setAeVersion] = useState('')
  const [presetFile, setPresetFile] = useState<File | null>(null)
  const [gifFile, setGifFile] = useState<File | null>(null)
  const [gifPreviewUrl, setGifPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [gifDragOver, setGifDragOver] = useState(false)

  // Cleanup object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (gifPreviewUrl) {
        URL.revokeObjectURL(gifPreviewUrl)
      }
    }
  }, [gifPreviewUrl])

  const handleRemoveGif = (e: React.MouseEvent) => {
    e.stopPropagation()
    setGifFile(null)
    if (gifPreviewUrl) {
      URL.revokeObjectURL(gifPreviewUrl)
    }
    setGifPreviewUrl(null)
  }

  const handleRemovePreset = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPresetFile(null)
  }


    // always scroll to top when page renders
    useEffect(() => {
      window.scrollTo(0, 0)
    }, [])

 
if (!user) {
  return (
    <div className="upload-auth-gate">
      <p>you need to be signed in to upload presets.</p>
      <Button className="sign-in-button" onClick={() => navigate('/auth')}>sign in</Button>
    </div>
  )
}


  const detectCategory = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (ext === 'jsx') return 'scripts'
    return '' // others need manual selection
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handlePresetFileChange = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['ffx', 'jsx', 'aep'].includes(ext || '')) {
      toast.error('invalid file type! only .ffx, .jsx, and .aep files are allowed.')
      return
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('preset file too large! max size is 3MB.')
      return
    }

    setPresetFile(file)
    const detected = detectCategory(file)
    if (detected) setCategory(detected)
  }

  const handlePresetDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handlePresetFileChange(file)
  }

    const handleGifDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setGifDragOver(false)
      const file = e.dataTransfer.files[0]
      if (!file) return
      
      if (file.type !== 'image/gif') {
        toast.error('preview must be a GIF!')
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        toast.error('gif preview too large! max size is 2MB.')
        return
      }
      
      setGifFile(file)
      setGifPreviewUrl(URL.createObjectURL(file))
    }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!presetFile || !gifFile || !user) return
    setIsUploading(true)

    if(!category){
      toast.error('please select a category!')
      return
    }

    setIsUploading(true)  // only set loading after passes

    try {
      // upload preset file
      const presetPath = `${user.id}/${Date.now()}_${presetFile.name}`
      const { error: presetUploadError } = await supabase.storage
        .from('preset-files')
        .upload(presetPath, presetFile)
      if (presetUploadError) throw presetUploadError

      // get public url for preset file
      const { data: presetUrlData } = supabase.storage
        .from('preset-files')
        .getPublicUrl(presetPath)

      // upload gif
      const gifPath = `${user.id}/${Date.now()}_${gifFile.name}`
      const { error: gifUploadError } = await supabase.storage
        .from('preset-previews')
        .upload(gifPath, gifFile)
      if (gifUploadError) throw gifUploadError

      // get public url for gif
      const { data: gifUrlData } = supabase.storage
        .from('preset-previews')
        .getPublicUrl(gifPath)

      // insert preset into database
      const { error: dbError } = await supabase
        .from('presets')
        .insert({
          user_id: user.id,
          author_name: user.username,
          name,
          description,
          long_description: longDescription,
          category,
          file_name: presetFile.name,
          file_url: presetUrlData.publicUrl,
          preview_gif_url: gifUrlData.publicUrl,
          file_size: formatFileSize(presetFile.size),
          ae_version: aeVersion,
          tags: tags.split(',').map(t => t.trim()).filter(Boolean),
          dependencies: dependencies.split(',').map(d => d.trim()).filter(Boolean),
          is_approved: false,
          download_count: 0,
        })

      if (dbError) throw dbError

      toast.success('preset uploaded! it will be reviewed before going live.')
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'failed to upload preset')
    } finally {
      setIsUploading(false)
    }
  }



return (
    <div className="settings-wrapper">
      <div className="settings-header-section">
        <div className="settings-header-content">
          <SplitText
            text="upload a preset"
            className="settings-welcome-message"
            delay={20}
            duration={1.5}
            ease="elastic.out(1, 0.3)"
            splitType="chars"
            from={{ opacity: 0, y: 5 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="left"
          />
          <p className="settings-header-description">
            share your work with the community! presets are reviewed by me before appearing online, so don't try stupid stuff 😭
          </p>
        </div>
      </div>

      <form id="upload-form" onSubmit={handleSubmit} className="flex flex-col gap-6 w-full">
        
        {/* Files Section */}
        <div className="settings-info-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">files</h2>
          </div>
          <div className="settings-section-content space-y-4">
            
            {/* preset dropzone */}
            <div className="settings-field">
              <Label className="settings-field-label">preset file</Label>
              <div
                className={`upload-dropzone relative overflow-hidden ${dragOver ? 'dragover' : ''} ${presetFile ? 'has-file border-none p-0' : 'p-8'}`}
                onDrop={handlePresetDrop}
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onClick={() => document.getElementById('preset-file-input')?.click()}
              >
                <input
                  id="preset-file-input"
                  type="file"
                  accept=".ffx,.jsx,.aep"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handlePresetFileChange(e.target.files[0])}
                />
                {presetFile ? (
                  <div className="relative w-full h-[140px] group rounded-xl overflow-hidden border border-border bg-muted/20 shadow-inner flex items-center justify-center">
                    
                    {/* File Icon Representation */}
                    <div className="flex flex-col items-center gap-2 relative z-10 transition-transform duration-300 group-hover:scale-110">
                      {presetFile.name.toLowerCase().endsWith('.jsx') ? (
                        <FileCode className="size-10 text-primary/80" />
                      ) : (
                        <FileText className="size-10 text-primary/80" />
                      )}
                    </div>

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]">
                       <div className="bg-white/10 p-3 rounded-full mb-2 scale-90 group-hover:scale-100 transition-transform duration-300">
                         <Pencil className="text-white size-5" />
                       </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 shadow-lg hover:scale-105 active:scale-95"
                      onClick={handleRemovePreset}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* File Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2">
                        <UploadIcon className="text-white/70 size-4 flex-shrink-0" />
                        <p className="text-white font-medium text-sm truncate">{presetFile.name}</p>
                      </div>
                      <p className="text-white/60 text-xs mt-0.5 ml-6">{formatFileSize(presetFile.size)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="upload-dropzone-prompt">
                    <p>drag & drop your preset here</p>
                    <p className="upload-dropzone-sub">or click to browse — .ffx, .jsx, .aep (max 3MB)</p>
                  </div>
                )}
              </div>
            </div>

            {/* gif dropzone */}
            <div className="settings-field">
              <Label className="settings-field-label">preview gif</Label>
              <div
                className={`upload-dropzone relative overflow-hidden ${gifDragOver ? 'dragover' : ''} ${gifFile ? 'has-file border-none p-0' : 'p-8'}`}
                onDrop={handleGifDrop}
                onDragOver={(e) => { e.preventDefault(); setGifDragOver(true) }}
                onDragLeave={() => setGifDragOver(false)}
                onClick={() => document.getElementById('gif-file-input')?.click()}
              >
                <input
                  id="gif-file-input"
                  type="file"
                  accept="image/gif"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      if (file.size > 2 * 1024 * 1024) {
                        toast.error('gif preview too large! max size is 2MB.')
                        return
                      }
                      setGifFile(file)
                      setGifPreviewUrl(URL.createObjectURL(file))
                    }
                  }}
                />
                {gifPreviewUrl ? (
                  <div className="relative w-full aspect-video group rounded-xl overflow-hidden border border-border bg-muted/20 shadow-inner">
                    {/* Blurred background for transparency or odd sizes */}
                    <div 
                      className="absolute inset-0 opacity-20 blur-2xl scale-110"
                      style={{ backgroundImage: `url(${gifPreviewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                    />
                    
                    <img 
                      src={gifPreviewUrl} 
                      alt="GIF Preview" 
                      className="w-full h-full object-contain relative z-10"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]">
                       <div className="bg-white/10 p-3 rounded-full mb-2 scale-90 group-hover:scale-100 transition-transform duration-300">
                         <Pencil className="text-white size-6" />
                       </div>
                    </div>

                    {/* Delete Button */}
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 h-9 w-9 shadow-lg hover:scale-105 active:scale-95"
                      onClick={handleRemoveGif}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>

                    {/* File Info Overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-2">
                        <Image className="text-white/70 size-4 flex-shrink-0" />
                        <p className="text-white font-medium text-sm truncate">{gifFile?.name}</p>
                      </div>
                      <p className="text-white/60 text-xs mt-0.5 ml-6">{gifFile && formatFileSize(gifFile.size)}</p>
                    </div>
                  </div>
                ) : (
                  <div className="upload-dropzone-prompt">
                    <p>drag & drop preview gif here</p>
                    <p className="upload-dropzone-sub">or click to browse — .gif only (max 2MB)</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="settings-info-section">
          <div className="settings-section-header">
            <h2 className="settings-section-title">details</h2>
          </div>
          <div className="settings-section-content space-y-4">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="settings-field">
                <Label className="settings-field-label" htmlFor="name">preset name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="my cool preset" />
              </div>

              <div className="settings-field">
                <Label className="settings-field-label" htmlFor="category">category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category" className="w-full h-10">
                    <SelectValue placeholder="select a category" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {categories.filter(c => c.id !== 'all').map(c => (
                      <SelectItem key={c.id} value={c.id}>
                        <div className="flex items-center gap-2">
                          {categoryIcons[c.id]}
                          <span>{c.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {category && presetFile?.name.toLowerCase().endsWith('.jsx') && (
                  <p className="upload-auto-detected">
                    auto detected script!
                  </p>
                )}
              </div>
            </div>

            <div className="settings-field">
              <Label className="settings-field-label" htmlFor="description">short description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="a short one-liner" />
            </div>

            <div className="settings-field">
              <Label className="settings-field-label" htmlFor="longDescription">long description</Label>
              <Textarea
                id="longDescription"
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="detailed instructions, tips, how to use, etc."
                className="min-height-[120px]"
              />
            </div>

            <div className="settings-field">
              <Label className="settings-field-label" htmlFor="aeVersion">after effects version</Label>
              <Input id="aeVersion" value={aeVersion} onChange={(e) => setAeVersion(e.target.value)} placeholder="2023 or later" />
            </div>

            <div className="settings-field">
              <Label className="settings-field-label" htmlFor="tags">tags <span className="upload-hint">(comma separated)</span></Label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="animation, text, smooth" />
            </div>

            <div className="settings-field">
              <Label className="settings-field-label" htmlFor="dependencies">dependencies <span className="upload-hint">(comma separated, or "none")</span></Label>
              <Input id="dependencies" value={dependencies} onChange={(e) => setDependencies(e.target.value)} placeholder="none" />
            </div>

          </div>
        </div>

        <div className="settings-footer">
          <Button 
            type="submit" 
            disabled={isUploading || !presetFile || !gifFile || !category} 
            className="settings-save-button"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                uploading...
              </>
            ) : (
              <>
                <UploadIcon className="mr-2 h-5 w-5" />
                submit for review
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}