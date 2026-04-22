import { useState } from 'react'
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
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
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
  Layers
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
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [gifDragOver, setGifDragOver] = useState(false)


 
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
    if (ext === 'aep') return 'compositions'
    return '' // ffx needs manual selection
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
      
      setGifFile(file)
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
    <div className="upload-wrapper">
      <Card className="upload-card">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            <SplitText
              text="upload a preset"
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
          </CardTitle>
          <CardDescription>
            share your work with the community! presets are reviewed by me before appearing online, so don't try stupid stuff 😭
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form id="upload-form" onSubmit={handleSubmit} className="upload-form">
            
            {/* drag and drop zone */}
            <div
              className={`upload-dropzone ${dragOver ? 'dragover' : ''} ${presetFile ? 'has-file' : ''}`}
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
                <div className="upload-file-info">
                  <p className="upload-file-name">{presetFile.name}</p>
                  <p className="upload-file-size">{formatFileSize(presetFile.size)}</p>
                </div>
              ) : (
                <div className="upload-dropzone-prompt">
                  <p>drag & drop your preset here</p>
                  <p className="upload-dropzone-sub">or click to browse — .ffx, .jsx, .aep</p>
                </div>
              )}
            </div>

            {/* Grid for small fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* name */}
              <div className="upload-field">
                <Label htmlFor="name">preset name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="my cool preset" />
              </div>

              {/* category */}
              <div className="upload-field">
                <Label htmlFor="category">category</Label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger id="category" className="w-full category-select h-10">
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
                {category && (
                  <p className="upload-auto-detected">
                    auto-detected: <span className="font-semibold">{categories.find(c => c.id === category)?.name || category}</span>
                  </p>
                )}
              </div>
            </div>

            {/* short description */}
            <div className="upload-field">
              <Label htmlFor="description">short description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} required placeholder="a short one-liner" />
            </div>

            {/* long description */}
            <div className="upload-field">
              <Label htmlFor="longDescription">long description</Label>
              <Textarea
                id="longDescription"
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                placeholder="detailed instructions, tips, how to use, etc."
                className="min-height-[120px]"
              />
            </div>

            {/* ae version */}
            <div className="upload-field">
              <Label htmlFor="aeVersion">after effects version</Label>
              <Input id="aeVersion" value={aeVersion} onChange={(e) => setAeVersion(e.target.value)} placeholder="2023 or later" />
            </div>

            {/* tags */}
            <div className="upload-field">
              <Label htmlFor="tags">tags <span className="upload-hint">(comma separated)</span></Label>
              <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="animation, text, smooth" />
            </div>

            {/* dependencies */}
            <div className="upload-field">
              <Label htmlFor="dependencies">dependencies <span className="upload-hint">(comma separated, or "none")</span></Label>
              <Input id="dependencies" value={dependencies} onChange={(e) => setDependencies(e.target.value)} placeholder="none" />
            </div>

            {/* gif upload dropzone */}
            <div className="upload-field">
              <Label htmlFor="gif">preview gif</Label>
              <div
                className={`upload-dropzone ${gifDragOver ? 'dragover' : ''} ${gifFile ? 'has-file' : ''}`}
                onDrop={handleGifDrop}
                onDragOver={(e) => { e.preventDefault(); setGifDragOver(true) }}
                onDragLeave={() => setGifDragOver(false)}
                onClick={() => document.getElementById('gif-file-input')?.click()}
                style={{ padding: '2rem' }}
              >
                <input
                  id="gif-file-input"
                  type="file"
                  accept="image/gif"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && setGifFile(e.target.files[0])}
                />
                {gifFile ? (
                  <div className="upload-file-info">
                    <p className="upload-file-name">{gifFile.name}</p>
                    <p className="upload-file-size">{formatFileSize(gifFile.size)}</p>
                  </div>
                ) : (
                  <div className="upload-dropzone-prompt">
                    <p>drag & drop preview gif here</p>
                    <p className="upload-dropzone-sub">or click to browse — .gif only</p>
                  </div>
                )}
              </div>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button 
            form="upload-form"
            type="submit" 
            disabled={isUploading || !presetFile || !gifFile || !category} 
            className="w-full upload-submit-btn"
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
        </CardFooter>
      </Card>
    </div>
  )
}