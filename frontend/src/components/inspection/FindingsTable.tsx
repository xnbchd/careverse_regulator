import { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type RowSelectionState,
} from "@tanstack/react-table"
import type { Finding } from "@/stores/findingsStore"
import FindingsBadge from "./FindingsBadge"
import { EntityLink } from "@/components/entities/EntityLink"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"

interface FindingsTableProps {
  findings: Finding[]
  selectedRowKeys: React.Key[]
  onSelectionChange: (keys: React.Key[]) => void
  onViewFinding: (finding: Finding) => void
}

const columnHelper = createColumnHelper<Finding>()

export default function FindingsTable({
  findings,
  selectedRowKeys,
  onSelectionChange,
  onViewFinding,
}: FindingsTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Convert selectedRowKeys to row selection state
  const rowSelection = useMemo(() => {
    const selection: RowSelectionState = {}
    selectedRowKeys.forEach((key) => {
      const index = findings.findIndex((f) => f.id === key)
      if (index !== -1) {
        selection[index] = true
      }
    })
    return selection
  }, [selectedRowKeys, findings])

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        size: 40,
      }),
      columnHelper.accessor("findingId", {
        header: "Finding ID",
        cell: (info) => <span className="font-medium text-sm">{info.getValue()}</span>,
        size: 120,
      }),
      columnHelper.accessor("facilityName", {
        header: "Facility Name",
        cell: (info) => {
          const finding = info.row.original
          return finding.facilityId ? (
            <EntityLink
              type="facility"
              id={finding.facilityId}
              className="text-sm truncate block max-w-[180px] underline hover:no-underline"
            >
              {info.getValue()}
            </EntityLink>
          ) : (
            <span className="text-sm truncate block max-w-[180px]">{info.getValue()}</span>
          )
        },
        size: 200,
      }),
      columnHelper.accessor("category", {
        header: "Category",
        cell: (info) => (
          <span className="text-sm truncate block max-w-[160px]">{info.getValue()}</span>
        ),
        size: 180,
      }),
      columnHelper.accessor("severity", {
        header: "Severity",
        cell: (info) => <FindingsBadge severity={info.getValue()} />,
        size: 120,
      }),
      columnHelper.accessor("description", {
        header: "Description",
        cell: (info) => (
          <span className="text-sm text-muted-foreground truncate block max-w-[250px]">
            {info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => <FindingsBadge status={info.getValue()} />,
        size: 140,
      }),
      columnHelper.accessor("dueDate", {
        header: "Due Date",
        cell: (info) => <span className="text-sm">{info.getValue() || "-"}</span>,
        size: 120,
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: (info) => (
          <Button
            size="sm"
            onClick={() => onViewFinding(info.row.original)}
            className="h-8 whitespace-nowrap"
          >
            View
          </Button>
        ),
        size: 100,
      }),
    ],
    [onViewFinding]
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table API; not memoizable by design
  const table = useReactTable({
    data: findings,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
      const selectedIds = Object.keys(newSelection)
        .filter((key) => newSelection[key])
        .map((index) => findings[parseInt(index)]?.id)
        .filter(Boolean)
      onSelectionChange(selectedIds)
    },
    state: {
      pagination,
      rowSelection,
    },
    getRowId: (row) => row.id.toString(),
    enableRowSelection: true,
  })

  const totalPages = table.getPageCount()
  const currentPage = pagination.pageIndex + 1

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="table-fixed w-full">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      style={{ width: header.getSize() }}
                      className="whitespace-nowrap"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-muted/50 transition-colors cursor-pointer"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    <span className="text-muted-foreground">No results.</span>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {table.getRowModel().rows.length} of {findings.length} findings
          </p>
          <div className="flex items-center gap-2">
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(val) =>
                setPagination((prev) => ({ ...prev, pageSize: Number(val), pageIndex: 0 }))
              }
            >
              <SelectTrigger className="h-8 w-[100px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[10, 20, 50, 100].map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <span className="text-sm text-muted-foreground whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                disabled={!table.getCanNextPage()}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
