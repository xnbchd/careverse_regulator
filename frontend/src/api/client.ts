import { getCsrfToken } from '@/utils/boot'

/**
 * API Client Configuration
 */
const API_CONFIG = {
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second base delay
}

/**
 * Response cache for GET requests
 */
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresIn: number
}

const responseCache = new Map<string, CacheEntry<any>>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes default

/**
 * In-flight request tracking to prevent duplicate requests
 */
const inFlightRequests = new Map<string, Promise<any>>()

/**
 * API Error class for better error handling
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * Request options
 */
export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  cache?: boolean
  cacheTime?: number
  retry?: boolean
  timeout?: number
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Build URL with query parameters
 */
function buildURL(url: string, params?: Record<string, any>): string {
  if (!params) return url

  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value))
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${url}?${queryString}` : url
}

/**
 * Get cached response if valid
 */
function getCachedResponse<T>(cacheKey: string): T | null {
  const cached = responseCache.get(cacheKey)
  if (!cached) return null

  const now = Date.now()
  if (now - cached.timestamp > cached.expiresIn) {
    responseCache.delete(cacheKey)
    return null
  }

  return cached.data as T
}

/**
 * Set cached response
 */
function setCachedResponse<T>(cacheKey: string, data: T, expiresIn: number): void {
  responseCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    expiresIn,
  })
}

/**
 * Make HTTP request with retry logic
 */
async function makeRequest<T>(
  url: string,
  options: RequestOptions = {},
  attempt: number = 1
): Promise<T> {
  const {
    params,
    cache = false,
    cacheTime = CACHE_DURATION,
    retry = true,
    timeout = API_CONFIG.timeout,
    ...fetchOptions
  } = options

  const fullURL = buildURL(url, params)
  const method = fetchOptions.method || 'GET'

  // Check cache for GET requests
  if (method === 'GET' && cache) {
    const cacheKey = fullURL
    const cached = getCachedResponse<T>(cacheKey)
    if (cached) {
      return cached
    }

    // Check for in-flight request
    const inFlight = inFlightRequests.get(cacheKey)
    if (inFlight) {
      return inFlight as Promise<T>
    }
  }

  // Setup headers
  const csrfToken = getCsrfToken()
  const headers = new Headers(fetchOptions.headers || {})

  if (!headers.has('Content-Type') && fetchOptions.body && typeof fetchOptions.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  if (csrfToken) {
    headers.set('X-Frappe-CSRF-Token', csrfToken)
  }

  // Explicitly set Expect to prevent 417 errors
  headers.set('Expect', '')

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // Store in-flight request
    const requestPromise = fetch(fullURL, {
      credentials: 'include',
      ...fetchOptions,
      headers,
      signal: controller.signal,
    })

    if (method === 'GET' && cache) {
      inFlightRequests.set(fullURL, requestPromise)
    }

    const response = await requestPromise

    clearTimeout(timeoutId)

    // Parse response
    let payload: any
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      payload = await response.json().catch(() => ({}))
    } else {
      payload = await response.text()
    }

    // Handle errors
    if (!response.ok || payload?.exc) {
      const errorMessage =
        typeof payload?.message === 'string'
          ? payload.message
          : `Request failed (${response.status})`

      throw new ApiError(errorMessage, response.status, payload?._server_messages, payload)
    }

    const data = payload as T

    // Cache successful GET requests
    if (method === 'GET' && cache) {
      setCachedResponse(fullURL, data, cacheTime)
      inFlightRequests.delete(fullURL)
    }

    return data
  } catch (error) {
    clearTimeout(timeoutId)

    // Remove from in-flight
    if (method === 'GET' && cache) {
      inFlightRequests.delete(fullURL)
    }

    // Handle abort (timeout)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('Request timeout', 408, 'TIMEOUT')
    }

    // Retry logic for network errors and 5xx errors
    if (retry && attempt < API_CONFIG.retryAttempts) {
      const isRetryable =
        error instanceof ApiError
          ? error.status && error.status >= 500
          : true // Retry network errors

      if (isRetryable) {
        const delay = API_CONFIG.retryDelay * Math.pow(2, attempt - 1) // Exponential backoff
        await sleep(delay)
        return makeRequest<T>(url, options, attempt + 1)
      }
    }

    throw error
  }
}

/**
 * API Client
 */
export const apiClient = {
  /**
   * GET request
   */
  async get<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return makeRequest<T>(url, {
      ...options,
      method: 'GET',
      cache: options.cache !== false, // Cache GET requests by default
    })
  },

  /**
   * POST request
   */
  async post<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return makeRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    })
  },

  /**
   * PUT request
   */
  async put<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return makeRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  },

  /**
   * PATCH request
   */
  async patch<T = any>(url: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return makeRequest<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  },

  /**
   * DELETE request
   */
  async delete<T = any>(url: string, options: RequestOptions = {}): Promise<T> {
    return makeRequest<T>(url, {
      ...options,
      method: 'DELETE',
    })
  },

  /**
   * Clear cache
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      responseCache.clear()
      return
    }

    const keys = Array.from(responseCache.keys())
    keys.forEach((key) => {
      if (key.includes(pattern)) {
        responseCache.delete(key)
      }
    })
  },

  /**
   * Clear all in-flight requests
   */
  clearInFlight(): void {
    inFlightRequests.clear()
  },
}

export default apiClient
