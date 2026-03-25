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

 
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">

    </div>
  )
}