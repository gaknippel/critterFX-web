import { Link } from 'react-router-dom'
import { useState, type ComponentType } from 'react'
import {
  ArrowRight,
  Download,
  FolderDown,
  Github,
  Layers,
  Search,
  Sparkles,
  UploadCloud,
} from 'lucide-react'
import './Landing.css'

const releaseUrl = 'https://github.com/gaknippel/critterFX/releases'
const sourceUrl = 'https://github.com/gaknippel/critterFX'

const featureDemos = [
  {
    title: 'browse presets',
    copy: 'find text animations, transitions, effects, scripts, and much more with dependencies, compatility info, and use instructions.',
    gif: '/landing-browse.webm',
    icon: Search,
  },
  {
    title: 'install in one click',
    copy: 'send presets straight into your After Effects folders with the desktop app.',
    gif: '/landing-install.webm',
    icon: FolderDown,
  },
  {
    title: 'share your work',
    copy: 'upload presets with your own style, if you just hate everything else.',
    gif: '/landing-upload.webm',
    icon: UploadCloud,
  },
]

function DownloadCta() {
  return (
    <div className="landing-download-cta">
      <a className="landing-primary-link" href={releaseUrl} target="_blank" rel="noreferrer">
        <Download size={18} />
        install desktop app
      </a>
      <span>windows 10+ (64 bit)</span>
    </div>
  )
}

type DemoMediaProps = {
  src: string
  alt: string
  label?: string
  icon: ComponentType<{ size?: number }>
  className: string
}

function DemoMedia({ src, alt, label, icon: Icon, className }: DemoMediaProps) {
  const [hasMedia, setHasMedia] = useState(true)
  const isVideo = src.endsWith('.webm')

  return (
    <div className={className}>
      {hasMedia && isVideo && (
        <video
          src={src}
          aria-label={alt}
          autoPlay
          loop
          muted
          playsInline
          onError={() => setHasMedia(false)}
        />
      )}
      {hasMedia && !isVideo && <img src={src} alt={alt} onError={() => setHasMedia(false)} />}
      {!hasMedia && (
        <div className="landing-media-fallback">
          <Icon size={28} />
          {label && <span>{label}</span>}
        </div>
      )}
    </div>
  )
}

export default function Landing() {
  return (
    <div className="landing-page">
      <section className="landing-hero">
        <div className="landing-hero-copy">
          <h1>every preset, script, and composition you need.</h1>
          <p>
            tired of terribly overpriced editing resources?
            critterFX is a free and open source platform to
            browse and upload your own presets, seamlessly installing them to After
            Effects with a stupid easy process.
          </p>
          <div className="landing-actions">
            <DownloadCta />
            <Link className="landing-secondary-link" to="/browse">
              browse presets
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>

        <div className="landing-hero-panel" aria-label="critterFX app preview">
          <div className="landing-window-bar">
            <span />
            <span />
            <span />
          </div>
          <DemoMedia
            src="/landing-hero.webm"
            alt="critterFX app preview"
            label="landing-hero.webm"
            icon={Sparkles}
            className="landing-preview-stage"
          />
        </div>
      </section>


      <section className="landing-feature-grid">
        {featureDemos.map(({ title, copy, gif, icon: Icon }) => (
          <article className="landing-feature" key={title}>
            <DemoMedia
              src={gif}
              alt={`${title} demo`}
              icon={Icon}
              className="landing-feature-media"
            />
            <div className="landing-feature-copy">
              <Icon size={18} />
              <h2>{title}</h2>
              <p>{copy}</p>
            </div>
          </article>
        ))}
      </section>

      <section className="landing-install-band">
        <div>
          <Layers size={22} />
          <h2>developer friendly!</h2>
          <p>
            check the github repo for the source code, API docs, and contribution guidelines. the desktop app is built with tauri and typescript, and the web platform is built with react.
          </p>
        </div>
        <div className="landing-install-actions">
          <a className="landing-secondary-link" href={sourceUrl} target="_blank" rel="noreferrer">
            <Github size={18} />
            source code
          </a>
        </div>
      </section>

      <section className="landing-ready-block">
        <h2>ready to try it?</h2>
        <p>install the desktop app for windows!</p>
        <div className="landing-ready-actions">
          <DownloadCta />
          <Link className="landing-secondary-link" to="/browse">
            browse presets
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </div>
  )
}
