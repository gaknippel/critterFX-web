import { useState, useRef } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

const ALLOWED_EXTENSIONS = ['ffx', 'aep', 'jsx']
const ALLOWED_MIME_TYPES = ['image/gif']

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

function detectCategory(file: File): string {
  const ext = getExtension(file.name)
  if (ext === 'jsx') return 'script'
  if (ext === 'ffx') return 'preset'
  if (ext === 'aep') return 'composition'
  return ''
}

export default function Upload() {
  const presetInputRef = useRef<HTMLInputElement>(null)
  const gifInputRef = useRef<HTMLInputElement>(null)
 
  const [presetFile, setPresetFile] = useState<File | null>(null)
  const [previewGif, setPreviewGif] = useState<File | null>(null)
  const [presetFileError, setPresetFileError] = useState<string | null>(null)
  const [gifFileError, setGifFileError] = useState<string | null>(null)
 
  const [detectedCategory, setDetectedCategory] = useState<string>('')
 
  const [presetName, setPresetName] = useState('')
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [aeVersion, setAeVersion] = useState('')
  const [tags, setTags] = useState('')
  const [dependencies, setDependencies] = useState('')
 
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
 
  // --- File handlers ---
 
  function handlePresetFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setPresetFileError(null)
    setPresetFile(null)
    setDetectedCategory('')
 
    if (!file) return
 
    const ext = getExtension(file.name)
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setPresetFileError(`Invalid file type ".${ext}". Only .ffx, .aep, and .jsx files are allowed.`)
      e.target.value = ''
      return
    }
 
    setPresetFile(file)
    setDetectedCategory(detectCategory(file))
  }
 
  function handleGifChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setGifFileError(null)
    setPreviewGif(null)
 
    if (!file) return
 
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      setGifFileError('Preview must be a .gif file.')
      e.target.value = ''
      return
    }
 
    setPreviewGif(file)
  }
 
  // --- Submit ---
 
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!presetFile) {
      setUploadError('Please select a preset file.')
      return
    }
 
    setIsUploading(true)
    setUploadError(null)
 
    try {
      // TODO: Replace this block with Supabase upload logic
      // 1. Upload presetFile to Supabase Storage → get fileUrl
      // 2. If previewGif, upload it → get gifUrl
      // 3. Insert row into `presets` table:
      //    { name: presetName, description, long_description: longDescription,
      //      ae_version: aeVersion, tags: tags.split(',').map(t => t.trim()),
      //      dependencies, category: detectedCategory, file_url: fileUrl, gif_url: gifUrl }
 
      await new Promise(r => setTimeout(r, 1200)) // placeholder delay
      setUploadSuccess(true)
    } catch (err: any) {
      setUploadError(err.message ?? 'Upload failed. Please try again.')
    } finally {
      setIsUploading(false)
    }
  }
 
  // --- Category badge ---
  const categoryLabel: Record<string, string> = {
    script: 'Script (.jsx)',
    preset: 'Effect Preset (.ffx)',
    composition: 'Composition (.aep)',
  }
 
  if (uploadSuccess) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle>Upload Successful 🎉</CardTitle>
            <CardDescription>Your preset has been shared with the community.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => {
              setUploadSuccess(false)
              setPresetFile(null)
              setPreviewGif(null)
              setDetectedCategory('')
              setPresetName('')
              setDescription('')
              setLongDescription('')
              setAeVersion('')
              setTags('')
              setDependencies('')
            }}>
              Upload Another
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
 
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Preset</CardTitle>
          <CardDescription>
            Share your After Effects preset with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
 
            {/* ── Preset File ── */}
            <div className="space-y-2">
              <Label htmlFor="preset-file">
                Preset File <span className="text-destructive">*</span>
              </Label>
              <input
                id="preset-file"
                ref={presetInputRef}
                type="file"
                accept=".ffx,.aep,.jsx"
                onChange={handlePresetFileChange}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary file:text-primary-foreground
                  hover:file:bg-primary/90 cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Accepted formats: .ffx, .aep, .jsx
              </p>
              {presetFileError && (
                <p className="text-sm text-destructive">{presetFileError}</p>
              )}
              {presetFile && detectedCategory && (
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    Detected: {categoryLabel[detectedCategory]}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(presetFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              )}
            </div>
 
            {/* ── Preview GIF ── */}
            <div className="space-y-2">
              <Label htmlFor="preview-gif">Preview GIF (optional)</Label>
              <input
                id="preview-gif"
                ref={gifInputRef}
                type="file"
                accept="image/gif"
                onChange={handleGifChange}
                className="block w-full text-sm text-muted-foreground
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-secondary file:text-secondary-foreground
                  hover:file:bg-secondary/80 cursor-pointer"
              />
              {gifFileError && (
                <p className="text-sm text-destructive">{gifFileError}</p>
              )}
              {previewGif && (
                <p className="text-xs text-muted-foreground">
                  {previewGif.name} — {(previewGif.size / 1024).toFixed(1)} KB
                </p>
              )}
            </div>
 
            {/* ── Name ── */}
            <div className="space-y-2">
              <Label htmlFor="preset-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="preset-name"
                placeholder="e.g. Smooth Motion Blur Preset"
                value={presetName}
                onChange={e => setPresetName(e.target.value)}
                required
              />
            </div>
 
            {/* ── Short Description ── */}
            <div className="space-y-2">
              <Label htmlFor="description">Short Description</Label>
              <Input
                id="description"
                placeholder="One-line summary shown in listings"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={120}
              />
              <p className="text-xs text-muted-foreground text-right">
                {description.length}/120
              </p>
            </div>
 
            {/* ── Long Description ── */}
            <div className="space-y-2">
              <Label htmlFor="long-description">Full Description</Label>
              <Textarea
                id="long-description"
                placeholder="Describe what your preset does, how to use it, any tips…"
                value={longDescription}
                onChange={e => setLongDescription(e.target.value)}
                rows={4}
              />
            </div>
 
            {/* ── AE Version ── */}
            <div className="space-y-2">
              <Label htmlFor="ae-version">Minimum After Effects Version</Label>
              <Input
                id="ae-version"
                placeholder="e.g. 2022, 23.0, 2024"
                value={aeVersion}
                onChange={e => setAeVersion(e.target.value)}
              />
            </div>
 
            {/* ── Tags ── */}
            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <Input
                id="tags"
                placeholder="motion blur, color, transitions (comma-separated)"
                value={tags}
                onChange={e => setTags(e.target.value)}
              />
            </div>
 
            {/* ── Dependencies ── */}
            <div className="space-y-2">
              <Label htmlFor="dependencies">Dependencies</Label>
              <Input
                id="dependencies"
                placeholder="e.g. Motion Bro, AEJuice (leave blank if none)"
                value={dependencies}
                onChange={e => setDependencies(e.target.value)}
              />
            </div>
 
            {/* ── Submit ── */}
            {uploadError && (
              <p className="text-sm text-destructive">{uploadError}</p>
            )}
            <Button
              type="submit"
              className="w-full"
              disabled={isUploading || !presetFile || !presetName}
            >
              {isUploading ? 'Uploading…' : 'Upload Preset'}
            </Button>
 
          </form>
        </CardContent>
      </Card>
    </div>
  )
}