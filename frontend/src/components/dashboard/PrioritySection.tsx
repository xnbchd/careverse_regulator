import { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export interface PrioritySectionProps<T = any> {
  title: string
  items: T[]
  renderItem: (item: T) => ReactNode
  onViewAll: () => void
  emptyMessage?: string
}

export function PrioritySection<T>({
  title,
  items,
  renderItem,
  onViewAll,
  emptyMessage = "No items requiring attention",
}: PrioritySectionProps<T>) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{title}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary">
          View All
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">{emptyMessage}</div>
        ) : (
          <div className="space-y-3">
            {items.map((item, index) => (
              <div
                key={index}
                className="border-l-4 border-yellow-400 pl-4 py-2 hover:bg-muted/50 transition-colors"
              >
                {renderItem(item)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
