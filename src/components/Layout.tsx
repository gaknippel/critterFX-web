import { Outlet } from 'react-router-dom'
import { NavBar } from './NavBar'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <NavBar />
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}