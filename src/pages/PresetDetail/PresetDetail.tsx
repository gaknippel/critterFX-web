import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { 
  ArrowLeft, 
  Check, 
  Download, 
  FileCode, 
  Info, 
  Loader2, 
  MessageSquare, 
  Package, 
  Pencil, 
  Send, 
  Trash2, 
  X, 
  User,
  Type,
  MoveHorizontal,
  Shapes,
  Sparkles,
  Image,
  Code,
  Layers
} from 'lucide-react'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import './PresetDetail.css'
import { fetchPresets, categories, type Preset } from '@/lib/api'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog"
import SplitText from '@/components/SplitText'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase, Comment } from '@/lib/supabase'
import { toast } from 'sonner'
import { useUserContext } from '@/context/UserContext'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card'
import FadeContent from '@/components/FadeContent'
import { formatBytes } from '@/lib/utils'


export default function PresetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [preset, setPreset] = useState<Preset | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingCommentText, setEditingCommentText] = useState('')

  //states for editing presets
  const [editPresetOpen, setEditPresetOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editLongDescription, setEditLongDescription] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editDependencies, setEditDependencies] = useState('')
  const [editAeVersion, setEditAeVersion] = useState('')
  const [editPresetFile, setEditPresetFile] = useState<File | null>(null)
  const [editGifFile, setEditGifFile] = useState<File | null>(null)
  const [isSavingPreset, setIsSavingPreset] = useState(false)
  const [deletePresetOpen, setDeletePresetOpen] = useState(false)
  const [isDeletingPreset, setIsDeletingPreset] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [gifDragOver, setGifDragOver] = useState(false)

  const categoryIcons: Record<string, React.ReactNode> = {
  textAnims: <Type className="size-4" />,
  transitions: <MoveHorizontal className="size-4" />,
  shapeAnims: <Shapes className="size-4" />,
  effects: <Sparkles className="size-4" />,
  backgrounds: <Image className="size-4" />,
  scripts: <Code className="size-4" />,
  compositions: <Layers className="size-4" />,
}

    useEffect(() => {
  if (editPresetOpen && preset) {
    setEditName(preset.name)
    setEditDescription(preset.description)
    setEditLongDescription(preset.long_description || '')
    setEditCategory(preset.category)
    setEditTags(preset.tags?.join(', ') || '')
    setEditDependencies(preset.dependencies?.join(', ') || '')
    setEditAeVersion(preset.ae_version || '')
    setEditPresetFile(null)
    setEditGifFile(null)
  }
}, [editPresetOpen])

  const { user } = useUserContext()

  const handlePresetFileChange = (file: File) => {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (!['ffx', 'jsx', 'aep'].includes(ext || '')) {
    toast.error('invalid file type! only .ffx, .jsx, and .aep files are allowed.')
    return
  }
  setEditPresetFile(file)
}

const handleDeletePreset = async () => {
  if (!preset || !user) return
  setIsDeletingPreset(true)

  try {
    // delete preset file from storage
    const filePath = preset.file_url.split('/preset-files/')[1]
    if (filePath) await supabase.storage.from('preset-files').remove([filePath])

    // delete gif from storage
    const gifPath = preset.preview_gif_url?.split('/preset-previews/')[1]
    if (gifPath) await supabase.storage.from('preset-previews').remove([gifPath])

    // delete from database
    const { error } = await supabase
      .from('presets')
      .delete()
      .eq('id', preset.id)

    if (error) throw error

    toast.success('preset deleted!')
    setDeletePresetOpen(false)
    navigate('/')
  } catch (error: any) {
    toast.error(error.message)
  } finally {
    setIsDeletingPreset(false)
  }
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

  setEditGifFile(file)
}

