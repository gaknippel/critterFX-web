import { Link } from 'react-router-dom'
import { Home, Upload, User } from 'lucide-react'

export function NavBar() {
  return (
    <nav className="w-full flex items-center justify-between p-4 bg-background/50 backdrop-blur-md border-b border-border z-50">
      <Link to="/" className="flex items-center gap-2 text-xl font-bold">
        critterFX
      </Link>
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
          <Home size={18} />
          <span>Home</span>
        </Link>
        <Link to="/upload" className="flex items-center gap-1 hover:text-primary transition-colors">
          <Upload size={18} />
          <span>Upload</span>
        </Link>
        <Link to="/auth" className="flex items-center gap-1 hover:text-primary transition-colors">
          <User size={18} />
          <span>Auth</span>
        </Link>
      </div>
    </nav>
  )
}