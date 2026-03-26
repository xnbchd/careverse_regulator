import { useState, useRef, useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import {
  MetricCard,
  StatusDistribution,
  PrioritySection,
  QuickActions,
} from '@/components/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Clock,
  XCircle,
  Users,
  Building2,
  UserRound,
  Briefcase,
  ShieldCheck,
  UserCheck,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import dayjs from 'dayjs'
import type { AffiliationDashboardStats } from '@/api/affiliationApi'
import { getRouteApi } from '@tanstack/react-router'

const routeApi = getRouteApi('/affiliations/')

export function AffiliationsDashboard() {
  const navigate = useNavigate()
  const dashboardData = routeApi.useLoaderData() as AffiliationDashboardStats

  const quickActions = [
    {
      label: 'View All Affiliations',
      onClick: () => navigate({ to: '/affiliations/list' }),
      variant: 'default' as const,
      icon: Users,
    },
    {
      label: 'View Pending',
      onClick: () => navigate({ to: '/affiliations/list', search: { status: 'Pending' } }),
      variant: 'secondary' as const,
      icon: Clock,
    },
    {
      label: 'Health Facilities',
      onClick: () => navigate({ to: '/affiliations/facilities' }),
      variant: 'outline' as const,
      icon: Building2,
    },
    {
      label: 'Health Professionals',
      onClick: () => navigate({ to: '/affiliations/professionals' }),
      variant: 'outline' as const,
      icon: UserRound,
    },
  ]

  const renderPendingItem = (item: AffiliationDashboardStats['pending_affiliations'][0]) => (
    <div className="flex items-start justify-between gap-4">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{item.professional_full_name}</p>
        <p className="text-sm text-muted-foreground truncate">{item.facility_name}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Submitted {formatDistanceToNow(dayjs(item.start_date, 'YYYY-MM-DD').toDate(), { addSuffix: true })}
        </p>
      </div>
      <Button size="sm" variant="ghost" onClick={() => navigate({ to: `/affiliations/${item.id}` })}>
        View
      </Button>
    </div>
  )

  const metrics = dashboardData?.metrics
  const activeRate = metrics?.total ? Math.round(((metrics.active / metrics.total) * 100)) : 0

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Affiliations Management</h1>
        <p className="text-muted-foreground mt-1">
          Overview of professional affiliations with health facilities
        </p>
      </div>

      {/* Quick Actions */}
      <QuickActions actions={quickActions} title="Quick Actions" />

      {/* Key Metrics - Row 1: Primary counts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Affiliations"
          value={metrics?.total || 0}
          variant="neutral"
          icon={Users}
          onClick={() => navigate({ to: '/affiliations/list' })}
        />
        <MetricCard
          title="Active Affiliations"
          value={metrics?.active || 0}
          variant="success"
          icon={CheckCircle}
          trend={metrics?.total ? `${activeRate}%` : undefined}
          onClick={() => navigate({ to: '/affiliations/list', search: { status: 'Active' } })}
        />
        <MetricCard
          title="Pending Review"
          value={metrics?.pending || 0}
          variant="warning"
          icon={Clock}
          onClick={() => navigate({ to: '/affiliations/list', search: { status: 'Pending' } })}
        />
        <MetricCard
          title="Rejected"
          value={metrics?.rejected || 0}
          variant="danger"
          icon={XCircle}
        />
      </div>

      {/* Row 2: Coverage & compliance metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Unique Professionals"
          value={metrics?.unique_professionals || 0}
          variant="info"
          icon={UserCheck}
          onClick={() => navigate({ to: '/affiliations/professionals' })}
        />
        <MetricCard
          title="Facilities with Affiliations"
          value={metrics?.unique_facilities || 0}
          variant="info"
          icon={Building2}
          onClick={() => navigate({ to: '/affiliations/facilities' })}
        />
        <MetricCard
          title="Confirmed"
          value={metrics?.confirmed || 0}
          variant="success"
          icon={ShieldCheck}
        />
        <MetricCard
          title="Inactive"
          value={metrics?.inactive || 0}
          variant="neutral"
          icon={AlertTriangle}
        />
      </div>

      {/* Interactive Trend Chart */}
      <AffiliationTrendChart data={dashboardData?.trend_data || []} />

      {/* Status Distribution + Employment Type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StatusDistribution
          data={dashboardData?.status_distribution || []}
          title="Status Distribution"
          onSegmentClick={(status) => navigate({ to: '/affiliations/list', search: { status } })}
        />
        <EmploymentTypeChart data={dashboardData?.employment_type_distribution || []} />
      </div>

      {/* Role Distribution + Facility Staffing */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RoleDistributionChart data={dashboardData?.role_distribution || []} />
        <FacilityStaffingChart data={dashboardData?.facility_staffing || []} />
      </div>

      {/* Pending Review + Multi-Affiliated */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PrioritySection
          title="Pending Affiliations"
          items={dashboardData?.pending_affiliations || []}
          renderItem={renderPendingItem}
          onViewAll={() => navigate({ to: '/affiliations/list', search: { status: 'Pending' } })}
          emptyMessage="No pending affiliations to review"
        />
        <MultiAffiliatedTable data={dashboardData?.multi_affiliated_professionals || []} />
      </div>
    </div>
  )
}

/* ─── Interactive Affiliation Trend Chart ─── */

const CHART_HEIGHT = 280
const PAD_TOP = 30
const PAD_BOTTOM = 40
const PAD_LEFT = 50
const PAD_RIGHT = 24

type TrendPoint = AffiliationDashboardStats['trend_data'][0]

function AffiliationTrendChart({ data }: { data: TrendPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null)

  const chartAreaH = CHART_HEIGHT - PAD_TOP - PAD_BOTTOM

  // We compute all geometry relative to a 0..1 normalized x/y, then scale via container width
  const maxActive = Math.max(...data.map((d) => d.active), 1)
  const maxNew = Math.max(...data.map((d) => d.new), 1)
  const maxY = Math.max(maxActive, maxNew, 1)
  // Round up to a nice ceiling
  const ceilY = Math.ceil(maxY / 5) * 5 || 5

  const gridLines = Array.from({ length: 5 }, (_, i) => {
    const val = Math.round((ceilY / 4) * (4 - i))
    const y = PAD_TOP + (i / 4) * chartAreaH
    return { val, y }
  })

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (data.length === 0 || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const svgWidth = rect.width
      const chartW = svgWidth - PAD_LEFT - PAD_RIGHT
      const mouseX = e.clientX - rect.left - PAD_LEFT
      const step = chartW / Math.max(data.length - 1, 1)
      const idx = Math.round(mouseX / step)
      const clampedIdx = Math.max(0, Math.min(data.length - 1, idx))
      setHoveredIndex(clampedIdx)
      // Position tooltip near the active line point
      const px = PAD_LEFT + clampedIdx * step
      const py = PAD_TOP + chartAreaH - (data[clampedIdx].active / ceilY) * chartAreaH
      setTooltipPos({ x: px, y: py })
    },
    [data, chartAreaH, ceilY],
  )

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null)
    setTooltipPos(null)
  }, [])

  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Affiliation Activity Trend</CardTitle>
          <p className="text-sm text-muted-foreground">Active affiliations over time</p>
        </CardHeader>
        <CardContent className="flex items-center justify-center" style={{ height: CHART_HEIGHT }}>
          <p className="text-sm text-muted-foreground">No data available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Affiliation Activity Trend</CardTitle>
        <p className="text-sm text-muted-foreground">Active &amp; new affiliations over the last 12 months</p>
      </CardHeader>
      <CardContent className="pt-0">
        {/* Legend */}
        <div className="flex items-center gap-5 mb-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded bg-emerald-500" />
            Active affiliations
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-0.5 rounded bg-blue-500 opacity-60" style={{ borderStyle: 'dashed' }} />
            New affiliations
          </div>
        </div>

        <div ref={containerRef} className="w-full relative" style={{ height: CHART_HEIGHT }}>
          <SVGChart
            data={data}
            ceilY={ceilY}
            gridLines={gridLines}
            chartAreaH={chartAreaH}
            hoveredIndex={hoveredIndex}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          />

          {/* Tooltip */}
          {hoveredIndex !== null && tooltipPos && (
            <div
              className="absolute pointer-events-none z-20 bg-popover text-popover-foreground border border-border rounded-lg shadow-lg px-3 py-2 text-xs"
              style={{
                left: tooltipPos.x,
                top: tooltipPos.y - 12,
                transform: 'translate(-50%, -100%)',
                minWidth: 140,
              }}
            >
              <p className="font-semibold text-sm mb-1">{data[hoveredIndex].full_label}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                  Active
                </span>
                <span className="font-medium tabular-nums">{data[hoveredIndex].active}</span>
              </div>
              <div className="flex items-center justify-between gap-3 mt-0.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                  New
                </span>
                <span className="font-medium tabular-nums">{data[hoveredIndex].new}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

/** SVG chart rendered with a measured viewBox so it fills full width */
function SVGChart({
  data,
  ceilY,
  gridLines,
  chartAreaH,
  hoveredIndex,
  onMouseMove,
  onMouseLeave,
}: {
  data: TrendPoint[]
  ceilY: number
  gridLines: { val: number; y: number }[]
  chartAreaH: number
  hoveredIndex: number | null
  onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void
  onMouseLeave: () => void
}) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [svgWidth, setSvgWidth] = useState(800)

  // Measure actual width on mount and resize
  const measuredRef = useCallback((node: SVGSVGElement | null) => {
    if (!node) return
    ;(svgRef as any).current = node
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setSvgWidth(entry.contentRect.width)
      }
    })
    ro.observe(node)
    setSvgWidth(node.getBoundingClientRect().width)
  }, [])

  const chartW = svgWidth - PAD_LEFT - PAD_RIGHT
  const step = chartW / Math.max(data.length - 1, 1)

  const toX = (i: number) => PAD_LEFT + i * step
  const toY = (val: number) => PAD_TOP + chartAreaH - (val / ceilY) * chartAreaH

  // Build polyline strings
  const activePoints = data.map((d, i) => `${toX(i)},${toY(d.active)}`).join(' ')
  const newPoints = data.map((d, i) => `${toX(i)},${toY(d.new)}`).join(' ')

  // Area fill under active line
  const activeArea =
    `${toX(0)},${PAD_TOP + chartAreaH} ` + activePoints + ` ${toX(data.length - 1)},${PAD_TOP + chartAreaH}`

  const gradientId = 'affTrendGrad'

  return (
    <svg
      ref={measuredRef}
      width="100%"
      height={CHART_HEIGHT}
      className="absolute inset-0"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      style={{ cursor: 'crosshair' }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines */}
      {gridLines.map((gl, i) => (
        <g key={i}>
          <line
            x1={PAD_LEFT}
            y1={gl.y}
            x2={svgWidth - PAD_RIGHT}
            y2={gl.y}
            className="stroke-border"
            strokeWidth="1"
            strokeDasharray="4,4"
          />
          <text x={PAD_LEFT - 8} y={gl.y + 4} fontSize="11" className="fill-muted-foreground" textAnchor="end">
            {gl.val}
          </text>
        </g>
      ))}
      {/* Bottom axis line */}
      <line
        x1={PAD_LEFT}
        y1={PAD_TOP + chartAreaH}
        x2={svgWidth - PAD_RIGHT}
        y2={PAD_TOP + chartAreaH}
        className="stroke-border"
        strokeWidth="1"
      />

      {/* Active area fill */}
      <polygon points={activeArea} fill={`url(#${gradientId})`} />

      {/* Active line */}
      <polyline
        points={activePoints}
        fill="none"
        stroke="#10b981"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* New affiliations line (dashed) */}
      <polyline
        points={newPoints}
        fill="none"
        stroke="#3b82f6"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6,4"
        opacity="0.7"
      />

      {/* Hover vertical guide line */}
      {hoveredIndex !== null && (
        <line
          x1={toX(hoveredIndex)}
          y1={PAD_TOP}
          x2={toX(hoveredIndex)}
          y2={PAD_TOP + chartAreaH}
          className="stroke-muted-foreground"
          strokeWidth="1"
          strokeDasharray="3,3"
          opacity="0.5"
        />
      )}

      {/* Data point dots for active line */}
      {data.map((d, i) => (
        <circle
          key={`a-${i}`}
          cx={toX(i)}
          cy={toY(d.active)}
          r={hoveredIndex === i ? 5 : 3}
          fill="#10b981"
          className="stroke-card"
          strokeWidth="2"
          style={{ transition: 'r 0.15s ease' }}
        />
      ))}

      {/* Data point dots for new line */}
      {data.map((d, i) => (
        <circle
          key={`n-${i}`}
          cx={toX(i)}
          cy={toY(d.new)}
          r={hoveredIndex === i ? 4 : 2.5}
          fill="#3b82f6"
          className="stroke-card"
          strokeWidth="1.5"
          opacity="0.8"
          style={{ transition: 'r 0.15s ease' }}
        />
      ))}

      {/* X-axis labels */}
      {data.map((d, i) => {
        // Skip odd labels if too many
        if (data.length > 8 && i % 2 !== 0 && i !== data.length - 1) return null
        return (
          <text
            key={`lbl-${i}`}
            x={toX(i)}
            y={CHART_HEIGHT - 10}
            fontSize="11"
            className="fill-muted-foreground"
            textAnchor="middle"
          >
            {d.label}
          </text>
        )
      })}
    </svg>
  )
}

