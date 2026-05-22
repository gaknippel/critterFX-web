import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './App.css'
import { UserProvider } from './context/UserContext'
import { Toaster } from './components/ui/sonner'
import { useUserContext } from './context/UserContext'



function AppContent() {
  const { isLoading } = useUserContext() //checks if the user is signed in, for loading flag

  if (isLoading) {
    return (
      <>
        <div className="app-loading">
          <div className="app-loading-content">
            <img src="/critterFX.png" alt="critterFX Logo" className="loading-logo" />
            <p className="loading-text">loading...be patient :3</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="app-content">
      <Toaster />
      <RouterProvider router={router} />
    </div>
  )
}

export default function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  )
}