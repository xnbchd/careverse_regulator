import { useState } from "react"
import { LayoutGrid, List, Upload as UploadIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useDocumentStore } from "@/stores/documentStore"
import DocumentUpload from "./DocumentUpload"
import DocumentList from "./DocumentList"
import DocumentGrid from "./DocumentGrid"
import DocumentFilters from "./DocumentFilters"
import DocumentPreview from "./DocumentPreview"
import { Card } from "@/components/ui/card"
import type { DocumentSearchParams } from "@/types/document"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function DocumentManagementView() {
  const {
    documents,
    loading,
    total,
    page,
    pageSize,
    totalPages,
    searchParams,
    fetchDocuments,
    setSearchParams,
    setPage,
    deleteDocument,
    selectedDocument,
    fetchDocument,
    clearSelection,
  } = useDocumentStore()

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const handleSearchChange = (params: Partial<DocumentSearchParams>) => {
    setSearchParams({ ...searchParams, ...params, page: 1 })
  }

  const handleClearFilters = () => {
    setSearchParams({
      page: 1,
      pageSize: 20,
      sortBy: "uploadedAt",
      sortOrder: "desc",
    })
  }

  const handleView = async (documentId: string) => {
    await fetchDocument(documentId)
    setPreviewOpen(true)
  }

  const handleDownload = (documentId: string) => {
    const doc = documents.find((d) => d.id === documentId)
    if (doc?.downloadUrl) {
      window.open(doc.downloadUrl, "_blank")
    }
  }

  const handleDelete = async (documentId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      await deleteDocument(documentId)
    }
  }

  const handleUploadComplete = () => {
    setUploadDialogOpen(false)
    fetchDocuments()
  }

  const handleClosePreview = () => {
    setPreviewOpen(false)
    clearSelection()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Document Management</h2>
          <p className="text-muted-foreground">Manage and organize all regulatory documents</p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <UploadIcon className="w-4 h-4 mr-2" />
          Upload Documents
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <DocumentFilters
          searchParams={searchParams}
          onSearchChange={handleSearchChange}
          onClearFilters={handleClearFilters}
        />
      </Card>

      {/* View Toggle and Stats */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total > 0 ? (
            <>
              Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}{" "}
              documents
            </>
          ) : (
            "No documents found"
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Document Display */}
      {loading && documents.length === 0 ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : viewMode === "grid" ? (
        <DocumentGrid
          documents={documents}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      ) : (
        <DocumentList
          documents={documents}
          onView={handleView}
          onDownload={handleDownload}
          onDelete={handleDelete}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" onClick={() => setPage(page - 1)} disabled={page === 1}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Documents</DialogTitle>
            <DialogDescription>Upload new documents to the system</DialogDescription>
          </DialogHeader>
          <DocumentUpload onUploadComplete={handleUploadComplete} />
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <DocumentPreview
        document={selectedDocument}
        open={previewOpen}
        onClose={handleClosePreview}
        onDownload={() => selectedDocument && handleDownload(selectedDocument.id)}
      />
    </div>
  )
}
