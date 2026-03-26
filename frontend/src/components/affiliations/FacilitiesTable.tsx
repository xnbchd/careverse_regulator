import { useState } from 'react'
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
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { EntityLink } from '@/components/entities'
import ExportButton from '@/components/shared/ExportButton'
import { Search, Building2, ArrowLeft, ArrowUpDown, ArrowUp, ArrowDown, Eye, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'
import type { FacilityRecord } from '@/api/registryApi'
import type { ExportConfig } from '@/utils/exportUtils'
import dayjs from 'dayjs'

const columns: ColumnDef<FacilityRecord>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
    accessorKey: 'facility_name',
    header: ({ column }) => <SortableHeader column={column} label="Facility Name" />,
    cell: ({ row }) => (
      <div className="font-medium">
        <EntityLink type="facility" id={row.original.registration_number}>
          {row.original.facility_name}
        </EntityLink>
      </div>
    ),
  },
  {
    accessorKey: 'facility_code',
    header: ({ column }) => <SortableHeader column={column} label="Code" />,
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.facility_code || '—'}</span>
    ),
  },
  {
    accessorKey: 'registration_number',
    header: ({ column }) => <SortableHeader column={column} label="Registration #" />,
    cell: ({ row }) => <span className="font-mono text-sm">{row.original.registration_number}</span>,
  },
  {
    accessorKey: 'facility_category',
    header: ({ column }) => <SortableHeader column={column} label="Category" />,
    cell: ({ row }) => row.original.facility_category || <span className="text-muted-foreground">—</span>,
    filterFn: 'equals',
  },
  {
    accessorKey: 'facility_type',
    header: ({ column }) => <SortableHeader column={column} label="Type" />,
    cell: ({ row }) => row.original.facility_type || <span className="text-muted-foreground">—</span>,
    filterFn: 'equals',
  },
  {
    accessorKey: 'keph_level',
    header: ({ column }) => <SortableHeader column={column} label="KEPH Level" />,
    cell: ({ row }) =>
      row.original.keph_level ? (
        <Badge variant="outline">{row.original.keph_level}</Badge>
      ) : (
        <span className="text-muted-foreground">—</span>
      ),
    filterFn: 'equals',
  },
  {
    accessorKey: 'county',
    header: ({ column }) => <SortableHeader column={column} label="County" />,
    cell: ({ row }) => row.original.county || <span className="text-muted-foreground">—</span>,
    filterFn: 'equals',
  },
  {
    accessorKey: 'owner',
    header: ({ column }) => <SortableHeader column={column} label="Owner" />,
    cell: ({ row }) => (
      <span className="max-w-[160px] truncate block">{row.original.owner || '—'}</span>
    ),
  },
  {
    accessorKey: 'open_whole_day',
    header: '24hr',
    cell: ({ row }) =>
      row.original.open_whole_day ? (
        <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-950/40 dark:text-green-400">Yes</Badge>
      ) : (
        <span className="text-muted-foreground">No</span>
      ),
    enableSorting: false,
  },
  {
    id: 'actions',
    header: () => <span className="sr-only">Actions</span>,
    cell: ({ row }) => <ViewAction type="facility" id={row.original.registration_number} />,
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
      onClick={() => column.toggleSorting(sorted === 'asc')}
    >
      {label}
      {sorted === 'asc' ? (
        <ArrowUp className="ml-1 h-3.5 w-3.5" />
      ) : sorted === 'desc' ? (
        <ArrowDown className="ml-1 h-3.5 w-3.5" />
      ) : (
        <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-muted-foreground/50" />
      )}
    </Button>
  )
}

function ViewAction({ type, id }: { type: string; id: string }) {
  return (
    <EntityLink type={type as any} id={id}>
      <Button variant="ghost" size="sm" className="h-8 px-2">
        <Eye className="h-4 w-4 mr-1" />
        View
      </Button>
    </EntityLink>
  )
}

function getUniqueValues(data: FacilityRecord[], key: keyof FacilityRecord): string[] {
  const values = new Set<string>()
  for (const row of data) {
    const val = row[key]
    if (val && typeof val === 'string') values.add(val)
  }
  return Array.from(values).sort()
}

