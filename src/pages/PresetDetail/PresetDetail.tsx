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
  User,
  X,
  Heart,
  LayoutGrid,
  Type,
  MoveHorizontal,
  Shapes,
  Sparkles,
  Image,
  Code,
  Layers,
  Copy
} from 'lucide-react'

const iconMap: Record<string, any> = {
  LayoutGrid,
  Type,
  MoveHorizontal,
  Shapes,
  Sparkles,
  Image,
  Code,
  Layers
}
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import './PresetDetail.css'
import '@/components/presets/PresetManagementDialogs.css'
import { fetchPresets, categories, type Preset } from '@/lib/api'
import { Dialog, DialogContent, DialogTitle, DialogTrigger, DialogDescription, DialogClose, DialogHeader } from "@/components/ui/dialog"
import SplitText from '@/components/SplitText'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase, Comment } from '@/lib/supabase'
import { toast } from 'sonner'
import { useUserContext } from '@/context/UserContext'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import FadeContent from '@/components/FadeContent'
import { useFavorite } from '@/hooks/useFavorite'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { formatBytes, formatDate } from '@/lib/utils'
import { PresetDeleteDialog, PresetEditDialog } from '@/components/presets/PresetManagementDialogs'
import { ScrollArea } from '@/components/ui/scroll-area'


