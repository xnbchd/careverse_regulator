import { useState } from "react"
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type ColumnFiltersState,
  type RowSelectionState,
} from "@tanstack/react-table"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EntityLink } from "@/components/entities"
import ExportButton from "@/components/shared/ExportButton"
import StatusBadge from "./StatusBadge"
import { PageHeader } from "@/components/shared/PageHeader"
import {
  Search,
  Users,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
} from "lucide-react"
import type { Affiliation } from "@/types/affiliation"
import type { ExportConfig } from "@/utils/exportUtils"
import dayjs from "dayjs"

const columns: ColumnDef<Affiliation>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        onClick={(e) => e.stopPropagation()}
      />
    ),
    enableSorting: false,
  },
  {
    id: "professionalName",
    accessorFn: (row) => row.healthProfessional.fullName,
    header: ({ column }) => <SortableHeader column={column} label="Professional" />,
    cell: ({ row }) => (
      <div className="font-medium">
        <EntityLink type="professional" id={row.original.healthProfessional.registrationNumber}>
          {row.original.healthProfessional.fullName}
        </EntityLink>
        {row.original.healthProfessional.professionalCadre && (
          <div className="text-xs text-muted-foreground mt-0.5">
            {row.original.healthProfessional.professionalCadre}
          </div>
        )}
      </div>
    ),
  },
  {
    id: "registrationNumber",
    accessorFn: (row) => row.healthProfessional.registrationNumber,
    header: ({ column }) => <SortableHeader column={column} label="Registration #" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.healthProfessional.registrationNumber}
      </span>
    ),
  },
  {
    id: "facilityName",
    accessorFn: (row) => row.healthFacility.facilityName,
    header: ({ column }) => <SortableHeader column={column} label="Facility" />,
    cell: ({ row }) => (
      <div>
        <EntityLink type="facility" id={row.original.healthFacility.registrationNumber}>
          {row.original.healthFacility.facilityName}
        </EntityLink>
        {row.original.healthFacility.facilityCode && (
          <div className="text-xs text-muted-foreground mt-0.5">
            Code: {row.original.healthFacility.facilityCode}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "role",
    header: ({ column }) => <SortableHeader column={column} label="Role" />,
    cell: ({ row }) => row.original.role || <span className="text-muted-foreground">—</span>,
    filterFn: "equals",
  },
  {
    accessorKey: "employmentType",
    header: ({ column }) => <SortableHeader column={column} label="Employment Type" />,
    cell: ({ row }) => <span className="capitalize">{row.original.employmentType || "—"}</span>,
    filterFn: "equals",
  },
  {
    accessorKey: "startDate",
    header: ({ column }) => <SortableHeader column={column} label="Start Date" />,
    cell: ({ row }) => row.original.startDate || <span className="text-muted-foreground">—</span>,
  },
  {
    accessorKey: "affiliationStatus",
    header: ({ column }) => <SortableHeader column={column} label="Status" />,
    cell: ({ row }) => <StatusBadge status={row.original.affiliationStatus} />,
    filterFn: "equals",
  },
  {
    id: "actions",
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => (
      <EntityLink type="professional" id={row.original.healthProfessional.registrationNumber}>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <Eye className="h-4 w-4 mr-1" />
          View
        </Button>
      </EntityLink>
    ),
    enableSorting: false,
  },
]

function SortableHeader({ column, label }: { column: any; label: string }) {
  const sorted = column.getIsSorted()
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3 h-8 font-medium"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ArrowUp className="ml-1 h-3.5 w-3.5" />
      ) : sorted === "desc" ? (
        <ArrowDown className="ml-1 h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" />
      )}
    </Button>
  )
}

function getUniqueValues(
  data: Affiliation[],
  accessor: (row: Affiliation) => string | undefined
): string[] {
  const values = new Set<string>()
  for (const row of data) {
    const val = accessor(row)
    if (val) values.add(val)
  }
  return Array.from(values).sort()
}

interface FlatAffiliation {
  professional: string
  registrationNumber: string
  facility: string
  role: string
  employmentType: string
  startDate: string
  status: string
}

function flattenForExport(affiliations: Affiliation[]): FlatAffiliation[] {
  return affiliations.map((a) => ({
    professional: a.healthProfessional.fullName,
    registrationNumber: a.healthProfessional.registrationNumber,
    facility: a.healthFacility.facilityName,
    role: a.role,
    employmentType: a.employmentType,
    startDate: a.startDate,
    status: a.affiliationStatus,
  }))
}

