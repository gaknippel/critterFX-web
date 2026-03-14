import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'

config()

const supabase = createClient (
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
)

const MANIFEST_URL = 'https://raw.githubusercontent.com/gaknippel/critterFX-presets/main/manifest.json'

async function migrate() {
  // step 1: fetch your manifest from github
  const res = await fetch(MANIFEST_URL)
  const data = await res.json()

  // step 2: map each preset to match supabase's column names
  const presets = data.presets.map(p => ({
    author_name:     p.author,
    name:            p.name,
    description:     p.description,
    long_description: p.longDescription,
    category:        p.category,
    file_name:       p.fileName,
    file_url:        p.downloadUrl,
    preview_gif_url: p.previewGif,
    file_size:       p.fileSize,
    ae_version:      p.aeVersion,
    tags:            p.tags,
    dependencies:    p.dependencies,
    is_approved:     true,   // auto-approve your official presets
    download_count:  0,
  }))

  // step 3: insert them all into supabase in one go
  const { data: inserted, error } = await supabase
    .from('presets')
    .insert(presets)

  if (error) {
    console.error('migration failed:', error)
  } else {
    console.log(`successfully inserted ${presets.length} presets!`)
  }
}

migrate()