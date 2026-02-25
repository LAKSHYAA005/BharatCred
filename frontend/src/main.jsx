import React from 'react'
import ReactDOM from 'react-dom/client'

import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import './index.css'
  import App from './App.jsx'
  import { ClerkProvider } from '@clerk/clerk-react'
import { dark } from '@clerk/themes'

  // Import your Publishable Key
  const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
  
  console.log('All env vars:', {
    VITE_CLERK_PUBLISHABLE_KEY: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
    // Log other env vars to debug
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD,
  });

  if (!PUBLISHABLE_KEY) {
    console.error('Clerk key is missing. Current value:', PUBLISHABLE_KEY);
    throw new Error('Add your Clerk Publishable Key to the .env file')
  }

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <ClerkProvider 
      appearance={{
        theme: dark,
      }
      }
      publishableKey={PUBLISHABLE_KEY}>
        <App />
      </ClerkProvider>
    </StrictMode>,
  )