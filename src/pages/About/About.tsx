import './About.css'
import SplitText from '@/components/SplitText'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { 
  Code2, 
  Heart, 
  Terminal,
  Cpu,
  Globe
} from 'lucide-react'

const faqItems = [
  {
    value: "item-1",
    trigger: "what is critterFX?",
    content:
      "critterFX is a hub for motion graphics presets, scripts, and editing tools. download cool stuff from here!",
  },
  {
    value: "item-2",
    trigger: "is it free to use?",
    content:
      "yes! most of the assets here are free for the community. i built this for everyone to share.",
  },
  {
    value: "item-3",
    trigger: "found a bug?",
    content:
      "there may be a decent amount of bugs! let me know via github or contact me by email! crittercast@proton.me",
  },
]

export default function About() {
  return (
    <div className="about-wrapper">
      {/* Header Section */}
      <div className="about-header">
        <div className="about-logo-wrapper">

        </div>

        <div className="about-header-info">
          <SplitText
            text="about this app:"
            className="about-title"
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
          <p className="about-subtitle">v1.0.0</p>
        </div>


      </div>

      <div className="about-stats">
        <div className="about-stat-card">
          <Terminal size={20} className="about-stat-icon" />
          <span className="about-stat-value">tauri</span>
          <span className="about-stat-label">rust backend</span>
        </div>
        <div className="about-stat-card">
          <Code2 size={20} className="about-stat-icon" />
          <span className="about-stat-value">react</span>
          <span className="about-stat-label">typescript</span>
        </div>
      </div>

      <div className="about-info-section">
        <div className="about-section-header">
          <h2 className="about-section-title flex items-center gap-2">
            my goal...
          </h2>
        </div>
        <div className="about-content">
          <p className="about-description">
            basically free shit for cool people who edit in AE
          </p>
        </div>
      </div>

      <div className="about-features-grid">
        <div className="about-feature-card">
          <Cpu size={24} className="mb-2 text-primary/80" />
          <h3>its fast!</h3>
          <p>native performance with rust</p>
        </div>
        <div className="about-feature-card">
          <Globe size={24} className="mb-2 text-primary/80" />
          <h3>its free!</h3>
          <p>I LOVE FREE STUFF! :D</p>
        </div>
        <div className="about-feature-card">
          <Heart size={24} className="mb-2 text-primary/80" />
          <h3>open source</h3>
          <p>made for the community!</p>
        </div>
      </div>


      <div className="about-footer">
        <p>made by crittercast</p>
      </div>
    </div>
  )
}
