import { useMemo, useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  createColumnHelper,
  flexRender,
  type RowSelectionState,
} from "@tanstack/react-table"
import type { Inspection } from "@/types/inspection"
import StatusBadge from "./StatusBadge"
import dayjs from "dayjs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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

import { EntityLink } from "@/components/entities"

interface InspectionTableProps {
  inspections: Inspection[]
  selectedRowKeys: React.Key[]
  onSelectionChange: (keys: React.Key[]) => void
  onViewInspection: (inspection: Inspection) => void
}

function isInspectionOverdue(inspection: Inspection): boolean {
  if (inspection.status !== "Pending") return false
  const today = dayjs().startOf("day")
  const inspectionDate = dayjs(inspection.date, "DD/MM/YYYY")
  return inspectionDate.isBefore(today)
}

const columnHelper = createColumnHelper<Inspection>()

export default function InspectionTable({
  inspections,
  selectedRowKeys,
  onSelectionChange,
  onViewInspection,
}: InspectionTableProps) {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  // Convert selectedRowKeys to row selection state
  const rowSelection = useMemo(() => {
    const selection: RowSelectionState = {}
    selectedRowKeys.forEach((key) => {
      const index = inspections.findIndex((i) => i.id === key)
      if (index !== -1) {
        selection[index] = true
      }
    })
    return selection
  }, [selectedRowKeys, inspections])

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
      columnHelper.accessor("inspectionId", {
        header: "Inspection ID",
        cell: (info) => <span className="font-medium text-sm">{info.getValue()}</span>,
        size: 150,
      }),
      columnHelper.accessor("facilityName", {
        header: "Facility Name",
        cell: (info) => (
          <EntityLink
            type="facility"
            id={info.row.original.facilityId}
            className="text-sm truncate block max-w-[200px]"
          >
            {info.getValue()}
          </EntityLink>
        ),
      }),
      columnHelper.accessor("date", {
        header: "Date",
        cell: (info) => <span className="text-sm">{info.getValue()}</span>,
        size: 120,
      }),
      columnHelper.accessor("inspectorName", {
        header: "Inspector",
        cell: (info) => (
          <span className="text-sm truncate block max-w-[150px]">{info.getValue() || "-"}</span>
        ),
        size: 150,
      }),
      columnHelper.accessor("noteToInspector", {
        header: "Note to Inspector",
        cell: (info) => (
          <span className="text-sm text-muted-foreground truncate block max-w-[200px]">
            {info.getValue() || "-"}
          </span>
        ),
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => {
          const inspection = info.row.original
          if (isInspectionOverdue(inspection)) {
            return (
              <Badge variant="destructive" className="gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0" />
                Overdue
              </Badge>
            )
          }
          return <StatusBadge status={info.getValue()} />
        },
        size: 130,
      }),
      columnHelper.display({
        id: "action",
        header: "Action",
        cell: (info) => (
          <Button
            size="sm"
            onClick={() => onViewInspection(info.row.original)}
            className="h-8 whitespace-nowrap"
          >
            View
          </Button>
        ),
        size: 100,
      }),
    ],
    [onViewInspection]
  )

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table API; not memoizable by design
  const table = useReactTable({
    data: inspections,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onRowSelectionChange: (updater) => {
      const newSelection = typeof updater === "function" ? updater(rowSelection) : updater
      const selectedIds = Object.keys(newSelection)
        .filter((key) => newSelection[key])
        .map((index) => inspections[parseInt(index)]?.id)
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
            Showing {table.getRowModel().rows.length} of {inspections.length} inspections
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
