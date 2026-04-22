import './About.css'
import SplitText from '@/components/SplitText'
import { 
  Code2, 
  Heart, 
  Terminal,
  Cpu,
  Globe
} from 'lucide-react'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function About() {
  return (
    <div className="about-wrapper">
      <Card className="about-card">
        <CardHeader>
          <CardTitle>
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
          </CardTitle>
          <CardAction>
            <Badge variant="outline" className="about-version-badge">v1.0.0</Badge>
          </CardAction>
        </CardHeader>

        <CardContent className="about-card-content">
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

          <div className="about-stats">
            <div className="about-stat-item">
              <Terminal size={20} className="about-stat-icon" />
              <span className="about-stat-value">tauri</span>
              <span className="about-stat-label">rust backend</span>
            </div>
            <div className="about-stat-item">
              <Code2 size={20} className="about-stat-icon" />
              <span className="about-stat-value">react</span>
              <span className="about-stat-label">typescript</span>
            </div>
          </div>

          <div className="about-features-grid">
            <div className="about-feature-item">
              <Cpu size={24} className="mb-2 text-primary/80" />
              <h3>its fast!</h3>
              <p>native performance with rust</p>
            </div>
            <div className="about-feature-item">
              <Globe size={24} className="mb-2 text-primary/80" />
              <h3>its free!</h3>
              <p>I LOVE FREE STUFF! :D</p>
            </div>
            <div className="about-feature-item">
              <Heart size={24} className="mb-2 text-primary/80" />
              <h3>open source</h3>
              <p>made for the community!</p>
            </div>
          </div>
        </CardContent>

        <CardFooter className="about-card-footer">
          <p>made by crittercast</p>
        </CardFooter>
      </Card>
    </div>
  )
}
