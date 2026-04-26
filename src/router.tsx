import { createBrowserRouter } from 'react-router-dom'
import Upload from './pages/Upload/Upload'
import Auth from './pages/Auth/Auth'
import Home from '@/pages/Home/home'
import Profile from './pages/Profile/Profile'
import PresetDetail from './pages/PresetDetail/PresetDetail'
import About from './pages/About/About'
import Confirm from './pages/Confirm/Confirm'
import { Layout } from './components/Layout'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'upload',
        element: <Upload />
      },
      {
        path: 'about',
        element: <About />,
      },
      {
        path: 'auth',
        element: <Auth />
      },
      {
        path: 'preset/:id',
        element: <PresetDetail />,
      },
      {
        path: 'profile',
        element: <Profile />
      },
      {
        path: 'profile/:id',
        element: <Profile />,
      },
      {
        path: 'confirm',
        element: <Confirm />,
      }
    ]
  }
])