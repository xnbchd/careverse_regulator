import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { FileText, Download, Trash2, Loader2, Calendar, Eye, ChevronLeft } from "lucide-react"
import {
  createActivityReport,
  listActivityReports,
  viewActivityReportDetails,
  downloadActivityReport,
  deleteActivityReport,
} from "@/api/userManagementApi"
import { showSuccess, showError } from "@/utils/toast"
import { useUserStore } from "@/stores/userStore"
import type { UserActivityReport, ActivityReportDetail, PaginationInfo } from "@/types/user"

export default function ActivityReportSection() {
  const {
    activityReports,
    activityReportsPagination,
    isLoadingReports,
    setActivityReports,
    setLoadingReports,
  } = useUserStore()

  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [targetUser, setTargetUser] = useState("")
  const [generating, setGenerating] = useState(false)

  // Detail view state
  const [detailView, setDetailView] = useState<ActivityReportDetail | null>(null)
  const [detailPagination, setDetailPagination] = useState<PaginationInfo | null>(null)
  const [loadingDetail, setLoadingDetail] = useState(false)

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<UserActivityReport | null>(null)
  const [deleting, setDeleting] = useState(false)

  const loadReports = async (page = 1) => {
    setLoadingReports(true)
    try {
      const result = await listActivityReports({ page, page_size: 10 })
      setActivityReports(result.reports, result.pagination)
    } catch {
      showError("Failed to load activity reports")
      setLoadingReports(false)
    }
  }

  useEffect(() => {
    loadReports()
  }, [])

  const handleGenerate = async () => {
    if (!fromDate || !toDate) {
      showError("Please select both start and end dates")
      return
    }

    setGenerating(true)
    try {
      await createActivityReport({
        from_date: fromDate,
        to_date: toDate,
        target_user: targetUser.trim() || undefined,
      })
      showSuccess("Activity report generated successfully")
      loadReports()
    } catch (err: any) {
      showError(err?.message || "Failed to generate report")
    } finally {
      setGenerating(false)
    }
  }

  const handleViewDetail = async (report: UserActivityReport) => {
    setLoadingDetail(true)
    try {
      const result = await viewActivityReportDetails(report.name)
      setDetailView(result.report)
      setDetailPagination(result.pagination)
    } catch {
      showError("Failed to load report details")
    } finally {
      setLoadingDetail(false)
    }
  }

  const handleDownload = async (report: UserActivityReport) => {
    try {
      await downloadActivityReport(report.name)
      showSuccess("Report downloaded")
    } catch {
      showError("Failed to download report")
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteActivityReport(deleteTarget.name)
      showSuccess("Report deleted")
      setDeleteTarget(null)
      loadReports()
    } catch {
      showError("Failed to delete report")
    } finally {
      setDeleting(false)
    }
  }

  // Detail view
  if (detailView) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => setDetailView(null)} className="-ml-2">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Reports
        </Button>

        <div>
          <h3 className="text-lg font-semibold">{detailView.report_name}</h3>
          <p className="text-sm text-muted-foreground">
            {detailView.from_date} to {detailView.to_date} &middot; {detailView.total_events} events
          </p>
        </div>

        {detailView.users?.map((userGroup) => (
          <Card key={userGroup.user_id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                {userGroup.user_name}{" "}
                <span className="text-muted-foreground font-normal">({userGroup.user_id})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                        Date
                      </th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                        Time
                      </th>
                      <th className="text-left py-2 pr-4 font-medium text-muted-foreground">
                        Action
                      </th>
                      <th className="text-left py-2 font-medium text-muted-foreground">
                        IP Address
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {userGroup.activity_logs.map((log, idx) => (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="py-2 pr-4">{log.event_date}</td>
                        <td className="py-2 pr-4">{log.event_time}</td>
                        <td className="py-2 pr-4">{log.action}</td>
                        <td className="py-2 font-mono text-xs">{log.ip_address || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Generate Report */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            Generate Activity Report
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fromDate" className="text-xs">
                From Date
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="toDate" className="text-xs">
                To Date
              </Label>
              <Input
                id="toDate"
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="targetUser" className="text-xs">
                User (optional)
              </Label>
              <Input
                id="targetUser"
                value={targetUser}
                onChange={(e) => setTargetUser(e.target.value)}
                placeholder="e.g. user@example.com"
                className="w-56"
              />
            </div>
            <Button onClick={handleGenerate} disabled={generating || !fromDate || !toDate}>
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reports List */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Generated Reports</h3>
        {isLoadingReports ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="animate-pulse flex items-center gap-4">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-4 bg-muted rounded w-1/4" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : activityReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No activity reports generated yet.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {activityReports.map((report) => (
              <Card key={report.name}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{report.report_name}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {report.from_date} → {report.to_date}
                        </span>
                        <Badge
                          variant={report.status === "Completed" ? "outline" : "secondary"}
                          className={
                            report.status === "Completed"
                              ? "text-green-700 dark:text-green-400 border-green-500"
                              : ""
                          }
                        >
                          {report.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {report.total_events} events
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleViewDetail(report)}
                        disabled={loadingDetail}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDownload(report)}
                        disabled={report.status !== "Completed"}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(report)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {activityReportsPagination &&
              activityReportsPagination.count > activityReportsPagination.page_size && (
                <div className="flex justify-center gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activityReportsPagination.current_page <= 1}
                    onClick={() => loadReports(activityReportsPagination.current_page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-muted-foreground self-center">
                    Page {activityReportsPagination.current_page} of{" "}
                    {Math.ceil(
                      activityReportsPagination.count / activityReportsPagination.page_size
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={activityReportsPagination.end >= activityReportsPagination.count}
                    onClick={() => loadReports(activityReportsPagination.current_page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Activity Report</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{deleteTarget?.report_name}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)} disabled={deleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
