import { FileText, Download, Eye, Trash2, Edit, MoreVertical } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import type { Document } from "@/types/document"
import {
  getCategoryLabel,
  getCategoryColor,
  formatFileSize,
  getFileIcon,
  isPreviewSupported,
} from "@/types/document"
import { format } from "date-fns"

interface DocumentGridProps {
  documents: Document[]
  onView: (documentId: string) => void
  onDownload: (documentId: string) => void
  onEdit?: (documentId: string) => void
  onDelete?: (documentId: string) => void
}

export default function DocumentGrid({
  documents,
  onView,
  onDownload,
  onEdit,
  onDelete,
}: DocumentGridProps) {
  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No documents found</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {documents.map((doc) => (
        <Card
          key={doc.id}
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => onView(doc.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl">{getFileIcon(doc.mimeType)}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm truncate">{doc.name}</h3>
                    <p className="text-xs text-muted-foreground truncate">{doc.fileName}</p>
                  </div>
                </div>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {isPreviewSupported(doc.mimeType) && (
                      <DropdownMenuItem onClick={() => onView(doc.id)}>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onDownload(doc.id)}>
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    {onEdit && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit(doc.id)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                      </>
                    )}
                    {onDelete && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onDelete(doc.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="space-y-2">
              <Badge variant="outline" className={`${getCategoryColor(doc.category)} text-xs`}>
                {getCategoryLabel(doc.category)}
              </Badge>

              {doc.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{doc.description}</p>
              )}

              {doc.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {doc.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {doc.tags.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{doc.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
                <span>{formatFileSize(doc.fileSize)}</span>
                <span>{format(new Date(doc.uploadedAt), "MMM d, yyyy")}</span>
              </div>

              <div className="text-xs text-muted-foreground truncate">
                By {doc.uploadedByName || doc.uploadedBy}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