const handleSavePreset = async () => {
  if (!preset || !user) return
  setIsSavingPreset(true)

  try {
    let fileUrl = preset.file_url
    let fileName = preset.file_name
    let fileSize = preset.file_size
    let gifUrl = preset.preview_gif_url

    // if user uploaded a new preset file, replace the old one
    if (editPresetFile) {
      // delete old file from storage
      const oldPath = preset.file_url.split('/preset-files/')[1]
      await supabase.storage.from('preset-files').remove([oldPath])

      // upload new file
      const newPath = `${user.id}/${Date.now()}_${editPresetFile.name}`
      const { error: uploadError } = await supabase.storage
        .from('preset-files')
        .upload(newPath, editPresetFile)
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage
        .from('preset-files')
        .getPublicUrl(newPath)

      fileUrl = urlData.publicUrl
      fileName = editPresetFile.name
    }

    // if user uploaded a new gif, replace the old one
    if (editGifFile) {
      const oldGifPath = preset.preview_gif_url?.split('/preset-previews/')[1]
      if (oldGifPath) {
        await supabase.storage.from('preset-previews').remove([oldGifPath])
      }

      const newGifPath = `${user.id}/${Date.now()}_${editGifFile.name}`
      const { error: gifUploadError } = await supabase.storage
        .from('preset-previews')
        .upload(newGifPath, editGifFile)
      if (gifUploadError) throw gifUploadError

      const { data: gifUrlData } = supabase.storage
        .from('preset-previews')
        .getPublicUrl(newGifPath)

      gifUrl = gifUrlData.publicUrl
    }

    // update the preset row
    const { error: updateError } = await supabase
      .from('presets')
      .update({
        name: editName,
        description: editDescription,
        long_description: editLongDescription,
        category: editCategory,
        ae_version: editAeVersion,
        tags: editTags.split(',').map(t => t.trim()).filter(Boolean),
        dependencies: editDependencies.split(',').map(d => d.trim()).filter(Boolean),
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        preview_gif_url: gifUrl,
      })
      .eq('id', preset.id)

    if (updateError) throw updateError

    toast.success('preset updated!')
    setEditPresetOpen(false)
    loadPreset()  // refresh to show updated data
  } catch (error: any) {
    toast.error(error.message)
  } finally {
    setIsSavingPreset(false)
  }
}

  const handleBack = () => {
  if (window.history.length > 1 && location.key !== 'default') {
    navigate(-1)
  } else {
    navigate('/')
  }
}
  

  const loadPreset = async () => {
    setIsLoading(true)
    const presets = await fetchPresets()
    const found = presets.find(p => p.id === id)
    setPreset(found || null)
    setIsLoading(false  )
    window.scrollTo(0, 0)
  }

  useEffect(() => {
  loadPreset()
  fetchComments()

  const subscription = supabase
    .channel('comments')
    .on('postgres_changes', 
      { 
        event: 'INSERT',
        schema: 'public', 
        table: 'comments',
        filter: `preset_id=eq.${id}`
      }, 
      async (payload) => {
        const newComment = payload.new as Comment

        // fetch the profile for this comment
        const { data: profileData } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', newComment.user_id)
          .single()

        // attach the profile to the comment
        const commentWithProfile = {
          ...newComment,
          profiles: profileData ? { avatar_url: profileData.avatar_url } : null
        }

        setComments(prev => [...prev, commentWithProfile as Comment])
      }
    )
    .subscribe()

  return () => {
    subscription.unsubscribe()
  }
}, [id])

  const handleAuthorClick = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single()


      if (data) navigate(`/profile/${data.username}`)
  }

  const fetchComments = async () => {
    console.log('fetchComments called')

  const { data, error } = await supabase
    .from('comments')
    .select(`
      *,
      profiles (
        avatar_url
      )
    `)
    .eq('preset_id', id)
    .order('created_at', { ascending: true })

  console.log('fetchComments result:', data, error)  // ← add this


  if (error) {
    console.error('error fetching comments:', error)
    return error
  }

  if (data) setComments(data);
  }

  const handlePostComment = async () => {
  if (!user) {
    toast.error('you need to be signed in to comment!')
    return
  }

  if (commentText.trim() === '') {
    toast.error('comment cannot be empty!')
    return
  }

  setIsPostingComment(true)

  try {
    const { error } = await supabase
      .from('comments')
      .insert({
        preset_id: id,
        user_id: user.id,
        author_name: user.username,
        content: commentText,
      })

    if (error) throw error

    setCommentText('')
    toast.success('comment posted!')
  } catch (error: any) {
    toast.error(error.message)
  } finally {
    setIsPostingComment(false)
  }
}

const handleEditComment = (commentId: string, currentText: string) => {
  setEditingCommentId(commentId)
  setEditingCommentText(currentText)
}

const handleCancelEdit = () => {
  setEditingCommentId(null)
  setEditingCommentText('')
}

