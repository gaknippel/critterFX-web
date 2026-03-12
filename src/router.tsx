import { createBrowserRouter } from 'react-router-dom'
import Upload from './pages/Upload/Upload'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <div>temp home page</div>
  },
  {
    path: '/upload',
    element: <Upload />
  }
])