//for source code syntax stuff
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism'

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
//ybg stan
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
  const [sourceCode, setSourceCode] = useState<string | null>(null)
  const [isLoadingSource, setIsLoadingSource] = useState(false)
  const [showSource, setShowSource] = useState(false)
  const [isCopied, setIsCopied] = useState(false)

  const { isFavorited, toggleFavorite, isLoading: isFavLoading } = useFavorite(id || '')
  const { user } = useUserContext()

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
      fileSize = formatBytes(editPresetFile.size)
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
    setSourceCode(null)
    setShowSource(false)
    setIsCopied(false)
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

  const fetchSourceCode = async () => {
    if(!preset?.file_url) return


    if(sourceCode) {
      setShowSource(!showSource)
      return
    }
    setIsLoadingSource(true)
    try {
      const response = await fetch(preset?.file_url)
      const text = await response.text()
      setSourceCode(text)
      setShowSource(true)
    }
    catch (error){
      toast.error('failed fetching jsx source code :(')
    }
    finally{
      setIsLoadingSource(false)
    }

  }

  const handleCopyCode = async () => {
    if (!sourceCode) return
    try {
      await navigator.clipboard.writeText(sourceCode)
      setIsCopied(true)
      toast.success('code copied to clipboard!')
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      toast.error('failed to copy code')
    }
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
          <h1>preset not found</h1>
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



  const categoryObj = categories.find(cat => cat.id === preset.category)
  const categoryName = categoryObj?.name || preset.category
  const CategoryIcon = categoryObj ? iconMap[categoryObj.icon] : LayoutGrid

  return (
    <div className="preset-detail-wrapper">
      <div className="preset-detail-content">
        <div className="preset-preview-section">
          <div className="preset-detail-header">
            <Button variant="ghost" onClick={handleBack} className="back-button">
              <ArrowLeft className="mr-2" size={20} />
              back to browser
            </Button>
            <div className="preset-sidebar-info">
              <div className="preset-info-item">
                <Download size={14} />
                <span>{preset.download_count}</span>
              </div>
            </div>
          </div>
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
                <Button variant="outline" size="sm" className="w-full mt-2 how-to-install-btn">
                  <Info className="mr-2 h-4 w-4" />
                  how to install!!! (READ THIS)
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false} className="composition-import-dialog max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                <Card className="preset-manage-card composition-import-card shadow-2xl" style={{ padding: '2rem' }}>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="preset-manage-close"
                      aria-label="Close dialog"
                    >
                      <X size={16} />
                    </Button>
                  </DialogClose>
                  <div className="preset-manage-form">
                    <div className="preset-manage-file-info">
                      <DialogTitle style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
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
                      <DialogDescription style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                        this is a composition preset, so you have to import it manually through AE.
                      </DialogDescription>
                    </div>

                    <div className="preset-manage-field">
                      <img src="/howtoinstallcomps.gif" alt="import tutorial animation" style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid color-mix(in oklch, var(--border), transparent 50%)' }} />
                    </div>

                    <div className="preset-manage-field">
                      <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <li>open AE</li>
                        <li>go to <strong>file → import → file</strong> (or press <kbd style={{ padding: '0.25rem 0.5rem', background: 'color-mix(in oklch, var(--muted), transparent 50%)', borderRadius: '0.25rem', fontSize: '0.85rem' }}>Ctrl+I</kbd>)</li>
                        <li>go to: <code style={{ padding: '0.25rem 0.5rem', background: 'color-mix(in oklch, var(--muted), transparent 50%)', borderRadius: '0.25rem', fontSize: '0.85rem' }}>{'Documents\\critterFX\\Compositions'}</code></li>
                        <li>select <strong>{preset.file_name}</strong></li>
                        <li>click "import" and use it in the project panel</li>
                      </ol>
                    </div>

                    <div className="preset-manage-dropzone" style={{ padding: '1rem', textAlign: 'left', cursor: 'text' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        💡 <strong>tip:</strong> you can also drag and drop the .aep file directly into the AE project panel.
                      </p>
                    </div>
                  </div>
                </Card>
              </DialogContent>
            </Dialog>
          )}

          {preset.file_name.toLowerCase().endsWith('.jsx') && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="w-full mt-2 how-to-install-btn">
                  <Info className="mr-2 h-4 w-4" />
                  how to use script!!! (READ THIS)
                </Button>
              </DialogTrigger>
              <DialogContent showCloseButton={false} className="script-import-dialog max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none">
                <Card className="preset-manage-card script-import-card shadow-2xl" style={{ padding: '2rem' }}>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="preset-manage-close"
                      aria-label="Close dialog"
                    >
                      <X size={16} />
                    </Button>
                  </DialogClose>
                  <div className="preset-manage-form">
                    <div className="preset-manage-file-info">
                      <DialogTitle style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>
                        <SplitText
                          text="how to run scripts"
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
                      <DialogDescription style={{ color: 'var(--muted-foreground)', marginTop: '0.5rem' }}>
                        scripts are cool! idk why adobe makes them kind of hard to access though
                      </DialogDescription>
                    </div>

                    <div className="preset-manage-field">
                      <img src="/howtoScript.gif" alt="script tutorial animation" style={{ width: '100%', borderRadius: '0.75rem', border: '1px solid color-mix(in oklch, var(--border), transparent 50%)' }} />
                    </div>

                    <div className="preset-manage-field">
                      <ol style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
                        <li>open AE</li>
                        <li>scripts should be in: <code style={{ padding: '0.25rem 0.5rem', background: 'color-mix(in oklch, var(--muted), transparent 50%)', borderRadius: '0.25rem', fontSize: '0.85rem' }}>{'Program Files\\Adobe\\Adobe After Effects [version]\\Support Files\\Scripts'}</code></li>
                        <li>go to <strong>file → scripts → and file your script file!</strong></li>
                      </ol>
                    </div>

                    <div className="preset-manage-dropzone" style={{ padding: '1rem', textAlign: 'left', cursor: 'text' }}>
                      <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        💡 <strong>tip:</strong> restart AE for scripts to appear in the <strong>file → scripts</strong> menu automatically!
                      </p>
                    </div>
                  </div>
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
            <div className="flex items-center gap-2 preset-detail-category">
              {CategoryIcon && <CategoryIcon size={16} className="opacity-70" />}
              <span>{categoryName}</span>
            </div>
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

              <PresetDeleteDialog
                open={deletePresetOpen}
                onOpenChange={setDeletePresetOpen}
                preset={preset}
                onDelete={handleDeletePreset}
                isDeleting={isDeletingPreset}
              />

              <PresetEditDialog
                open={editPresetOpen}
                onOpenChange={setEditPresetOpen}
                preset={preset}
                editName={editName}
                setEditName={setEditName}
                editDescription={editDescription}
                setEditDescription={setEditDescription}
                editLongDescription={editLongDescription}
                setEditLongDescription={setEditLongDescription}
                editCategory={editCategory}
                setEditCategory={setEditCategory}
                editTags={editTags}
                setEditTags={setEditTags}
                editDependencies={editDependencies}
                setEditDependencies={setEditDependencies}
                editAeVersion={editAeVersion}
                setEditAeVersion={setEditAeVersion}
                editPresetFile={editPresetFile}
                onPresetFileChange={handlePresetFileChange}
                editGifFile={editGifFile}
                onGifFileChange={setEditGifFile}
                dragOver={dragOver}
                setDragOver={setDragOver}
                gifDragOver={gifDragOver}
                setGifDragOver={setGifDragOver}
                onSave={handleSavePreset}
                isSaving={isSavingPreset}
              />
          </div>



          <div className="preset-tags">
            {preset.tags?.map((tag, index) => (
              <Badge key={index} variant="secondary" className="preset-tag">{tag}</Badge>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <div className="preset-file-info">
              <FileCode size={14} />
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <code className="preset-file-name">{preset.file_name}</code>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-[10px] font-medium py-1 px-2">
                    <p>this is the file you search for in AE.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className={`favorite-btn-small ${isFavorited ? 'favorited' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  if (!user) {
                    toast.error('sign in to favorite presets!')
                    return
                  }
                  toggleFavorite()
                }}
                disabled={isFavLoading}
              >
                <Heart 
                  size={18} 
                  fill={isFavorited ? 'currentColor' : 'none'}
                />
              </Button>
              <span className={`favorite-label ${isFavorited ? 'favorited' : ''}`}>
                {isFavorited ? 'favorited' : 'add to favorites'}
              </span>
            </div>
          </div>

          <div className="detail-section">
            <div className="section-header">
              <Info size={20} />
              <h2>description</h2>
            </div>
            <p className="detail-text">{preset.long_description || preset.description}</p>
          </div>

              {preset.file_name.toLowerCase().endsWith('.jsx') && (
                <div className="detail-section">
                  <div className="section-header justify-between">
                    <div className="flex items-center gap-3">
                      <FileCode size={20} />
                      <h2>source code</h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={fetchSourceCode}
                      disabled={isLoadingSource}
                      className="source-toggle-btn"
                    >
                      {isLoadingSource ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />loading...</>
                      ) : showSource ? 'hide code' : 'view code'}
                    </Button>
                  </div>
                  
                  {showSource && sourceCode && (
                    <div className="source-code-container">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="copy-code-btn"
                        onClick={handleCopyCode}
                        title="Copy to clipboard"
                      >
                        {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </Button>
                      <ScrollArea className="h-[600px] w-full rounded-md border border-white/10 bg-black/30 source-code-viewport selectable-code">
                        <div className="min-w-max">
                          <SyntaxHighlighter
                            language="javascript"
                            style={vscDarkPlus}
                            showLineNumbers={true}
                            lineNumberStyle={{ 
                              minWidth: '3em', 
                              paddingRight: '1em', 
                              color: 'rgba(255,255,255,0.2)', 
                              textAlign: 'right',
                              userSelect: 'none' // line numbers should not be selectable
                            }}
                            customStyle={{
                              margin: 0,
                              padding: '1.5rem 1rem',
                              background: 'transparent',
                              fontSize: '0.85rem',
                              overflow: 'visible',
                              userSelect: 'text' // ensure code is selectable
                            }}
                          >
                            {sourceCode}
                          </SyntaxHighlighter>
                        </div>
                      </ScrollArea>
                    </div>
                  )}
                </div>
              )}

          <div className="detail-section">
            <div className="section-header">
              <FileCode size={20} />
              <h2>technical info</h2>
            </div>
            <div className="tech-info-grid">
              <div className="tech-info-item">
                <span className="tech-label">after effects version:</span>
                <span className="tech-label">{preset.ae_version || 'N/A'}</span>
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
                              {formatDate(comment.created_at)}
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


