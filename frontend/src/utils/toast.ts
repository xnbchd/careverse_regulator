import { toast } from "sonner"

export function showSuccess(content: string): void {
  toast.success(content, {
    duration: 3000,
  })
}

export function showError(content: string): void {
  toast.error(content, {
    duration: 4000,
  })
}

export function showWarning(content: string): void {
  toast.warning(content, {
    duration: 3000,
  })
}

export function showInfo(content: string): void {
  toast.info(content, {
    duration: 3000,
  })
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === "string") {
    return error
  }
  return "An unexpected error occurred"
}
