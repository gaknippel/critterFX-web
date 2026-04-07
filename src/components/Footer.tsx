import { Github, Coffee, Mail } from "lucide-react"
import "./Footer.css"

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        {/* Left: Links */}
        <div className="footer-links">
          <a
            href="https://github.com/gaknippel/critterFX-web"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a
            href="https://ko-fi.com/crittercast"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
            aria-label="Support on Ko-fi"
          >
            <Coffee size={18} />
          </a>
          <a
            href="mailto:crittercast@proton.me"
            className="footer-link"
            aria-label="Contact via Email"
          >
            <Mail size={18} />
          </a>
        </div>

        {/* Center: Copyright */}
        <div className="footer-center">
          <p className="footer-copy">
            &copy; {new Date().getFullYear()} crittercast
          </p>
        </div>

        {/* Right: Empty (for balance) */}
        <div className="footer-spacer" />
      </div>
    </footer>
  )
}
