import './App.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Applayout from './layout/Applayout'
import Home from './pages/Home.jsx'
import Results from './pages/Results.jsx'


const router = createBrowserRouter([
  {
    element: <Applayout />,
    children: [
      {
        path: '/',
        element: <Home />,
      },
      {
        path: '/results',
        element: <Results />,
      },
    ],
  },
])

function App() {
  return <RouterProvider router={router} />
}
 

export default App
