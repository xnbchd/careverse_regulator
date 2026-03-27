import { useEntityDrawer } from "@/contexts/EntityDrawerContext"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import { ProfessionalDrawer } from "./ProfessionalDrawer"
import { FacilityDrawer } from "./FacilityDrawer"
import { InspectionDrawer } from "./InspectionDrawer"
import { LicenseDrawer } from "./LicenseDrawer"
import type { Professional, Facility } from "@/types/entity"
import type { Inspection } from "@/types/inspection"
import type { License } from "@/types/license"

export function EntityDrawer() {
  const { state, closeDrawer, goBack, canGoBack } = useEntityDrawer()

  const getTitle = () => {
    switch (state.type) {
      case "professional":
        return "Professional Details"
      case "facility":
        return "Facility Details"
      case "license":
        return "License Details"
      case "inspection":
        return "Inspection Details"
      default:
        return "Details"
    }
  }

  const renderContent = () => {
    switch (state.type) {
      case "professional":
        return (
          <ProfessionalDrawer professional={state.data as Professional} loading={state.loading} />
        )
      case "facility":
        return <FacilityDrawer facility={state.data as Facility} loading={state.loading} />
      case "inspection":
        return <InspectionDrawer inspection={state.data as Inspection} loading={state.loading} />
      case "license":
        return <LicenseDrawer license={state.data as License} loading={state.loading} />
      default:
        return null
    }
  }

  return (
    <Sheet open={state.open} onOpenChange={(open) => !open && closeDrawer()}>
      <SheetContent className="w-full sm:w-1/2 overflow-y-auto p-0">
        <SheetHeader className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-2">
            {canGoBack() && (
              <Button variant="ghost" size="icon" onClick={goBack} className="h-8 w-8 -ml-2">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            <div className="flex-1 min-w-0">
              <SheetTitle>{getTitle()}</SheetTitle>
              <SheetDescription>View detailed information about this {state.type}</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="px-6 pb-6">{renderContent()}</div>
      </SheetContent>
    </Sheet>
  )
}
