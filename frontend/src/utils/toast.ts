import { message } from 'antd'

export function showSuccess(content: string): void {
  message.success({
    content,
    duration: 3,
  })
}

export function showError(content: string): void {
  message.error({
    content,
    duration: 4,
  })
}

export function showWarning(content: string): void {
  message.warning({
    content,
    duration: 3,
  })
}

export function showInfo(content: string): void {
  message.info({
    content,
    duration: 3,
  })
}

export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }
  if (typeof error === 'string') {
    return error
  }
  return 'An unexpected error occurred'
}
