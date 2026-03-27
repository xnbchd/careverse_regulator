import { useEntityDrawer } from "@/contexts/EntityDrawerContext"
import type { EntityType } from "@/types/entity"

interface EntityLinkProps {
  type: EntityType
  id: string
  children: React.ReactNode
  className?: string
}

export function EntityLink({ type, id, children, className = "" }: EntityLinkProps) {
  const { openDrawer } = useEntityDrawer()

  return (
    <button
      onClick={(e) => {
        e.stopPropagation()
        openDrawer(type, id)
      }}
      className={`text-primary dark:text-green-400 underline hover:no-underline cursor-pointer font-medium ${className}`}
      type="button"
    >
      {children}
    </button>
  )
}
