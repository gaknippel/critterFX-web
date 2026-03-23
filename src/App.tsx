import { RouterProvider } from 'react-router-dom'
import { router } from './router'
import './App.css'
import { UserProvider } from './context/UserContext'

export default function App() {
    return (
  <UserProvider>
  <RouterProvider router={router} />
  </UserProvider>
  )
}