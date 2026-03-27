import { AlertCircle, CheckCircle2, Info, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface ResultProps {
  status?: "success" | "error" | "info" | "warning" | "403" | "404" | "500"
  title: string
  subTitle?: string
  extra?: React.ReactNode
  children?: React.ReactNode
}

const statusConfig = {
  success: {
    icon: CheckCircle2,
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-950",
  },
  error: {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  info: {
    icon: Info,
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-950",
  },
  warning: {
    icon: AlertCircle,
    color: "text-yellow-500",
    bgColor: "bg-yellow-50 dark:bg-yellow-950",
  },
  "403": {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
  "404": {
    icon: AlertCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted/50 dark:bg-muted/50",
  },
  "500": {
    icon: XCircle,
    color: "text-red-500",
    bgColor: "bg-red-50 dark:bg-red-950",
  },
}

export function Result({ status = "info", title, subTitle, extra, children }: ResultProps) {
  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className={`rounded-full p-4 ${config.bgColor}`}>
          <Icon className={`w-12 h-12 ${config.color}`} />
        </div>
        <h2 className="text-xl font-semibold">{title}</h2>
        {subTitle && <p className="text-sm text-muted-foreground">{subTitle}</p>}
        {children}
        {extra && <div className="pt-2">{extra}</div>}
      </div>
    </Card>
  )
}
