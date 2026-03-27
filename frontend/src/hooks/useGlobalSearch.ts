import { useState, useEffect, useRef, useCallback } from "react"
import { apiClient } from "@/api/client"
import type { SearchResultGroup, FrappeGlobalSearchResponse } from "@/types/search"

const SUPPORTED_DOCTYPES = [
  "Professional Record",
  "Facility Record",
  "License Records",
  "Inspection Record",
  "Facility License Application",
  "Professional License Application",
]
const DEBOUNCE_MS = 300

export function useGlobalSearch() {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResultGroup[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  useEffect(() => {
    // Clear previous debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Reset error when query changes
    setError(null)

    // Don't search if query is too short
    if (query.length < 2) {
      setResults([])
      setLoading(false)
      return
    }

    // Debounce for 300ms
    debounceTimerRef.current = setTimeout(async () => {
      // Abort previous request if exists
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create new abort controller
      const controller = new AbortController()
      abortControllerRef.current = controller

      // Set loading AFTER debounce, BEFORE API call
      setLoading(true)

      try {
        const response = await apiClient.post<FrappeGlobalSearchResponse>(
          "/api/method/frappe.utils.global_search.search",
          {
            text: query,
            start: 0,
            limit: 50,
            doctype: "",
          },
          { signal: controller.signal }
        )

        // Validate response structure
        if (!response.message || !Array.isArray(response.message)) {
          console.error("Malformed search response:", response)
          setError("Search unavailable")
          setResults([])
          setLoading(false)
          return
        }

        // Transform and group results
        const groupedResults: Record<string, SearchResultGroup> = {}

        for (const item of response.message) {
          // Filter out unsupported doctypes
          if (!SUPPORTED_DOCTYPES.includes(item.doctype)) {
            continue
          }

          // Parse content field for description
          const description = parseContent(item.content)

          // Handle null title
          const title = item.title || item.name

          // Add to group
          if (!groupedResults[item.doctype]) {
            groupedResults[item.doctype] = {
              title: item.doctype,
              results: [],
            }
          }

          groupedResults[item.doctype].results.push({
            doctype: item.doctype,
            name: item.name,
            title,
            description,
            image: item.image || null,
          })
        }

        // Convert to array
        const resultGroups = Object.values(groupedResults)
        setResults(resultGroups)
        setLoading(false)
      } catch (err: any) {
        // Ignore AbortError (request was canceled)
        if (err.name === "AbortError") {
          return
        }

        console.error("Search error:", err)
        setError("Search unavailable")
        setResults([])
        setLoading(false)
      }
    }, DEBOUNCE_MS)

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [query])

  const clearSearch = useCallback(() => {
    setQuery("")
    setResults([])
    setLoading(false)
    setError(null)

    // Abort in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
  }, [])

  return {
    query,
    setQuery,
    results,
    loading,
    error,
    clearSearch,
  }
}

/**
 * Parse content field into description
 * Content format: "field1 : value1 ||| field2 : value2 ||| field3 : value3"
 */
function parseContent(content: string | null | undefined): string {
  if (!content) {
    return ""
  }

  try {
    // Split by " ||| "
    const segments = content.split(" ||| ")

    // Take first 3 segments
    const firstThree = segments.slice(0, 3)

    // Extract text after " : " for each segment
    const extractedTexts = firstThree.map((segment) => {
      const colonIndex = segment.indexOf(" : ")
      if (colonIndex !== -1) {
        return segment.substring(colonIndex + 3).trim()
      }
      // If no colon, use whole segment
      return segment.trim()
    })

    // Join with ", "
    const joined = extractedTexts.filter(Boolean).join(", ")

    // Truncate to 150 chars
    if (joined.length > 150) {
      return joined.substring(0, 147) + "..."
    }

    return joined
  } catch (err) {
    console.error("Error parsing content:", err)
    return ""
  }
}
