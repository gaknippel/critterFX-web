import { useId, type DragEvent, type ReactNode } from 'react'
import {
  Check,
  Code as CodeIcon,
  Image as ImageIcon,
  Layers,
  Loader2,
  MoveHorizontal,
  Shapes,
  Sparkles,
  Trash2,
  Type as TypeIcon,
  X,
  Pencil,
  FileCode,
  FileText,
  Upload as UploadIcon
} from 'lucide-react'
import { toast } from 'sonner'

import { categories, type Preset } from '@/lib/api'
import SplitText from '@/components/SplitText'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useState, useEffect } from 'react';

import '../../pages/Upload/Upload.css'
import './PresetManagementDialogs.css'

const categoryIcons: Record<string, ReactNode> = {
  textAnims: <TypeIcon className="size-4" />,
  transitions: <MoveHorizontal className="size-4" />,
  shapeAnims: <Shapes className="size-4" />,
  effects: <Sparkles className="size-4" />,
  backgrounds: <ImageIcon className="size-4" />,
  scripts: <CodeIcon className="size-4" />,
  compositions: <Layers className="size-4" />,
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

type PresetDeleteDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  preset: Preset | null
  onDelete: () => void
  isDeleting: boolean
}

type PresetEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  preset: Preset | null
  editName: string
  setEditName: (value: string) => void
  editDescription: string
  setEditDescription: (value: string) => void
  editLongDescription: string
  setEditLongDescription: (value: string) => void
  editCategory: string
  setEditCategory: (value: string) => void
  editTags: string
  setEditTags: (value: string) => void
  editDependencies: string
  setEditDependencies: (value: string) => void
  editAeVersion: string
  setEditAeVersion: (value: string) => void
  editPresetFile: File | null
  onPresetFileChange: (file: File) => void
  editGifFile: File | null
  onGifFileChange: (file: File) => void
  dragOver: boolean
  setDragOver: (value: boolean) => void
  gifDragOver: boolean
  setGifDragOver: (value: boolean) => void
  onSave: () => void
  isSaving: boolean
}

