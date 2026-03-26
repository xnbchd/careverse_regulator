import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { fetchLicenseComments, addLicenseComment, type LicenseComment } from '@/api/licenseCommentsApi'
import { toast } from 'sonner'

interface LicenseCommentsSectionProps {
  licenseNumber: string
}

export function LicenseCommentsSection({ licenseNumber }: LicenseCommentsSectionProps) {
  const [comments, setComments] = useState<LicenseComment[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)

  useEffect(() => {
    loadComments()
  }, [licenseNumber, page])

  const loadComments = async () => {
    try {
      setLoading(true)
      const response = await fetchLicenseComments(licenseNumber, page, 10)
      setComments(response.comments)
      setHasMore(response.pagination.has_next)
    } catch (error) {
      console.error('Failed to load comments:', error)
      toast.error('Failed to load comments')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitComment = async () => {
    if (!newComment.trim()) {
      toast.error('Please enter a comment')
      return
    }

    try {
      setSubmitting(true)
      await addLicenseComment(licenseNumber, newComment)
      toast.success('Comment added successfully')
      setNewComment('')
      // Reload comments
      setPage(1)
      loadComments()
    } catch (error) {
      console.error('Failed to add comment:', error)
      toast.error('Failed to add comment')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Comment */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-900 text-start block">
              Add Comment
            </label>
            <Textarea
              placeholder="Enter your comment here..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                size="sm"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Add Comment
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Comments List */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Comments ({comments.length})
        </h3>

        {loading && comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="flex items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : comments.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No comments yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                Be the first to add a comment
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {comments.map((comment) => (
              <Card key={comment.id}>
                <CardContent className="pt-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-gray-900">
                        {comment.created_by}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {comment.created_at}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap text-start">
                      {comment.comment}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More'}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
