import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import "dayjs/locale/en"
import "leaflet/dist/leaflet.css"
import "./index.css"
import { router } from "./router"
import AuthProvider from "./components/AuthProvider"
import { RouterErrorBoundary } from "./components/RouterErrorBoundary"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "sonner"

const rootElement = document.getElementById("root")
if (!rootElement) {
  throw new Error("Root element not found")
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterErrorBoundary>
      <AuthProvider>
        <TooltipProvider>
          <RouterProvider router={router} />
          <Toaster richColors theme="system" position="bottom-right" closeButton duration={4000} />
        </TooltipProvider>
      </AuthProvider>
    </RouterErrorBoundary>
  </StrictMode>
)
