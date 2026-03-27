/**
 * Export Utilities for CSV and PDF generation
 */

// CSV Export
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    throw new Error("No data to export")
  }

  // Determine columns from data if not provided
  const cols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }))

  // Build CSV header
  const header = cols.map((col) => col.label).join(",")

  // Build CSV rows
  const rows = data.map((row) => {
    return cols
      .map((col) => {
        const value = row[col.key]
        // Handle null/undefined
        if (value === null || value === undefined) return ""
        // Escape quotes and wrap in quotes if contains comma or newline
        const stringValue = String(value)
        if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`
        }
        return stringValue
      })
      .join(",")
  })

  // Combine header and rows
  const csv = [header, ...rows].join("\n")

  // Create blob and download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)

  link.setAttribute("href", url)
  link.setAttribute("download", `${filename}.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// PDF Export (simple text-based approach without external dependencies)
export function exportToPDF<T extends Record<string, any>>(
  data: T[],
  filename: string,
  title: string,
  columns?: { key: keyof T; label: string }[]
) {
  if (data.length === 0) {
    throw new Error("No data to export")
  }

  // Determine columns from data if not provided
  const cols = columns || Object.keys(data[0]).map((key) => ({ key, label: key }))

  // Build HTML table
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 1cm;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 10pt;
      color: #333;
    }
    h1 {
      font-size: 18pt;
      margin-bottom: 10px;
      color: #1a1a1a;
    }
    .meta {
      font-size: 9pt;
      color: #666;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th {
      background-color: #f3f4f6;
      border: 1px solid #d1d5db;
      padding: 8px;
      text-align: left;
      font-weight: bold;
      font-size: 9pt;
    }
    td {
      border: 1px solid #e5e7eb;
      padding: 6px 8px;
      font-size: 9pt;
    }
    tr:nth-child(even) {
      background-color: #f9fafb;
    }
    .footer {
      margin-top: 20px;
      font-size: 8pt;
      color: #999;
      text-align: center;
    }
  </style>
</head>
<body>
  <h1>${title}</h1>
  <div class="meta">
    Generated on ${new Date().toLocaleString()} | Total Records: ${data.length}
  </div>
  <table>
    <thead>
      <tr>
        ${cols.map((col) => `<th>${col.label}</th>`).join("")}
      </tr>
    </thead>
    <tbody>
      ${data
        .map(
          (row) => `
        <tr>
          ${cols
            .map((col) => {
              const value = row[col.key]
              const displayValue = value === null || value === undefined ? "" : String(value)
              return `<td>${displayValue}</td>`
            })
            .join("")}
        </tr>
      `
        )
        .join("")}
    </tbody>
  </table>
  <div class="footer">
    Careverse Regulator Portal - Confidential Document
  </div>
</body>
</html>
  `

  // Create a new window and print
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Unable to open print window. Please check your popup blocker.")
  }

  printWindow.document.write(html)
  printWindow.document.close()

  // Wait for content to load, then print
  printWindow.onload = () => {
    printWindow.focus()
    printWindow.print()
  }
}

// Helper to format data for export
export function formatForExport<T extends Record<string, any>>(
  data: T[],
  transformations?: Partial<Record<keyof T, (value: any) => string>>
): T[] {
  if (!transformations) return data

  return data.map((row) => {
    const transformed = { ...row }
    Object.entries(transformations).forEach(([key, transform]) => {
      if (transform && key in transformed) {
        transformed[key as keyof T] = transform(transformed[key as keyof T]) as any
      }
    })
    return transformed
  })
}

// Export configuration type
export interface ExportConfig<T> {
  filename: string
  title: string
  columns: { key: keyof T; label: string }[]
  transformations?: Partial<Record<keyof T, (value: any) => string>>
}

// Unified export function
export function exportData<T extends Record<string, any>>(
  data: T[],
  format: "csv" | "pdf",
  config: ExportConfig<T>
) {
  const formattedData = formatForExport(data, config.transformations)

  if (format === "csv") {
    exportToCSV(formattedData, config.filename, config.columns)
  } else {
    exportToPDF(formattedData, config.filename, config.title, config.columns)
  }
}
