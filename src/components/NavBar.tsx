import { Link } from 'react-router-dom'
import { Home, Upload, User, Hexagon } from 'lucide-react'
import './NavBar.css'

export function NavBar() {  

  return (
    <div className="navbar-wrapper">
      <div className="navbar-fade-mask" />
      
      <nav className="navbar-content">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo-container">
            <Hexagon size={22} className="navbar-logo-icon" />
          </div>
          <span>critterFX</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">
            <Home size={18} />
            <span>Home</span>
          </Link>
          <Link to="/upload" className="navbar-link">
            <Upload size={18} />
            <span>Upload</span>
          </Link>

            <Link to="/auth" className="navbar-link">
              <User size={18} />
              <span>Sign In</span>
            </Link>

        </div>
      </nav>
    </div>
  )
}