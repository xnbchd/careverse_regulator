import type { ReactNode } from "react"
import { Link } from "@tanstack/react-router"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { cn } from "@/lib/utils"

export interface BreadcrumbEntry {
  label: string
  href?: string
}

export interface PageHeaderProps {
  breadcrumbs: BreadcrumbEntry[]
  title: string
  subtitle?: string
  badge?: ReactNode
  actions?: ReactNode
  className?: string
}

export function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn("space-y-1 mb-6", className)}>
      {/* Breadcrumb row */}
      {breadcrumbs.length > 0 && (
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, index) => {
              const isLast = index === breadcrumbs.length - 1
              const key = crumb.href ?? crumb.label
              return (
                <>
                  {index > 0 && <BreadcrumbSeparator key={`sep-${key}`} />}
                  <BreadcrumbItem key={key}>
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link to={crumb.href}>{crumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 pt-1">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground leading-tight">
              {title}
            </h1>
            {badge}
          </div>
          {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">{actions}</div>}
      </div>
    </div>
  )
}
