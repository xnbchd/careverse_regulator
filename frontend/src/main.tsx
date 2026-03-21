import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import 'dayjs/locale/en'
import './index.css'
import { router } from './router'
import AuthProvider from './components/AuthProvider'
import { RouterErrorBoundary } from './components/RouterErrorBoundary'
import { TooltipProvider } from "@/components/ui/tooltip"

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element not found')
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
        </TooltipProvider>
      </AuthProvider>
    </RouterErrorBoundary>
  </StrictMode>,
)
