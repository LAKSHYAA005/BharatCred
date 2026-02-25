import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Applayout from './layout/Applayout'
import Home from './pages/Home.jsx'


const router = createBrowserRouter([
  {
    element: <Applayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}
 

export default App
