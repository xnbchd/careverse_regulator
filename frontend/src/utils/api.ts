import { getCsrfToken } from "./boot"

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const csrfToken = getCsrfToken()
  const headers = new Headers(init?.headers || {})

  if (!headers.has("Content-Type") && init?.body) {
    headers.set("Content-Type", "application/json")
  }

  if (csrfToken) {
    headers.set("X-Frappe-CSRF-Token", csrfToken)
  }

  const response = await fetch(url, {
    credentials: "include",
    ...init,
    headers,
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok || payload.exc) {
    const message =
      typeof payload.message === "string" ? payload.message : `Request failed (${response.status})`
    throw new Error(message)
  }

  return payload as T
}
