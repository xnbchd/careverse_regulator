import { useState } from "react"
import { X, Download, ExternalLink } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Document } from "@/types/document"
import {
  getCategoryLabel,
  getCategoryColor,
  formatFileSize,
  isPreviewSupported,
} from "@/types/document"
import { format } from "date-fns"

interface DocumentPreviewProps {
  document: Document | null
  open: boolean
  onClose: () => void
  onDownload?: () => void
}

export default function DocumentPreview({
  document,
  open,
  onClose,
  onDownload,
}: DocumentPreviewProps) {
  const [imageError, setImageError] = useState(false)

  if (!document) return null

  const canPreview = isPreviewSupported(document.mimeType) && !imageError
  const isPDF = document.mimeType === "application/pdf"
  const isImage = document.mimeType.startsWith("image/")

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <DialogTitle className="text-lg">{document.name}</DialogTitle>
              <DialogDescription className="mt-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Badge variant="outline" className={getCategoryColor(document.category)}>
                    {getCategoryLabel(document.category)}
                  </Badge>
                  <span>•</span>
                  <span>{formatFileSize(document.fileSize)}</span>
                  <span>•</span>
                  <span>Uploaded {format(new Date(document.uploadedAt), "MMM d, yyyy")}</span>
                </div>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* Preview Area */}
          {canPreview ? (
            <div className="bg-muted rounded-lg p-4 min-h-[400px] flex items-center justify-center">
              {isPDF && document.previewUrl && (
                <iframe
                  src={document.previewUrl}
                  className="w-full h-[600px] border-0 rounded"
                  title={document.name}
                />
              )}
              {isImage && document.previewUrl && (
                <img
                  src={document.previewUrl}
                  alt={document.name}
                  className="max-w-full max-h-[600px] object-contain"
                  onError={() => setImageError(true)}
                />
              )}
            </div>
          ) : (
            <div className="bg-muted rounded-lg p-8 text-center min-h-[400px] flex flex-col items-center justify-center">
              <p className="text-muted-foreground mb-4">
                {imageError ? "Failed to load preview" : "Preview not available for this file type"}
              </p>
              <Button onClick={onDownload} variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download to View
              </Button>
            </div>
          )}

          {/* Document Details */}
          <div className="mt-4 space-y-3">
            {document.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{document.description}</p>
              </div>
            )}

            {document.tags.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-1">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {document.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">File Name</h4>
                <p className="text-muted-foreground">{document.fileName}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">File Size</h4>
                <p className="text-muted-foreground">{formatFileSize(document.fileSize)}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Uploaded By</h4>
                <p className="text-muted-foreground">
                  {document.uploadedByName || document.uploadedBy}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Uploaded At</h4>
                <p className="text-muted-foreground">
                  {format(new Date(document.uploadedAt), "PPP p")}
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Version</h4>
                <p className="text-muted-foreground">v{document.version}</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Last Modified</h4>
                <p className="text-muted-foreground">
                  {format(new Date(document.updatedAt), "PPP p")}
                </p>
              </div>
            </div>

            {/* Associations */}
            {(document.licenseNumber ||
              document.affiliationId ||
              document.inspectionId ||
              document.applicationId) && (
              <div>
                <h4 className="text-sm font-medium mb-1">Associated With</h4>
                <div className="flex flex-wrap gap-2">
                  {document.licenseNumber && (
                    <Badge variant="outline">License: {document.licenseNumber}</Badge>
                  )}
                  {document.affiliationId && (
                    <Badge variant="outline">Affiliation: {document.affiliationId}</Badge>
                  )}
                  {document.inspectionId && (
                    <Badge variant="outline">Inspection: {document.inspectionId}</Badge>
                  )}
                  {document.applicationId && (
                    <Badge variant="outline">Application: {document.applicationId}</Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t">
          {document.downloadUrl && (
            <Button variant="outline" onClick={onDownload} asChild>
              <a href={document.downloadUrl} download={document.fileName}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </a>
            </Button>
          )}
          {canPreview && document.previewUrl && (
            <Button variant="outline" asChild>
              <a href={document.previewUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open in New Tab
              </a>
            </Button>
          )}
          <Button onClick={onClose}>Close</Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
