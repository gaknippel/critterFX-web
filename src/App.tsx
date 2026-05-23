import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './App.css'
import { UserProvider } from './context/UserContext'
import { Toaster } from './components/ui/sonner'
import { useUserContext } from './context/UserContext'



function AppContent() {
  const { isLoading } = useUserContext() //checks if the user is signed in, for loading flag


  //dont block the confirm page with loading screen, 
  // since the user is not signed in yet and we need to verify their email first. 
  const isConfrimPage = window.location.pathname === '/confirm' 

  if (isLoading && !isConfrimPage) {
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