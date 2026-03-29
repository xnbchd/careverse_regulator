import { useState } from "react"
import { FileText, Upload, Download, Eye, Trash2, Plus } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import DocumentUpload from "./DocumentUpload"
import DocumentPreview from "./DocumentPreview"
import { useDocumentStore } from "@/stores/documentStore"
import type { Document, DocumentCategory } from "@/types/document"
import { getCategoryLabel, getCategoryColor, formatFileSize, getFileIcon } from "@/types/document"
import { format } from "date-fns"

interface DocumentAttachmentsProps {
  title?: string
  documents: Document[]
  licenseNumber?: string
  affiliationId?: string
  inspectionId?: string
  applicationId?: string
  defaultCategory?: DocumentCategory
  onRefresh?: () => void
  allowUpload?: boolean
  allowDelete?: boolean
}

export default function DocumentAttachments({
  title = "Attached Documents",
  documents,
  licenseNumber,
  affiliationId,
  inspectionId,
  applicationId,
  defaultCategory,
  onRefresh,
  allowUpload = true,
  allowDelete = false,
}: DocumentAttachmentsProps) {
  const [uploadOpen, setUploadOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const { fetchDocument, selectedDocument, clearSelection, deleteDocument } = useDocumentStore()

  const handleView = async (documentId: string) => {
    await fetchDocument(documentId)
    setPreviewOpen(true)
  }

  const handleDownload = (document: Document) => {
    if (document.downloadUrl) {
      window.open(document.downloadUrl, "_blank")
    }
  }

  const handleDelete = async (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      await deleteDocument(documentId)
      if (onRefresh) onRefresh()
    }
  }

  const handleUploadComplete = () => {
    setUploadOpen(false)
    if (onRefresh) onRefresh()
  }

  const handleClosePreview = () => {
    setPreviewOpen(false)
    clearSelection()
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                {documents.length} {documents.length === 1 ? "document" : "documents"} attached
              </CardDescription>
            </div>
            {allowUpload && (
              <Button onClick={() => setUploadOpen(true)} size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No documents attached</p>
              {allowUpload && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => setUploadOpen(true)}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Document
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <span className="text-2xl shrink-0">{getFileIcon(doc.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <Badge
                        variant="outline"
                        className={`${getCategoryColor(doc.category)} text-xs shrink-0`}
                      >
                        {getCategoryLabel(doc.category)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(doc.fileSize)}</span>
                      <span>•</span>
                      <span>{format(new Date(doc.uploadedAt), "MMM d, yyyy")}</span>
                      <span>•</span>
                      <span className="truncate">{doc.uploadedByName || doc.uploadedBy}</span>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleView(doc.id)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDownload(doc)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    {allowDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>
              Add documents to this{" "}
              {licenseNumber
                ? "license"
                : affiliationId
                  ? "affiliation"
                  : inspectionId
                    ? "inspection"
                    : "application"}
            </DialogDescription>
          </DialogHeader>
          <DocumentUpload
            defaultCategory={defaultCategory}
            licenseNumber={licenseNumber}
            affiliationId={affiliationId}
            inspectionId={inspectionId}
            applicationId={applicationId}
            onUploadComplete={handleUploadComplete}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <DocumentPreview
        document={selectedDocument}
        open={previewOpen}
        onClose={handleClosePreview}
        onDownload={() => selectedDocument && handleDownload(selectedDocument)}
      />
    </>
  )
}
