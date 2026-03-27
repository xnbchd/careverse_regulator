import { useEffect, useState, type ReactNode } from "react"
import { RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Result } from "@/components/ui/result"
import { Spinner } from "@/components/ui/spinner"
import { useAuthStore } from "@/stores/authStore"

interface AuthProviderProps {
  children: ReactNode
}

const AUTH_TIMEOUT_MS = 10000 // 10 seconds

export default function AuthProvider({ children }: AuthProviderProps) {
  const { status, initialize } = useAuthStore()
  const [error, setError] = useState<Error | null>(null)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null
    let mounted = true

    const initializeAuth = async () => {
      try {
        setError(null)
        setTimedOut(false)

        // Set timeout
        timeoutId = setTimeout(() => {
          if (mounted && status === "loading") {
            setTimedOut(true)
          }
        }, AUTH_TIMEOUT_MS)

        await initialize()
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err : new Error("Authentication failed"))
        }
      } finally {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [initialize])

  const handleRetry = () => {
    setError(null)
    setTimedOut(false)
    initialize()
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Result
          status="error"
          title="Authentication Error"
          subTitle="Failed to initialize authentication. Please check your network connection and try again."
          extra={
            <Button onClick={handleRetry}>
              <RotateCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          }
        />
      </div>
    )
  }

  // Show timeout state
  if (timedOut) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <Result
          status="warning"
          title="Authentication Timeout"
          subTitle="Authentication is taking longer than expected. Please check your connection and try again."
          extra={
            <Button onClick={handleRetry}>
              <RotateCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          }
        />
      </div>
    )
  }

  // Show loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    )
  }

  // Auth complete, render children
  return <>{children}</>
}
