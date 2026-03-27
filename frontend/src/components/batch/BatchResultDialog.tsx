import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, XCircle, AlertTriangle, Undo2, Download } from "lucide-react"
import { BatchOperationResult, getBatchActionLabel, formatDuration } from "@/types/batch"
import { cn } from "@/lib/utils"

interface BatchResultDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  result: BatchOperationResult | null
  onUndo?: () => void
  onRetryFailed?: () => void
  onExport?: () => void
}

export function BatchResultDialog({
  open,
  onOpenChange,
  result,
  onUndo,
  onRetryFailed,
  onExport,
}: BatchResultDialogProps) {
  if (!result) return null

  const hasFailures = result.failed > 0
  const hasSuccesses = result.succeeded > 0
  const isPartialSuccess = hasSuccesses && hasFailures

  const successItems = result.items.filter((item) => item.success)
  const failedItems = result.items.filter((item) => !item.success)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {result.success && <CheckCircle className="w-5 h-5 text-green-600" />}
            {isPartialSuccess && <AlertTriangle className="w-5 h-5 text-orange-600" />}
            {!hasSuccesses && <XCircle className="w-5 h-5 text-red-600" />}
            Batch Operation{" "}
            {result.success ? "Completed" : isPartialSuccess ? "Partially Completed" : "Failed"}
          </DialogTitle>
          <DialogDescription>
            Operation completed in {formatDuration(result.duration)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Result summary */}
          {isPartialSuccess && (
            <Alert variant="default" className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-900">
                The operation completed with some failures. {result.succeeded} items succeeded, but{" "}
                {result.failed} items failed.
              </AlertDescription>
            </Alert>
          )}

          {!hasSuccesses && hasFailures && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>
                All items failed to process. Please review the errors below and try again.
              </AlertDescription>
            </Alert>
          )}

          {result.success && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-900">
                All {result.succeeded} items were processed successfully!
              </AlertDescription>
            </Alert>
          )}

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-3">
            <div className="flex flex-col items-center p-3 border rounded-lg">
              <span className="text-2xl font-bold">{result.total}</span>
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <div className="flex flex-col items-center p-3 border rounded-lg border-green-200 bg-green-50">
              <span className="text-2xl font-bold text-green-600">{result.succeeded}</span>
              <span className="text-xs text-muted-foreground">Success</span>
            </div>
            <div className="flex flex-col items-center p-3 border rounded-lg border-red-200 bg-red-50">
              <span className="text-2xl font-bold text-red-600">{result.failed}</span>
              <span className="text-xs text-muted-foreground">Failed</span>
            </div>
            <div className="flex flex-col items-center p-3 border rounded-lg">
              <span className="text-2xl font-bold">{result.skipped}</span>
              <span className="text-xs text-muted-foreground">Skipped</span>
            </div>
          </div>

          {/* Items tabs */}
          <Tabs defaultValue={hasFailures ? "failed" : "success"} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="success" disabled={successItems.length === 0}>
                Successful ({result.succeeded})
              </TabsTrigger>
              <TabsTrigger value="failed" disabled={failedItems.length === 0}>
                Failed ({result.failed})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="success" className="mt-4">
              <ScrollArea className="h-[200px] border rounded-lg">
                <div className="p-3 space-y-2">
                  {successItems.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex items-center gap-2 p-2 rounded hover:bg-muted/50"
                    >
                      <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm flex-1">{item.itemId}</span>
                      <Badge variant="outline" className="text-xs text-green-600">
                        Success
                      </Badge>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="failed" className="mt-4">
              <ScrollArea className="h-[200px] border rounded-lg">
                <div className="p-3 space-y-2">
                  {failedItems.map((item) => (
                    <div
                      key={item.itemId}
                      className="flex flex-col gap-1 p-2 rounded hover:bg-muted/50"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600 shrink-0" />
                        <span className="text-sm flex-1">{item.itemId}</span>
                        <Badge variant="outline" className="text-xs text-red-600">
                          Failed
                        </Badge>
                      </div>
                      {item.error && (
                        <p className="text-xs text-red-600 ml-6 pl-0.5">{item.error}</p>
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex gap-2">
            {result.canUndo && onUndo && (
              <Button variant="outline" size="sm" onClick={onUndo} className="gap-2">
                <Undo2 className="w-4 h-4" />
                Undo Operation
              </Button>
            )}
            {hasFailures && onRetryFailed && (
              <Button variant="outline" size="sm" onClick={onRetryFailed}>
                Retry Failed Items
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {onExport && (
              <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
                <Download className="w-4 h-4" />
                Export Report
              </Button>
            )}
            <Button onClick={() => onOpenChange(false)} size="sm">
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
