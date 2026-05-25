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
  Upload as UploadIcon,
  AlertTriangle
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useState, useEffect } from 'react';

import '../../pages/Upload/Upload.css'
import './PresetManagementDialogs.css'
import './Settings.css'

const categoryIcons: Record<string, ReactNode> = {
  textAnims: <TypeIcon className="preset-category-icon" />,
  transitions: <MoveHorizontal className="preset-category-icon" />,
  shapeAnims: <Shapes className="preset-category-icon" />,
  effects: <Sparkles className="preset-category-icon" />,
  backgrounds: <ImageIcon className="preset-category-icon" />,
  scripts: <CodeIcon className="preset-category-icon" />,
  compositions: <Layers className="preset-category-icon" />,
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
        className="preset-manage-dialog preset-delete-dialog"
      >
        <div className="settings-wrapper preset-manage-shell">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="preset-manage-close-button"
              aria-label="Close delete preset dialog"
            >
              <X size={16} />
            </Button>
          </DialogClose>

          <div className="settings-header-section preset-manage-header-section">
            <div className="settings-header-content">
              <DialogTitle asChild>
                <h1 className="settings-welcome-message preset-manage-title">
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
              <DialogDescription className="settings-header-description preset-manage-description">
                your preset will be gone forever! obviously do this at your own will.
              </DialogDescription>
            </div>
          </div>

          <div className="settings-info-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title">what gets deleted</h2>
            </div>
            <div className="settings-section-content">
              <div className="preset-delete-file-box">
                    <p className="preset-delete-file-name">{preset?.file_name}</p>
              </div>
            </div>
          </div>

          <div className="preset-delete-actions">
            <Button 
              variant="destructive"
              onClick={onDelete} 
              disabled={isDeleting} 
              className="preset-delete-button"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="preset-button-icon preset-button-icon--spin" />
                  deleting...
                </>
              ) : (
                <>
                  <Trash2 className="preset-button-icon" />
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

  // initialize preview URL if a gif file is already passed in
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
    if (file.type !== 'image/gif' && file.type !== 'video/webm') {
      toast.error('preview must be a GIF or WebM!')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('preview too large! max size is 2MB.')
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
    onGifFileChange(null as any) // parent handles null
  }

  const handleRemovePreset = (e: React.MouseEvent) => {
    e.stopPropagation()
    onPresetFileChange(null as any)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="preset-manage-dialog preset-edit-dialog custom-scrollbar"
      >
        <div className="settings-wrapper preset-manage-shell">
          <DialogClose asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="preset-manage-close-button"
              aria-label="Close edit preset dialog"
            >
              <X size={16} />
            </Button>
          </DialogClose>

          <div className="settings-header-section preset-manage-header-section">
            <div className="settings-header-content">
              <DialogTitle asChild>
                <h1 className="settings-welcome-message preset-manage-title">
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
              <DialogDescription className="settings-header-description preset-manage-description">
                edit your preset details. leave files unchanged to keep original data.
              </DialogDescription>
            </div>
          </div>

          <div className="preset-edit-layout">
            
            {/* files section */}
            <div className="settings-info-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">files</h2>
              </div>
              <div className="settings-section-content preset-manage-section-content">
                
                {/* preset dropzone */}
                <div className="settings-field">
                  <Label className="settings-field-label">
                    preset file
                    <span className="upload-hint preset-label-hint">(leave empty to keep: {preset?.file_name})</span>
                  </Label>
                  <div
                    className={`upload-dropzone preset-file-dropzone ${dragOver ? 'dragover' : ''} ${editPresetFile ? 'has-file preset-file-dropzone--preview' : 'preset-file-dropzone--empty'}`}
                    onDrop={handlePresetDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => document.getElementById(presetInputId)?.click()}
                  >
                    <input
                      id={presetInputId}
                      type="file"
                      accept=".ffx,.jsx,.aep"
                      className="preset-hidden-input"
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
                      <div className="preset-file-preview">
                        <div className="preset-file-preview-icon-wrap">
                          {editPresetFile.name.toLowerCase().endsWith('.jsx') ? (
                            <FileCode className="preset-preview-main-icon" />
                          ) : (
                            <FileText className="preset-preview-main-icon" />
                          )}
                        </div>

                        <div className="preset-preview-overlay">
                           <div className="preset-preview-overlay-icon-wrap">
                             <Pencil className="preset-preview-overlay-icon" />
                           </div>
                           <p className="preset-preview-overlay-text">CHANGE FILE</p>
                        </div>

                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="preset-preview-delete-button"
                          onClick={handleRemovePreset}
                        >
                          <Trash2 className="preset-button-icon" />
                        </Button>

                        <div className="preset-preview-caption">
                          <div className="preset-preview-caption-row">
                            <UploadIcon className="preset-preview-meta-icon" />
                            <p className="preset-preview-file-name">{editPresetFile.name}</p>
                          </div>
                          <p className="preset-preview-file-size">{formatFileSize(editPresetFile.size)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-dropzone-prompt">
                        <p>drag & drop your preset here</p>
                        <p className="upload-dropzone-sub">or click to browse - .ffx, .jsx, .aep (max 3MB)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* gif dropzone */}
                <div className="settings-field">
                  <div className="flex items-center gap-2">
                    <Label className="settings-field-label">
                      preview gif / webm
                      <span className="upload-hint preset-label-hint">(leave empty to keep current)</span>
                    </Label>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-orange-500 hover:text-orange-400 transition-colors">
                            <AlertTriangle className="size-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px] text-center">
                          <p>webms are highly recommended over gifs!</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div
                    className={`upload-dropzone preset-file-dropzone ${gifDragOver ? 'dragover' : ''} ${gifPreviewUrl ? 'has-file preset-file-dropzone--preview' : 'preset-file-dropzone--empty'}`}
                    onDrop={handleGifDrop}
                    onDragOver={(e) => { e.preventDefault(); setGifDragOver(true) }}
                    onDragLeave={() => setGifDragOver(false)}
                    onClick={() => document.getElementById(gifInputId)?.click()}
                  >
                    <input
                      id={gifInputId}
                      type="file"
                      accept="image/gif,video/webm"
                      className="preset-hidden-input"
                      onChange={(e) => e.target.files?.[0] && handleGifSelection(e.target.files[0])}
                    />
                    {gifPreviewUrl ? (
                      <div className="preset-gif-preview">
                        <div 
                          className="preset-gif-preview-backdrop"
                          style={{ backgroundImage: `url(${gifPreviewUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                        />
                        {editGifFile?.type === 'video/webm' ? (
                          <video 
                            src={gifPreviewUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline
                            className="preset-gif-preview-image"
                          />
                        ) : (
                          <img 
                            src={gifPreviewUrl} 
                            alt="Preview" 
                            className="preset-gif-preview-image"
                          />
                        )}
                        <div className="preset-preview-overlay">
                           <div className="preset-preview-overlay-icon-wrap">
                             <Pencil className="preset-preview-overlay-icon" />
                           </div>
                           <p className="preset-preview-overlay-text">CHANGE PREVIEW</p>
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="preset-preview-delete-button"
                          onClick={handleRemoveGif}
                        >
                          <Trash2 className="preset-button-icon" />
                        </Button>
                        <div className="preset-preview-caption">
                          <div className="preset-preview-caption-row">
                            <ImageIcon className="preset-preview-meta-icon" />
                            <p className="preset-preview-file-name">{editGifFile?.name}</p>
                          </div>
                          <p className="preset-preview-file-size">{editGifFile && formatFileSize(editGifFile.size)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="upload-dropzone-prompt">
                        <p>drag & drop preview gif or webm here</p>
                        <p className="upload-dropzone-sub">or click to browse - .gif or .webm only (max 2MB)</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* details section */}
            <div className="settings-info-section">
              <div className="settings-section-header">
                <h2 className="settings-section-title">details</h2>
              </div>
              <div className="settings-section-content preset-manage-section-content">
                
                <div className="preset-form-grid">
                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-name">preset name</Label>
                    <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} required placeholder="my cool preset" />
                  </div>

                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-category">category</Label>
                    <Select value={editCategory} onValueChange={setEditCategory} required>
                      <SelectTrigger id="edit-category" className="preset-select-trigger">
                        <SelectValue placeholder="select a category" />
                      </SelectTrigger>
                      <SelectContent position="popper">
                        {categories.filter(c => c.id !== 'all').map(c => (
                          <SelectItem key={c.id} value={c.id}>
                            <div className="preset-select-option">
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
                    className="preset-long-description"
                  />
                </div>

                <div className="settings-field">
                  <Label className="settings-field-label" htmlFor="edit-ae-version">after effects version</Label>
                  <Input id="edit-ae-version" value={editAeVersion} onChange={(e) => setEditAeVersion(e.target.value)} placeholder="2023 or later" />
                </div>

                <div className="preset-form-grid">
                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-tags">tags <span className="upload-hint preset-label-hint preset-label-hint--tight">(comma separated)</span></Label>
                    <Input id="edit-tags" value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="animation, text, smooth" />
                  </div>

                  <div className="settings-field">
                    <Label className="settings-field-label" htmlFor="edit-dependencies">dependencies <span className="upload-hint preset-label-hint preset-label-hint--tight">(comma separated)</span></Label>
                    <Input id="edit-dependencies" value={editDependencies} onChange={(e) => setEditDependencies(e.target.value)} placeholder="none" />
                  </div>
                </div>

              </div>
            </div>

            <div className="settings-footer preset-manage-footer">
              <Button 
                onClick={onSave} 
                disabled={isSaving} 
                className="settings-save-button preset-save-button"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="preset-button-icon preset-button-icon--large preset-button-icon--spin" />
                    saving...
                  </>
                ) : (
                  <>
                    <Check className="preset-button-icon preset-button-icon--large" />
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
