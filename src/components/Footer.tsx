import { Github, Coffee, Mail } from "lucide-react"

export function Footer() {
  return (
    <footer className="w-full py-4 px-6 border-t border-border bg-background/50 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-3 items-center">
        {/* Left: Links */}
        <div className="flex items-center gap-6">
          <a
            href="https://github.com/gaknippel/critterFX-web"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub"
          >
            <Github size={18} />
          </a>
          <a
            href="https://ko-fi.com/crittercast"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Support on Ko-fi"
          >
            <Coffee size={18} />
          </a>
          <a
            href="mailto:gaknippel@hotmail.com"
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Contact via Email"
          >
            <Mail size={18} />
          </a>
        </div>

        {/* Center: Copyright */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground whitespace-nowrap">
            &copy; {new Date().getFullYear()} greyson knippel
          </p>
        </div>

        {/* Right: Empty (for balance) */}
        <div />
      </div>
    </footer>
  )
}