export interface SearchResult {
  doctype: string // Required: Entity type name
  name: string // Required: Entity ID
  title: string // Required: Display name
  description: string // Required: Parsed from content field (can be empty string)
  image: string | null // Optional: Image URL or null
}

export interface SearchResultGroup {
  title: string // Required: Display title for group (e.g., "Professionals")
  results: SearchResult[] // Required: Array of results in this group
}

export interface FrappeGlobalSearchResponse {
  message: Array<{
    doctype: string
    name: string
    title: string | null // Can be null in API response
    content: string | null // Can be null in API response
    image?: string | null // Optional in API response
  }>
}
