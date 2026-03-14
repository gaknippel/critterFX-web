import { createBrowserRouter } from 'react-router-dom'
import Upload from './pages/Upload/Upload'
import Auth from './pages/Auth/Auth'
import Home from './pages/Home/Home'
import PresetDetail from './pages/PresetDetail/PresetDetail'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Home />
  },
  {
    path: '/upload',
    element: <Upload />
  },
  {
    path: '/auth',
    element: <Auth />
  },
  {
    path: 'preset/:id',
    element: <PresetDetail />,
  },
])