const handleSaveEdit = async (commentId: string) => {
  const { error, data } = await supabase
    .from('comments')
    .update({ 
      content: editingCommentText,
      edited_at: new Date().toISOString()
    })
    .eq('id', commentId)
    .select()  

    console.log('update result:', data, error)
    console.log('trying to update comment with id:', commentId)
    console.log('current comments in state:', comments.map(c => c.id))

  if (error) {
    toast.error(error.message)
    return
  }

  // update local state 
  setComments(prev => prev.map(c => 
    c.id === commentId 
      ? { ...c, content: editingCommentText, edited_at: new Date().toISOString() }
      : c
  ))

  setEditingCommentId(null)
  setEditingCommentText('')
  toast.success('comment updated!')
}

const handleDeleteComment = async (commentId: string) => {
  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)

  if (error) {
    toast.error(error.message)
    return
  }

  // remove the comment from local state so UI updates instantly
  setComments(prev => prev.filter(c => c.id !== commentId))
  toast.success('comment deleted!')
}
  
    if (isLoading) {
    return (
      <div className="preset-detail-wrapper">
        <div className="preset-detail-content">
          <div className="preset-preview-section">
            <div className="preset-detail-header">
              <Skeleton className="h-9 w-32" />
            </div>
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
            <Button onClick={handleBack}>
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
      <div className="preset-detail-content">
        <div className="preset-preview-section">
          <div className="preset-detail-header">
            <Button variant="ghost" onClick={handleBack} className="back-button">
              <ArrowLeft className="mr-2" size={20} />
              back to browser
            </Button>
          </div>
          <div className="preset-preview-large">
            <img src={preset.previewGif} alt={preset.name} />
          </div>

        <Dialog onOpenChange={(open) => {
          if (open) {
            supabase.rpc('increment_download_count', { preset_id: id })
          }
        }}></Dialog>
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
                <Button variant="outline" size="lg" className="w-full mt-4 how-to-install-btn">
                  <Info className="mr-2 h-5 w-5" />
                  how to install!!! (IMPORTANT)
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                <Card className="upload-card border-none shadow-2xl">
                  <CardHeader className="pb-4">
                    <DialogTitle className="text-2xl font-bold">
                      <SplitText
                        text="how to import compositions"
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
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      this is a composition preset, so you have to import it manually through AE.
                    </DialogDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
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
                  </CardContent>
                  <DialogFooter className="p-6 pt-0 flex gap-2 sm:justify-end">
                    <DialogClose asChild>
                      <Button variant="ghost" className="preset-cancel-btn">
                        close
                      </Button>
                    </DialogClose>
                  </DialogFooter>
                </Card>
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
              {user?.id === preset.user_id && (
                <div className="preset-owner-actions">
                <Button
                  variant="outline"
                  size="sm"
                  className="preset-edit-btn"
                  onClick={() => setEditPresetOpen(true)}
                >
                  <Pencil size={14} className="mr-2" />
                  edit preset
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="preset-edit-btn"
                  onClick={() => setDeletePresetOpen(true)}
                >
                  <Trash2 size={14} className="mr-2" />
                  delete preset
                </Button>
                </div>
              )}

              <Dialog open={deletePresetOpen} onOpenChange={setDeletePresetOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                  <Card className="upload-card border-none shadow-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold">
                        <SplitText
                          text="delete preset"
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
                      <CardDescription className="text-muted-foreground">
                        your preset will be gone forever! obviously do this at your will.
                      </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      <div className="upload-form">
                        <div className="upload-field">
                          <Label>what gets deleted:</Label>
                          <div className="upload-dropzone has-file cursor-default" style={{ padding: '1.5rem', textAlign: 'left' }}>
                            <div className="upload-file-info">
                              <p className="upload-file-name">{preset.file_name}</p>
                              <p className="upload-file-size">everything will be gone!</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        <Button onClick={handleDeletePreset} disabled={isDeletingPreset} className="upload-submit-btn w-full">
                          {isDeletingPreset ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              deleting...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              delete preset
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </DialogContent>
              </Dialog>

              <Dialog open={editPresetOpen} onOpenChange={setEditPresetOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                  <Card className="upload-card border-none shadow-2xl">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-2xl font-bold">
                        <SplitText
                          text="edit preset"
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
                      <CardDescription className="text-muted-foreground">
                        edit your preset. leave things unchanged to keep original data.
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <form id="edit-preset-form" onSubmit={(e) => { e.preventDefault(); handleSavePreset(); }} className="upload-form">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* name */}
                          <div className="upload-field">
                            <Label htmlFor="edit-name">preset name</Label>
                            <Input
                              id="edit-name"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="preset name"
                            />
                          </div>

                          {/* category */}
                          <div className="upload-field">
                            <Label htmlFor="edit-category">category</Label>
                            <Select value={editCategory} onValueChange={setEditCategory}>
                              <SelectTrigger id="edit-category" className="w-full category-select">
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
                          </div>
                        </div>

                        {/* short description */}
                        <div className="upload-field">
                          <Label htmlFor="edit-description">short description</Label>
                          <Input
                            id="edit-description"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="short description"
                          />
                        </div>

                        {/* long description */}
                        <div className="upload-field">
                          <Label htmlFor="edit-long-description">long description</Label>
                          <Textarea
                            id="edit-long-description"
                            value={editLongDescription}
                            onChange={(e) => setEditLongDescription(e.target.value)}
                            placeholder="detailed description..."
                            className="min-h-[120px]"
                          />
                        </div>

                        {/* ae version */}
                        <div className="upload-field">
                          <Label htmlFor="edit-ae-version">after effects version</Label>
                          <Input
                            id="edit-ae-version"
                            value={editAeVersion}
                            onChange={(e) => setEditAeVersion(e.target.value)}
                            placeholder="2023 or later"
                          />
                        </div>

                        {/* tags and dependencies grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* tags */}
                          <div className="upload-field">
                            <Label htmlFor="edit-tags">tags <span className="upload-hint">(comma separated)</span></Label>
                            <Input
                              id="edit-tags"
                              value={editTags}
                              onChange={(e) => setEditTags(e.target.value)}
                              placeholder="animation, text, smooth"
                            />
                          </div>

                          {/* dependencies */}
                          <div className="upload-field">
                            <Label htmlFor="edit-dependencies">dependencies <span className="upload-hint">(comma separated)</span></Label>
                            <Input
                              id="edit-dependencies"
                              value={editDependencies}
                              onChange={(e) => setEditDependencies(e.target.value)}
                              placeholder="none"
                            />
                          </div>
                        </div>

                        {/* preset file dropzone */}
                        <div className="upload-field">
                          <Label>preset file <span className="upload-hint">(leave empty to keep current: {preset.file_name})</span></Label>
                          <div
                            className={`upload-dropzone ${dragOver ? 'dragover' : ''} ${editPresetFile ? 'has-file' : ''}`}
                            onDrop={handlePresetDrop}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => document.getElementById('edit-preset-file-input')?.click()}
                            style={{ padding: '2rem' }}
                          >
                            <input
                              id="edit-preset-file-input"
                              type="file"
                              accept=".ffx,.jsx,.aep"
                              style={{ display: 'none' }}
                              onChange={(e) => e.target.files?.[0] && handlePresetFileChange(e.target.files[0])}
                            />
                            {editPresetFile ? (
                              <div className="upload-file-info">
                                <p className="upload-file-name">{editPresetFile.name}</p>
                                <p className="upload-file-size">{formatBytes(editPresetFile.size)}</p>
                              </div>
                            ) : (
                              <div className="upload-dropzone-prompt">
                                <p>drag & drop your preset here</p>
                                <p className="upload-dropzone-sub">or click to browse — .ffx, .jsx, .aep</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* gif file dropzone */}
                        <div className="upload-field">
                          <Label>preview gif <span className="upload-hint">(leave empty to keep current)</span></Label>
                          <div
                            className={`upload-dropzone ${gifDragOver ? 'dragover' : ''} ${editGifFile ? 'has-file' : ''}`}
                            onDrop={handleGifDrop}
                            onDragOver={(e) => { e.preventDefault(); setGifDragOver(true) }}
                            onDragLeave={() => setGifDragOver(false)}
                            onClick={() => document.getElementById('edit-gif-file-input')?.click()}
                            style={{ padding: '2rem' }}
                          >
                            <input
                              id="edit-gif-file-input"
                              type="file"
                              accept="image/gif"
                              style={{ display: 'none' }}
                              onChange={(e) => e.target.files?.[0] && setEditGifFile(e.target.files[0])}
                            />
                            {editGifFile ? (
                              <div className="upload-file-info">
                                <p className="upload-file-name">{editGifFile.name}</p>
                                <p className="upload-file-size">{formatBytes(editGifFile.size)}</p>
                              </div>
                            ) : (
                              <div className="upload-dropzone-prompt">
                                <p>drag & drop preview gif here</p>
                                <p className="upload-dropzone-sub">or click to browse — .gif only</p>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button type="submit" disabled={isSavingPreset} className="upload-submit-btn w-full mt-6">
                          {isSavingPreset ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              saving...
                            </>
                          ) : (
                            <>
                              <Check className="mr-2 h-4 w-4" />
                              save changes
                            </>
                          )}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </DialogContent>
              </Dialog>
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
              <Download size={20} />
              <h2>downloads</h2>
            </div>
            <div className="download-count">
              <div className="download-count-icon">
                <Download size={16} />
              </div>
              <div className="download-count-copy">
                <span className="download-count-value">{preset.download_count}</span>
                <span className="download-count-label">downloads so far</span>
              </div>
            </div>
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
                <span 
                  className="tech-value clickable-author"
                  onClick={() => handleAuthorClick(preset.user_id)}
                >
                  <User size={14} className="mr-1 inline-block" />
                  {preset.author_name || 'Unknown'}
                </span>
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

          <div className="detail-section">
            <div className="section-header">
              <MessageSquare size={20} />
              <h2>comments</h2>
            </div>

            <div className="comments-section">
              <div className="comments-list">
                {comments.length === 0 ? (
                  <p className="comments-empty">no comments yet. be the first!</p>
                ) : (
                  comments.map((comment, index) => (
                    <FadeContent key={comment.id} delay={index * 50}>
                      <Card className="comment-card bg-muted/20 border-none">
                        <CardHeader className="comment-card-header flex-row items-center gap-3 p-4 pb-2">
                          <div className="comment-avatar">
                            {comment.profiles?.avatar_url ? (
                              <img 
                                src={comment.profiles.avatar_url} 
                                alt={comment.author_name}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                              />
                            ) : (
                              comment.author_name[0].toUpperCase()
                            )}
                          </div>
                          <div className="comment-meta flex flex-col flex-1">
                            <span 
                              className="font-semibold text-sm clickable-author"
                              onClick={() => handleAuthorClick(comment.user_id)}
                            >
                              <User size={12} className="mr-1 inline-block" />
                              {comment.author_name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(comment.created_at).toLocaleDateString()}
                              {comment.edited_at && <span className="ml-1 italic">(edited)</span>}
                            </span>
                          </div>
                          {user?.id === comment.user_id && (
                            <div className="comment-actions">
                              {editingCommentId === comment.id ? (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="comment-action-btn"
                                    onClick={handleCancelEdit}
                                    aria-label="Cancel editing comment"
                                    title="Cancel"
                                  >
                                    <X size={14} />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="comment-action-btn"
                                    onClick={() => handleSaveEdit(comment.id)}
                                    aria-label="Save comment"
                                    title="Save"
                                  >
                                    <Check size={14} />
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="comment-action-btn"
                                    onClick={() => handleEditComment(comment.id, comment.content)}
                                    aria-label="Edit comment"
                                    title="Edit"
                                  >
                                    <Pencil size={14} />
                                  </Button>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="comment-action-btn comment-action-btn-danger"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    aria-label="Delete comment"
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </Button>
                                </>
                              )}
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                          {editingCommentId === comment.id ? (
                            <Textarea
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                              className="min-h-[80px]"
                            />
                          ) : (
                            <p className="text-sm leading-relaxed">{comment.content}</p>
                          )}
                        </CardContent>
                      </Card>
                    </FadeContent>
                  ))
                )}
              </div>

              <div className="comment-input-section mt-6">
                {user ? (
                  <div className="flex flex-col gap-3">
                    <Textarea
                      placeholder="write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="min-h-[100px] bg-muted/10 border-muted-foreground/20 focus-visible:ring-primary/20"
                    />
                    <Button
                      onClick={handlePostComment}
                      disabled={isPostingComment || commentText.trim() === ''}
                      className="self-end comment-submit-btn"
                    >
                      {isPostingComment ? (
                        'posting...'
                      ) : (
                        <>
                          post comment
                          <Send className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <Card className="bg-muted/10 border-dashed">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <p className="text-sm text-muted-foreground">sign in to leave a comment!</p>
                      <Button onClick={() => navigate('/auth')} variant="outline" size="sm" className="comment-sign-in-btn">
                        sign in
                      </Button>
                    </CardContent>
                  </Card>

                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
