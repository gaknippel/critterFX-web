import { useState } from 'react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'

export default function Upload(){

  const [presetFile, setPresetFile] = useState<File | null>(null)
  const [previewGif, setPreviewGif] = useState<File | null>(null)

  
  const [detectedCategory, setDetectedCategory] = useState<string>('')

  
  const [presetName, setPresetName] = useState('')
  const [description, setDescription] = useState('')
  const [longDescription, setLongDescription] = useState('')
  const [aeVersion, setAeVersion] = useState('')
  const [tags, setTags] = useState('')
  const [dependencies, setDependencies] = useState('')

  
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const detectCategory = (file : File): string => {
      const ext = file.name.split('.').pop()?.toLowerCase()
      if (ext == 'jsx')
      {
        return 'script'
      }
      else if (ext == 'ffx')
      {
        return 'preset'
      }
      else if (ext == 'aep')
      {
        return 'composition'
      }
      else
      {
        return ''
      }
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
          {/* add the form here */}
          <p>Form goes here!</p>
        </CardContent>
      </Card>
    </div>
  )
}