const affiliationExportConfig: ExportConfig<FlatAffiliation> = {
  filename: `affiliations-${dayjs().format("YYYY-MM-DD")}`,
  title: "Professional Affiliations Report",
  columns: [
    { key: "professional", label: "Professional" },
    { key: "registrationNumber", label: "Registration #" },
    { key: "facility", label: "Facility" },
    { key: "role", label: "Role" },
    { key: "employmentType", label: "Employment Type" },
    { key: "startDate", label: "Start Date" },
    { key: "status", label: "Status" },
  ],
}

interface AffiliationsListTableProps {
  affiliations: Affiliation[]
}

export default function AffiliationsListTable({ affiliations }: AffiliationsListTableProps) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  // eslint-disable-next-line react-hooks/incompatible-library -- TanStack Table API; not memoizable by design
  const table = useReactTable({
    data: affiliations,
    columns,
    state: { sorting, columnFilters, globalFilter, rowSelection },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 20 } },
  })

  const roles = getUniqueValues(affiliations, (r) => r.role)
  const employmentTypes = getUniqueValues(affiliations, (r) => r.employmentType)
  const statuses = getUniqueValues(affiliations, (r) => r.affiliationStatus)

  const activeFilterCount = columnFilters.length + (globalFilter ? 1 : 0)
  const selectedCount = Object.keys(rowSelection).length

  const clearAllFilters = () => {
    setColumnFilters([])
    setGlobalFilter("")
  }

  const exportData = flattenForExport(
    selectedCount > 0
      ? table.getSelectedRowModel().rows.map((r) => r.original)
      : table.getFilteredRowModel().rows.map((r) => r.original)
  )

  return (
    <div className="space-y-6">
      <PageHeader
        breadcrumbs={[
          { label: "Affiliations", href: "/affiliations" },
          { label: "Affiliations List" },
        ]}
        title="Professional Affiliations"
        subtitle={`Registry of ${affiliations.length} affiliation${affiliations.length !== 1 ? "s" : ""}${selectedCount > 0 ? ` (${selectedCount} selected)` : ""}`}
        actions={<ExportButton data={exportData} config={affiliationExportConfig} size="sm" />}
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search all columns..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-9"
          />
        </div>

        <FilterSelect
          placeholder="Role"
          options={roles}
          value={(table.getColumn("role")?.getFilterValue() as string) ?? ""}
          onChange={(val) => table.getColumn("role")?.setFilterValue(val || undefined)}
        />
        <FilterSelect
          placeholder="Employment"
          options={employmentTypes}
          value={(table.getColumn("employmentType")?.getFilterValue() as string) ?? ""}
          onChange={(val) => table.getColumn("employmentType")?.setFilterValue(val || undefined)}
        />
        <FilterSelect
          placeholder="Status"
          options={statuses}
          value={(table.getColumn("affiliationStatus")?.getFilterValue() as string) ?? ""}
          onChange={(val) => table.getColumn("affiliationStatus")?.setFilterValue(val || undefined)}
        />

        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-9">
            <X className="h-4 w-4 mr-1" />
            Clear ({activeFilterCount})
          </Button>
        )}
      </div>

      {/* Table */}
      <Card className="overflow-x-auto">
        <Table>
          <TableHeader className="pl-1">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header, idx) => (
                  <TableHead
                    key={header.id}
                    className={
                      idx === 0
                        ? "sticky left-0 z-10 bg-card"
                        : idx === 1
                          ? "sticky left-0 z-10 bg-card border-r border-border/70"
                          : undefined
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="pl-1">
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {activeFilterCount > 0
                        ? "No affiliations match your filters"
                        : "No affiliations found"}
                    </p>
                    {activeFilterCount > 0 && (
                      <Button variant="outline" size="sm" onClick={clearAllFilters}>
                        Clear Filters
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell, idx) => (
                    <TableCell
                      key={cell.id}
                      className={
                        idx === 0
                          ? "sticky left-0 z-10 bg-card"
                          : idx === 1
                            ? "sticky left-0 z-10 bg-card border-r border-border/70"
                            : undefined
                      }
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length}{" "}
          affiliations
          {table.getFilteredRowModel().rows.length !== affiliations.length &&
            ` (${affiliations.length} total)`}
        </p>
        <div className="flex items-center gap-2">
          <Select
            value={String(table.getState().pagination.pageSize)}
            onValueChange={(val) => table.setPageSize(Number(val))}
          >
            <SelectTrigger className="h-9 w-[100px]">
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
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-9 w-9 p-0"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function FilterSelect({
  placeholder,
  options,
  value,
  onChange,
}: {
  placeholder: string
  options: string[]
  value: string
  onChange: (val: string) => void
}) {
  return (
    <Select
      value={value || "__all__"}
      onValueChange={(val) => onChange(val === "__all__" ? "" : val)}
    >
      <SelectTrigger className="h-9 w-[150px]">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="__all__">All {placeholder}s</SelectItem>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