const facilityExportConfig: ExportConfig<FacilityRecord> = {
  filename: `health-facilities-${dayjs().format('YYYY-MM-DD')}`,
  title: 'Health Facilities Report',
  columns: [
    { key: 'facility_name', label: 'Facility Name' },
    { key: 'facility_code', label: 'Code' },
    { key: 'registration_number', label: 'Registration #' },
    { key: 'facility_category', label: 'Category' },
    { key: 'facility_type', label: 'Type' },
    { key: 'keph_level', label: 'KEPH Level' },
    { key: 'county', label: 'County' },
    { key: 'owner', label: 'Owner' },
  ],
}

interface FacilitiesTableProps {
  facilities: FacilityRecord[]
}

export default function FacilitiesTable({ facilities }: FacilitiesTableProps) {
  const navigate = useNavigate()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [globalFilter, setGlobalFilter] = useState('')
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})

  const table = useReactTable({
    data: facilities,
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

  const categories = getUniqueValues(facilities, 'facility_category')
  const types = getUniqueValues(facilities, 'facility_type')
  const counties = getUniqueValues(facilities, 'county')
  const kephLevels = getUniqueValues(facilities, 'keph_level')

  const activeFilterCount = columnFilters.length + (globalFilter ? 1 : 0)
  const selectedCount = Object.keys(rowSelection).length

  const clearAllFilters = () => {
    setColumnFilters([])
    setGlobalFilter('')
  }

  const exportData = selectedCount > 0
    ? table.getSelectedRowModel().rows.map((r) => r.original)
    : table.getFilteredRowModel().rows.map((r) => r.original)

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/affiliations' })}
        className="-ml-2"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Dashboard
      </Button>

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Health Facilities</h2>
          <p className="text-muted-foreground mt-1">
            Registry of {facilities.length} health facilities
            {selectedCount > 0 && <span className="ml-1">({selectedCount} selected)</span>}
          </p>
        </div>
        <ExportButton data={exportData} config={facilityExportConfig} size="default" />
      </div>

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
          placeholder="Category"
          options={categories}
          value={(table.getColumn('facility_category')?.getFilterValue() as string) ?? ''}
          onChange={(val) => table.getColumn('facility_category')?.setFilterValue(val || undefined)}
        />
        <FilterSelect
          placeholder="Type"
          options={types}
          value={(table.getColumn('facility_type')?.getFilterValue() as string) ?? ''}
          onChange={(val) => table.getColumn('facility_type')?.setFilterValue(val || undefined)}
        />
        <FilterSelect
          placeholder="County"
          options={counties}
          value={(table.getColumn('county')?.getFilterValue() as string) ?? ''}
          onChange={(val) => table.getColumn('county')?.setFilterValue(val || undefined)}
        />
        <FilterSelect
          placeholder="KEPH Level"
          options={kephLevels}
          value={(table.getColumn('keph_level')?.getFilterValue() as string) ?? ''}
          onChange={(val) => table.getColumn('keph_level')?.setFilterValue(val || undefined)}
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
                    className={idx === 0 ? 'sticky left-0 z-10 bg-card' : idx === 1 ? 'sticky left-0 z-10 bg-card border-r border-border/70' : undefined}
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
                    <Building2 className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {activeFilterCount > 0 ? 'No facilities match your filters' : 'No facilities found'}
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
                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                  {row.getVisibleCells().map((cell, idx) => (
                    <TableCell
                      key={cell.id}
                      className={idx === 0 ? 'sticky left-0 z-10 bg-card' : idx === 1 ? 'sticky left-0 z-10 bg-card border-r border-border/70' : undefined}
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
          Showing {table.getRowModel().rows.length} of {table.getFilteredRowModel().rows.length} facilities
          {table.getFilteredRowModel().rows.length !== facilities.length &&
            ` (${facilities.length} total)`}
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
    <Select value={value || '__all__'} onValueChange={(val) => onChange(val === '__all__' ? '' : val)}>
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
