import { useEffect } from "react"
import { useAuditStore } from "@/stores/auditStore"
import { format } from "date-fns"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  XCircle,
  Clock,
  User,
  Monitor,
  MapPin,
  Hash,
  FileText,
  History,
  X,
} from "lucide-react"
import {
  getActionLabel,
  getEntityLabel,
  getSeverityColor,
  getSeverityLabel,
  formatChangeValue,
} from "@/types/audit"
import { cn } from "@/lib/utils"
import type { AuditLog } from "@/types/audit"

interface AuditLogDetailProps {
  open: boolean
  onClose: () => void
}

export function AuditLogDetail({ open, onClose }: AuditLogDetailProps) {
  const { selectedLog, entityHistory, isLoadingHistory, fetchEntityHistory } = useAuditStore()

  // Fetch entity history when log is selected
  useEffect(() => {
    if (selectedLog?.entityId && selectedLog?.entity) {
      fetchEntityHistory(selectedLog.entity, selectedLog.entityId)
    }
  }, [selectedLog, fetchEntityHistory])

  if (!selectedLog) return null

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl mb-2">Audit Log Details</DialogTitle>
              <DialogDescription>
                Log ID: <span className="font-mono">{selectedLog.id}</span>
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-4">
          <TabsList>
            <TabsTrigger value="details">Details</TabsTrigger>
            {selectedLog.changesBefore || selectedLog.changesAfter ? (
              <TabsTrigger value="changes">Changes</TabsTrigger>
            ) : null}
            {selectedLog.entityId && (
              <TabsTrigger value="history">
                <History className="w-4 h-4 mr-1" />
                Entity History
              </TabsTrigger>
            )}
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Status Banner */}
            <div
              className={cn(
                "flex items-center gap-3 p-4 rounded-lg border",
                selectedLog.success
                  ? "bg-green-50 border-green-200 text-green-900"
                  : "bg-red-50 border-red-200 text-red-900"
              )}
            >
              {selectedLog.success ? (
                <CheckCircle className="w-6 h-6" />
              ) : (
                <XCircle className="w-6 h-6" />
              )}
              <div className="flex-1">
                <p className="font-semibold">
                  {selectedLog.success ? "Action Successful" : "Action Failed"}
                </p>
                <p className="text-sm opacity-80">{selectedLog.description}</p>
                {selectedLog.errorMessage && (
                  <p className="text-sm font-mono mt-1 bg-red-100 p-2 rounded">
                    {selectedLog.errorMessage}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn("text-sm", getSeverityColor(selectedLog.severity))}
              >
                {getSeverityLabel(selectedLog.severity)}
              </Badge>
            </div>

            {/* Action & Entity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Action</span>
                </div>
                <p className="text-lg font-semibold">{getActionLabel(selectedLog.action)}</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm font-medium">Entity</span>
                </div>
                <p className="text-lg font-semibold">{getEntityLabel(selectedLog.entity)}</p>
                {selectedLog.entityName && (
                  <p className="text-sm text-muted-foreground">{selectedLog.entityName}</p>
                )}
                {selectedLog.entityId && (
                  <p className="text-xs font-mono text-muted-foreground">
                    ID: {selectedLog.entityId}
                  </p>
                )}
              </div>
            </div>

            <Separator />

            {/* User Information */}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <User className="w-4 h-4" />
                <span className="text-sm font-medium">User Information</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Name</p>
                  <p className="font-medium">{selectedLog.userName}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Email</p>
                  <p className="font-medium">{selectedLog.userEmail}</p>
                </div>
                {selectedLog.userRole && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Role</p>
                    <p className="font-medium">{selectedLog.userRole}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">User ID</p>
                  <p className="font-mono text-sm">{selectedLog.userId}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Technical Details */}
            <div>
              <div className="flex items-center gap-2 text-muted-foreground mb-3">
                <Monitor className="w-4 h-4" />
                <span className="text-sm font-medium">Technical Details</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Timestamp</p>
                  </div>
                  <p className="font-mono text-sm">
                    {format(new Date(selectedLog.timestamp), "PPpp")}
                  </p>
                </div>
                {selectedLog.ipAddress && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">IP Address</p>
                    </div>
                    <p className="font-mono text-sm">{selectedLog.ipAddress}</p>
                  </div>
                )}
                {selectedLog.userAgent && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Monitor className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">User Agent</p>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground break-all">
                      {selectedLog.userAgent}
                    </p>
                  </div>
                )}
                {selectedLog.sessionId && (
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Hash className="w-3 h-3 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">Session ID</p>
                    </div>
                    <p className="font-mono text-sm">{selectedLog.sessionId}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Additional Details */}
            {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-3">Additional Details</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-xs font-mono overflow-x-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* Metadata */}
            {selectedLog.metadata && Object.keys(selectedLog.metadata).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-3">Metadata</p>
                  <div className="bg-muted p-4 rounded-lg">
                    <pre className="text-xs font-mono overflow-x-auto">
                      {JSON.stringify(selectedLog.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}
          </TabsContent>

          {/* Changes Tab */}
          {(selectedLog.changesBefore || selectedLog.changesAfter) && (
            <TabsContent value="changes" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Before Changes */}
                <div>
                  <p className="text-sm font-medium mb-3">Before</p>
                  {selectedLog.changesBefore ? (
                    <div className="border rounded-lg p-4 bg-red-50/50">
                      <div className="space-y-2">
                        {Object.entries(selectedLog.changesBefore).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground mb-1">{key}</p>
                            <p className="text-sm font-mono bg-background p-2 rounded border">
                              {formatChangeValue(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No previous state</p>
                  )}
                </div>

                {/* After Changes */}
                <div>
                  <p className="text-sm font-medium mb-3">After</p>
                  {selectedLog.changesAfter ? (
                    <div className="border rounded-lg p-4 bg-green-50/50">
                      <div className="space-y-2">
                        {Object.entries(selectedLog.changesAfter).map(([key, value]) => (
                          <div key={key}>
                            <p className="text-xs text-muted-foreground mb-1">{key}</p>
                            <p className="text-sm font-mono bg-background p-2 rounded border">
                              {formatChangeValue(value)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No new state</p>
                  )}
                </div>
              </div>

              {/* Changed Fields Summary */}
              {selectedLog.changesBefore && selectedLog.changesAfter && (
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-3">Changed Fields</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.keys({
                      ...(selectedLog.changesBefore || {}),
                      ...(selectedLog.changesAfter || {}),
                    }).map((field) => (
                      <Badge key={field} variant="secondary">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          )}

          {/* Entity History Tab */}
          {selectedLog.entityId && (
            <TabsContent value="history" className="space-y-4">
              {isLoadingHistory ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : entityHistory && entityHistory.logs.length > 0 ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {entityHistory.logs.length} events for this{" "}
                    {getEntityLabel(entityHistory.entityType).toLowerCase()}
                  </p>
                  <div className="space-y-3">
                    {entityHistory.logs.map((log) => (
                      <div
                        key={log.id}
                        className={cn(
                          "border rounded-lg p-4",
                          log.id === selectedLog.id && "border-primary bg-primary/5"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">{getActionLabel(log.action)}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(log.timestamp), "PPp")}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={cn("text-xs", getSeverityColor(log.severity))}
                          >
                            {getSeverityLabel(log.severity)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{log.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{log.userName}</span>
                          {log.success ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="w-3 h-3" />
                              Success
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-red-600">
                              <XCircle className="w-3 h-3" />
                              Failed
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No history available for this entity
                </p>
              )}
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
