import { useCallback, useState } from "react"
import { useDropzone } from "react-dropzone"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { X, Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"
import { useDocumentStore } from "@/stores/documentStore"
import {
  DocumentCategory,
  getCategoryLabel,
  formatFileSize,
  getFileIcon,
  SUPPORTED_FILE_TYPES,
  MAX_FILE_SIZE,
} from "@/types/document"
import type { DocumentUploadRequest } from "@/types/document"
import { cn } from "@/lib/utils"

interface DocumentUploadProps {
  defaultCategory?: DocumentCategory
  licenseNumber?: string
  affiliationId?: string
  inspectionId?: string
  applicationId?: string
  onUploadComplete?: () => void
  className?: string
}

export default function DocumentUpload({
  defaultCategory,
  licenseNumber,
  affiliationId,
  inspectionId,
  applicationId,
  onUploadComplete,
  className,
}: DocumentUploadProps) {
  const { uploadDocuments, uploads, uploading, clearUploadProgress, clearAllUploads } =
    useDocumentStore()

  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [category, setCategory] = useState<DocumentCategory>(
    defaultCategory || DocumentCategory.OTHER
  )
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Filter files by size
    const validFiles = acceptedFiles.filter((file) => {
      if (file.size > MAX_FILE_SIZE) {
        alert(`${file.name} is too large. Maximum file size is ${formatFileSize(MAX_FILE_SIZE)}`)
        return false
      }
      return true
    })

    setSelectedFiles((prev) => [...prev, ...validFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: SUPPORTED_FILE_TYPES,
    multiple: true,
  })

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    const requests: DocumentUploadRequest[] = selectedFiles.map((file) => ({
      file,
      category,
      description: description || undefined,
      tags: tags.length > 0 ? tags : undefined,
      licenseNumber,
      affiliationId,
      inspectionId,
      applicationId,
    }))

    await uploadDocuments(requests)

    // Clear form
    setSelectedFiles([])
    setDescription("")
    setTags([])

    if (onUploadComplete) {
      onUploadComplete()
    }
  }

  const uploadArray = Array.from(uploads.values())

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Upload Documents</CardTitle>
        <CardDescription>
          Upload files related to licenses, affiliations, inspections, or compliance
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Dropzone */}
        <div
          {...getRootProps()}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragActive
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-accent/50"
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          {isDragActive ? (
            <p className="text-sm font-medium">Drop files here...</p>
          ) : (
            <>
              <p className="text-sm font-medium mb-1">Drag & drop files here, or click to select</p>
              <p className="text-xs text-muted-foreground">
                Supported: PDF, Word, Excel, Images (max {formatFileSize(MAX_FILE_SIZE)})
              </p>
            </>
          )}
        </div>

        {/* Selected Files */}
        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label>Selected Files ({selectedFiles.length})</Label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {selectedFiles.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-accent rounded-md"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-lg">{getFileIcon(file.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeFile(index)}
                    className="shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category *</Label>
          <Select value={category} onValueChange={(val) => setCategory(val as DocumentCategory)}>
            <SelectTrigger id="category">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(DocumentCategory).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {getCategoryLabel(cat)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Add a description for these documents..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label htmlFor="tags">Tags</Label>
          <div className="flex gap-2">
            <Input
              id="tags"
              placeholder="Add tags (press Enter)"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addTag()
                }
              }}
            />
            <Button type="button" onClick={addTag} variant="outline">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Upload Progress */}
        {uploadArray.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Upload Progress</Label>
              <Button size="sm" variant="ghost" onClick={clearAllUploads} disabled={uploading}>
                Clear
              </Button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {uploadArray.map((upload) => {
                const fileId = `${upload.file.name}-${upload.file.lastModified}`
                return (
                  <div key={fileId} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {upload.status === "completed" && (
                          <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
                        )}
                        {upload.status === "error" && (
                          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                        )}
                        {upload.status === "uploading" && (
                          <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                        <span className="truncate">{upload.file.name}</span>
                      </div>
                      <span className="text-xs text-muted-foreground shrink-0">
                        {upload.status === "completed" && "Done"}
                        {upload.status === "error" && "Failed"}
                        {upload.status === "uploading" && `${upload.progress}%`}
                        {upload.status === "pending" && "Waiting"}
                      </span>
                    </div>
                    {upload.status === "uploading" && (
                      <Progress value={upload.progress} className="h-1" />
                    )}
                    {upload.status === "error" && (
                      <p className="text-xs text-red-600">{upload.error}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={selectedFiles.length === 0 || uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload {selectedFiles.length > 0 ? `${selectedFiles.length} file(s)` : "Documents"}
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