export function PresetDeleteDialog({
  open,
  onOpenChange,
  preset,
  onDelete,
  isDeleting,
}: PresetDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none"
      >
        <div className="settings-wrapper w-full p-6 md:p-8 bg-background/95 backdrop-blur-xl rounded-xl border shadow-2xl">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full z-10"
              aria-label="Close delete preset dialog"
            >
              <X size={16} />
            </Button>
          </DialogClose>

          <div className="settings-header-section !bg-transparent !border-none !shadow-none !p-0 !mb-8">
            <div className="settings-header-content">
              <DialogTitle asChild>
                <h1 className="settings-welcome-message text-2xl font-bold">
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
                </h1>
              </DialogTitle>
              <DialogDescription className="settings-header-description mt-2 text-muted-foreground">
                your preset will be gone forever! obviously do this at your own will.
              </DialogDescription>
            </div>
          </div>

          <div className="settings-info-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title">what gets deleted</h2>
            </div>
            <div className="settings-section-content">
              <div className="relative w-full h-[100px] rounded-xl overflow-hidden border border-destructive/20 bg-destructive/5 flex items-center justify-center">
                    <p className="font-semibold text-foreground truncate">{preset?.file_name}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button 
              variant="destructive"
              onClick={onDelete} 
              disabled={isDeleting} 
              className="h-11 px-8 font-semibold shadow-lg shadow-destructive/20"
            >
              {isDeleting ? (
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
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function PresetEditDialog({
  open,
  onOpenChange,
  preset,
  editName,
  setEditName,
  editDescription,
  setEditDescription,
  editLongDescription,
  setEditLongDescription,
  editCategory,
  setEditCategory,
  editTags,
  setEditTags,
  editDependencies,
  setEditDependencies,
  editAeVersion,
  setEditAeVersion,
  editPresetFile,
  onPresetFileChange,
  editGifFile,
  onGifFileChange,
  dragOver,
  setDragOver,
  gifDragOver,
  setGifDragOver,
  onSave,
  isSaving,
}: PresetEditDialogProps) {
  const presetInputId = useId()
  const gifInputId = useId()

  const [gifPreviewUrl, setGifPreviewUrl] = useState<string | null>(null)

  // Initialize preview URL if a gif file is already passed in
  useEffect(() => {
    if (editGifFile) {
      const url = URL.createObjectURL(editGifFile)
      setGifPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    } else {
      setGifPreviewUrl(null)
    }
  }, [editGifFile])

  const handlePresetDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        toast.error('preset file too large! max size is 3MB.')
        return
      }
      onPresetFileChange(file)
    }
  }

  const handleGifSelection = (file: File) => {
    if (file.type !== 'image/gif') {
      toast.error('preview must be a GIF!')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('gif preview too large! max size is 2MB.')
      return
    }

    onGifFileChange(file)
  }

  const handleGifDrop = (e: DragEvent) => {
    e.preventDefault()
    setGifDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleGifSelection(file)
  }

  const handleRemoveGif = (e: React.MouseEvent) => {
    e.stopPropagation()
    onGifFileChange(null as any) // Parent handles null
  }

  const handleRemovePreset = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPresetFileChange(null as any)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl max-h-[90vh] overflow-y-auto p-0 border-none bg-transparent shadow-none custom-scrollbar"
      >
        <div className="settings-wrapper w-full p-6 md:p-8 bg-background/95 backdrop-blur-xl rounded-xl border shadow-2xl">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-4 top-4 rounded-full z-10"
              aria-label="Close edit preset dialog"
            >
              <X size={16} />
            </Button>
          </DialogClose>

          <div className="settings-header-section !bg-transparent !border-none !shadow-none !p-0 !mb-8">
            <div className="settings-header-content">
              <DialogTitle asChild>
                <h1 className="settings-welcome-message text-2xl font-bold">
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
                </h1>
              </DialogTitle>
              <DialogDescription className="settings-header-description mt-2 text-muted-foreground">
                edit your preset details. leave files unchanged to keep original data.
              </DialogDescription>
            </div>
          </div>

          <div className="flex flex-col gap-8 w-full">
            
            {/* Files Section */}
            <div className="settings-info-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">files</h2>
              </div>
              <div className="settings-section-content space-y-4">
                
                {/* preset dropzone */}
                <div className="settings-field">
                  <Label className="settings-field-label">
                    preset file
                    <span className="upload-hint ml-2 font-normal">(leave empty to keep: {preset?.file_name})</span>
                  </Label>
                  <div
                    className={`upload-dropzone relative overflow-hidden ${dragOver ? 'dragover' : ''} ${editPresetFile ? 'has-file border-none p-0' : 'p-8'}`}
                    onDrop={handlePresetDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => document.getElementById(presetInputId)?.click()}
                  >
                    <input
                      id={presetInputId}
                      type="file"
                      accept=".ffx,.jsx,.aep"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.size > 3 * 1024 * 1024) {
                            toast.error('preset file too large! max size is 3MB.')
                            return
                          }
                          onPresetFileChange(file)
                        }
                      }}
                    />
                    {editPresetFile ? (
                      <div className="relative w-full h-[140px] group rounded-xl overflow-hidden border border-border bg-muted/20 shadow-inner flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 relative z-10 transition-transform duration-300 group-hover:scale-110">
                          {editPresetFile.name.toLowerCase().endsWith('.jsx') ? (
                            <FileCode className="size-10 text-primary/80" />
                          ) : (
                            <FileText className="size-10 text-primary/80" />
                          )}
                        </div>

                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]">
                           <div className="bg-white/10 p-3 rounded-full mb-2 scale-90 group-hover:scale-100 transition-transform duration-300">
                             <Pencil className="text-white size-5" />
                           </div>
                           <p className="text-white font-semibold text-xs tracking-wide">CHANGE FILE</p>
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 shadow-lg"
                          onClick={handleRemovePreset}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>

                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex items-center gap-2">
                            <UploadIcon className="text-white/70 size-4 flex-shrink-0" />
                            <p className="text-white font-medium text-sm truncate">{editPresetFile.name}</p>
                          </div>
                          <p className="text-white/60 text-xs mt-0.5 ml-6">{formatFileSize(editPresetFile.size)}</p>
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
                  <Label className="settings-field-label">
                    preview gif
                    <span className="upload-hint ml-2 font-normal">(leave empty to keep current)</span>
                  </Label>
                  <div
                    className={`upload-dropzone relative overflow-hidden ${gifDragOver ? 'dragover' : ''} ${gifPreviewUrl ? 'has-file border-none p-0' : 'p-8'}`}
                    onDrop={handleGifDrop}
                    onDragOver={(e) => { e.preventDefault(); setGifDragOver(true) }}
                    onDragLeave={() => setGifDragOver(false)}
                    onClick={() => document.getElementById(gifInputId)?.click()}
                  >
                    <input
                      id={gifInputId}
                      type="file"
                      accept="image/gif"
                      style={{ display: 'none' }}
                      onChange={(e) => e.target.files?.[0] && handleGifSelection(e.target.files[0])}
                    />
                    {gifPreviewUrl ? (
                      <div className="relative w-full aspect-video group rounded-xl overflow-hidden border border-border bg-muted/20 shadow-inner">
                        <div 
                          className="absolute inset-0 opacity-20 blur-2xl scale-110"
                          style={{ backgroundImage: `url(${gifPreviewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        <img 
                          src={gifPreviewUrl} 
                          alt="GIF Preview" 
                          className="w-full h-full object-contain relative z-10"
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center z-20 backdrop-blur-[2px]">
                           <div className="bg-white/10 p-3 rounded-full mb-2 scale-90 group-hover:scale-100 transition-transform duration-300">
                             <Pencil className="text-white size-5" />
                           </div>
                           <p className="text-white font-semibold text-xs tracking-wide">CHANGE PREVIEW</p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 h-8 w-8 shadow-lg"
                          onClick={handleRemoveGif}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="text-white/70 size-4 flex-shrink-0" />
                            <p className="text-white font-medium text-sm truncate">{editGifFile?.name}</p>
                          </div>
                          <p className="text-white/60 text-xs mt-0.5 ml-6">{editGifFile && formatFileSize(editGifFile.size)}</p>
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
                    <Label className="settings-field-label" htmlFor="edit-name">preset name</Label>
                    <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required placeholder="my cool preset" />
                  </div>

                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-category">category</Label>
                    <Select value={editCategory} onValueChange={setEditCategory} required>
                      <SelectTrigger id="edit-category" className="w-full h-10">
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

                <div className="settings-field">
                  <Label className="settings-field-label" htmlFor="edit-description">short description</Label>
                  <Input id="edit-description" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} required placeholder="a short one-liner" />
                </div>

                <div className="settings-field">
                  <Label className="settings-field-label" htmlFor="edit-long-description">long description</Label>
                  <Textarea
                    id="edit-long-description"
                    value={editLongDescription}
                    onChange={(e) => setEditLongDescription(e.target.value)}
                    placeholder="detailed instructions, tips, how to use, etc."
                    className="min-h-[120px]"
                  />
                </div>

                <div className="settings-field">
                  <Label className="settings-field-label" htmlFor="edit-ae-version">after effects version</Label>
                  <Input id="edit-ae-version" value={editAeVersion} onChange={(e) => setEditAeVersion(e.target.value)} placeholder="2023 or later" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-tags">tags <span className="upload-hint ml-1">(comma separated)</span></Label>
                    <Input id="edit-tags" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="animation, text, smooth" />
                  </div>

                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-dependencies">dependencies <span className="upload-hint ml-1">(comma separated)</span></Label>
                    <Input id="edit-dependencies" value={editDependencies} onChange={(e) => setEditDependencies(e.target.value)} placeholder="none" />
                  </div>
                </div>

              </div>
            </div>

            <div className="settings-footer !p-0 !bg-transparent !border-none !shadow-none">
              <Button 
                onClick={onSave} 
                disabled={isSaving} 
                className="settings-save-button h-12 text-base font-semibold"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    saving...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-5 w-5" />
                    save changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