/* ─── Employment Type Donut Chart ─── */

function EmploymentTypeChart({ data }: { data: AffiliationDashboardStats['employment_type_distribution'] }) {
  const total = data.reduce((sum, item) => sum + item.count, 0)

  const segments = (() => {
    let currentAngle = -90
    return data.map((item) => {
      const percentage = total > 0 ? item.count / total : 0
      const angle = percentage * 360
      const startAngle = currentAngle
      const endAngle = currentAngle + angle
      currentAngle = endAngle

      const x1 = 100 + 80 * Math.cos((Math.PI * startAngle) / 180)
      const y1 = 100 + 80 * Math.sin((Math.PI * startAngle) / 180)
      const x2 = 100 + 80 * Math.cos((Math.PI * endAngle) / 180)
      const y2 = 100 + 80 * Math.sin((Math.PI * endAngle) / 180)
      const largeArc = angle > 180 ? 1 : 0

      return {
        ...item,
        percentage: (percentage * 100).toFixed(1),
        path: angle > 0
          ? `M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`
          : '',
      }
    })
  })()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Employment Type Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          <div className="flex items-center gap-6">
            <svg viewBox="0 0 200 200" className="w-48 h-48 shrink-0">
              {segments.map((seg, i) =>
                seg.path ? (
                  <path key={i} d={seg.path} fill={seg.color} className="hover:opacity-80 transition-opacity" />
                ) : null
              )}
              <circle cx="100" cy="100" r="50" className="fill-card" />
              <text x="100" y="95" textAnchor="middle" className="text-2xl font-bold fill-foreground">{total}</text>
              <text x="100" y="110" textAnchor="middle" className="text-xs fill-muted-foreground">Total</text>
            </svg>
            <div className="flex-1 space-y-2">
              {segments.map((seg, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: seg.color }} />
                    <span className="text-sm font-medium">{seg.type}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{seg.count} ({seg.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Role Distribution Horizontal Bar Chart ─── */

function RoleDistributionChart({ data }: { data: AffiliationDashboardStats['role_distribution'] }) {
  const maxCount = data.length > 0 ? Math.max(...data.map((d) => d.count)) : 0

  const barColors = [
    '#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899',
    '#06b6d4', '#f97316', '#6366f1', '#14b8a6', '#e11d48',
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Top Roles</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          <div className="space-y-3">
            {data.map((item, i) => {
              const width = maxCount > 0 ? (item.count / maxCount) * 100 : 0
              return (
                <div key={item.role}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate mr-2">{item.role}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">{item.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ width: `${width}%`, backgroundColor: barColors[i % barColors.length] }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Facility Staffing Chart ─── */

function FacilityStaffingChart({ data }: { data: AffiliationDashboardStats['facility_staffing'] }) {
  const maxTotal = data.length > 0 ? Math.max(...data.map((d) => d.total)) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Facility Staffing Levels</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No data available</p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => {
              const totalWidth = maxTotal > 0 ? (item.total / maxTotal) * 100 : 0
              const activeWidth = maxTotal > 0 ? (item.active / maxTotal) * 100 : 0
              return (
                <div key={item.facility_id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate mr-2">{item.facility_name}</span>
                    <span className="text-sm text-muted-foreground tabular-nums">
                      {item.active}/{item.total}
                    </span>
                  </div>
                  <div className="relative w-full bg-muted rounded-full h-2.5">
                    <div
                      className="absolute h-2.5 rounded-full bg-blue-200 dark:bg-blue-900 transition-all duration-300"
                      style={{ width: `${totalWidth}%` }}
                    />
                    <div
                      className="absolute h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 transition-all duration-300"
                      style={{ width: `${activeWidth}%` }}
                    />
                  </div>
                </div>
              )
            })}
            <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
                Active
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-200 dark:bg-blue-900" />
                Total
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

/* ─── Multi-Affiliated Professionals Table ─── */

function MultiAffiliatedTable({ data }: { data: AffiliationDashboardStats['multi_affiliated_professionals'] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          Multi-Affiliated Professionals
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No multi-affiliated professionals</p>
        ) : (
          <div className="space-y-3">
            {data.map((item) => (
              <div key={item.registration_number} className="flex items-center justify-between p-2 rounded hover:bg-muted/50">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{item.full_name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground font-mono">{item.registration_number}</span>
                    {item.professional_cadre && (
                      <span className="text-xs text-muted-foreground">{item.professional_cadre}</span>
                    )}
                  </div>
                </div>
                <Badge variant="secondary" className="ml-2 tabular-nums">
                  {item.affiliation_count} affiliations
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
