import { Component, type ReactNode } from "react"
import { RotateCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Result } from "@/components/ui/result"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class RouterErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Router error:", error, errorInfo)
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-6">
          <Result
            status="error"
            title="Application Error"
            subTitle="An unexpected error occurred. Please reload the page to continue."
            extra={
              <Button onClick={this.handleReload}>
                <RotateCw className="w-4 h-4 mr-2" />
                Reload Page
              </Button>
            }
          />
        </div>
      )
    }

    return this.props.children
  }
}
