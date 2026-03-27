import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react"
import { exportData, type ExportConfig } from "@/utils/exportUtils"
import { toast } from "sonner"

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[]
  config: ExportConfig<T>
  disabled?: boolean
  size?: "default" | "sm" | "lg" | "icon"
  variant?: "default" | "outline" | "secondary" | "ghost"
}

export default function ExportButton<T extends Record<string, any>>({
  data,
  config,
  disabled = false,
  size = "default",
  variant = "outline",
}: ExportButtonProps<T>) {
  const [exporting, setExporting] = useState(false)

  const handleExport = async (format: "csv" | "pdf") => {
    if (data.length === 0) {
      toast.error("There is no data available to export.")
      return
    }

    setExporting(true)

    try {
      exportData(data, format, config)
      toast.success(`Your data has been exported as ${format.toUpperCase()}.`)
    } catch (error: any) {
      console.error("Export failed:", error)
      toast.error(error.message || "Failed to export data. Please try again.")
    } finally {
      setExporting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={variant}
          size={size}
          disabled={disabled || exporting || data.length === 0}
          className="gap-2"
        >
          {exporting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Exporting...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>Export</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleExport("csv")}
          disabled={exporting}
          className="cursor-pointer"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export as CSV
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleExport("pdf")}
          disabled={exporting}
          className="cursor-pointer"
        >
          <FileText className="w-4 h-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
