import { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Save } from "lucide-react"
import { cn } from "@/lib/utils"

export interface WizardStep {
  id: string
  title: string
  description?: string
  optional?: boolean
}

interface FormWizardProps {
  steps: WizardStep[]
  currentStep: number
  onStepChange: (step: number) => void
  onSubmit: () => void
  onSaveDraft?: () => void
  children: ReactNode
  isSubmitting?: boolean
  canGoNext?: boolean
  canGoPrevious?: boolean
  showDraftButton?: boolean
  submitLabel?: string
}

export default function FormWizard({
  steps,
  currentStep,
  onStepChange,
  onSubmit,
  onSaveDraft,
  children,
  isSubmitting = false,
  canGoNext = true,
  canGoPrevious = true,
  showDraftButton = true,
  submitLabel = "Submit Application",
}: FormWizardProps) {
  const progress = ((currentStep + 1) / steps.length) * 100
  const isFirstStep = currentStep === 0
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (canGoNext && currentStep < steps.length - 1) {
      onStepChange(currentStep + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handlePrevious = () => {
    if (canGoPrevious && currentStep > 0) {
      onStepChange(currentStep - 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleStepClick = (index: number) => {
    // Allow navigation to previous steps or current step
    if (index <= currentStep) {
      onStepChange(index)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">
                Step {currentStep + 1} of {steps.length}
              </span>
              <span className="text-muted-foreground">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Steps Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              const isAccessible = index <= currentStep

              return (
                <button
                  key={step.id}
                  onClick={() => handleStepClick(index)}
                  disabled={!isAccessible}
                  className={cn(
                    "w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors",
                    isCurrent && "bg-primary/10 border-2 border-primary",
                    isCompleted && !isCurrent && "hover:bg-muted",
                    !isAccessible && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    ) : (
                      <Circle
                        className={cn(
                          "w-5 h-5",
                          isCurrent ? "text-primary fill-primary" : "text-muted-foreground"
                        )}
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p
                        className={cn(
                          "font-medium",
                          isCurrent && "text-primary",
                          isCompleted && !isCurrent && "text-foreground",
                          !isAccessible && "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </p>
                      {step.optional && (
                        <span className="text-xs text-muted-foreground">(Optional)</span>
                      )}
                    </div>
                    {step.description && (
                      <p className="text-sm text-muted-foreground mt-0.5">{step.description}</p>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          {steps[currentStep].description && (
            <CardDescription>{steps[currentStep].description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-2">
              {!isFirstStep && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={!canGoPrevious || isSubmitting}
                >
                  Previous
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              {showDraftButton && onSaveDraft && (
                <Button
                  variant="outline"
                  onClick={onSaveDraft}
                  disabled={isSubmitting}
                  className="gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </Button>
              )}

              {!isLastStep ? (
                <Button onClick={handleNext} disabled={!canGoNext || isSubmitting}>
                  Next
                </Button>
              ) : (
                <Button onClick={onSubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Submitting...
                    </>
                  ) : (
                    submitLabel
                  )}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
