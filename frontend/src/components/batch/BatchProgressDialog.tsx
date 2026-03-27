import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Loader2, CheckCircle, XCircle, Clock, X } from "lucide-react"
import { BatchOperation, BatchItemStatus, getBatchActionLabel } from "@/types/batch"
import { formatDuration } from "@/types/batch"
import { cn } from "@/lib/utils"

interface BatchProgressDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  operation: BatchOperation | null
  onCancel?: () => void
}

export function BatchProgressDialog({
  open,
  onOpenChange,
  operation,
  onCancel,
}: BatchProgressDialogProps) {
  if (!operation) return null

  const { progress } = operation
  const isRunning = operation.status === "running"
  const actionLabel = getBatchActionLabel(operation.type)

  const getItemIcon = (status: BatchItemStatus) => {
    switch (status) {
      case BatchItemStatus.SUCCESS:
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case BatchItemStatus.FAILED:
        return <XCircle className="w-4 h-4 text-red-600" />
      case BatchItemStatus.PROCESSING:
        return <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
      case BatchItemStatus.SKIPPED:
        return <X className="w-4 h-4 text-gray-600" />
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />
    }
  }

  const getItemStatusColor = (status: BatchItemStatus) => {
    switch (status) {
      case BatchItemStatus.SUCCESS:
        return "text-green-600"
      case BatchItemStatus.FAILED:
        return "text-red-600"
      case BatchItemStatus.PROCESSING:
        return "text-blue-600"
      case BatchItemStatus.SKIPPED:
        return "text-gray-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isRunning && <Loader2 className="w-5 h-5 animate-spin" />}
            {actionLabel} - In Progress
          </DialogTitle>
          <DialogDescription>Processing {progress.total} items. Please wait...</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress overview */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">
                {progress.processed} / {progress.total} ({Math.round(progress.percentage)}%)
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
          </div>

          {/* Status summary */}
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center p-3 border rounded-lg">
              <div className="flex items-center gap-1 text-green-600 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-lg font-semibold">{progress.succeeded}</span>
              </div>
              <span className="text-xs text-muted-foreground">Success</span>
            </div>
            <div className="flex flex-col items-center p-3 border rounded-lg">
              <div className="flex items-center gap-1 text-red-600 mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-lg font-semibold">{progress.failed}</span>
              </div>
              <span className="text-xs text-muted-foreground">Failed</span>
            </div>
            <div className="flex flex-col items-center p-3 border rounded-lg">
              <div className="flex items-center gap-1 text-gray-600 mb-1">
                <X className="w-4 h-4" />
                <span className="text-lg font-semibold">{progress.skipped}</span>
              </div>
              <span className="text-xs text-muted-foreground">Skipped</span>
            </div>
            <div className="flex flex-col items-center p-3 border rounded-lg">
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-lg font-semibold">{progress.total - progress.processed}</span>
              </div>
              <span className="text-xs text-muted-foreground">Pending</span>
            </div>
          </div>

          {/* Estimated time remaining */}
          {progress.estimatedTimeRemaining && isRunning && (
            <div className="text-sm text-center text-muted-foreground">
              Estimated time remaining: {formatDuration(progress.estimatedTimeRemaining)}
            </div>
          )}

          {/* Items list */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Items</span>
              {operation.items.length > 10 && (
                <span className="text-xs text-muted-foreground">
                  Showing recent {Math.min(10, operation.items.length)} items
                </span>
              )}
            </div>
            <ScrollArea className="h-[200px] border rounded-lg">
              <div className="p-3 space-y-2">
                {operation.items.slice(0, 10).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-2 rounded hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getItemIcon(item.status)}
                      <span className="text-sm truncate">{item.id}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getItemStatusColor(item.status))}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            {isRunning && onCancel && (
              <Button variant="destructive" onClick={onCancel} size="sm">
                Cancel Operation
              </Button>
            )}
            {!isRunning && (
              <Button onClick={() => onOpenChange(false)} size="sm">
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
