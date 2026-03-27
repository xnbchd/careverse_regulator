import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach } from "vitest"
import { GlobalSearch } from "../GlobalSearch"
import { useGlobalSearch } from "@/hooks/useGlobalSearch"
import { useEntityDrawer } from "@/contexts/EntityDrawerContext"

// Mock the hooks
vi.mock("@/hooks/useGlobalSearch")
vi.mock("@/contexts/EntityDrawerContext")

describe("GlobalSearch", () => {
  const mockOpenDrawer = vi.fn()
  const mockOnOpenChange = vi.fn()
  const mockClearSearch = vi.fn()
  const mockSetQuery = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useEntityDrawer).mockReturnValue({
      openDrawer: mockOpenDrawer,
      closeDrawer: vi.fn(),
      goBack: vi.fn(),
      canGoBack: vi.fn(),
      state: {
        open: false,
        type: null,
        id: null,
        data: null,
        loading: false,
      },
    })

    vi.mocked(useGlobalSearch).mockReturnValue({
      query: "",
      setQuery: mockSetQuery,
      results: [],
      loading: false,
      error: null,
      clearSearch: mockClearSearch,
    })
  })

  it("renders CommandDialog when open is true", () => {
    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByPlaceholderText(/search for professionals/i)).toBeInTheDocument()
  })

  it("displays search input with correct placeholder", () => {
    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    const input = screen.getByPlaceholderText("Search for professionals, licenses, facilities...")
    expect(input).toBeInTheDocument()
  })

  it("shows loading state when hook returns loading=true", () => {
    vi.mocked(useGlobalSearch).mockReturnValue({
      query: "test",
      setQuery: mockSetQuery,
      results: [],
      loading: true,
      error: null,
      clearSearch: mockClearSearch,
    })

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Searching...")).toBeInTheDocument()
  })

  it("displays grouped results by doctype", () => {
    vi.mocked(useGlobalSearch).mockReturnValue({
      query: "test",
      setQuery: mockSetQuery,
      results: [
        {
          title: "Professional",
          results: [
            {
              doctype: "Professional",
              name: "PROF-001",
              title: "Dr. John Doe",
              description: "Cardiology, Active",
              image: null,
            },
          ],
        },
        {
          title: "Facility",
          results: [
            {
              doctype: "Facility",
              name: "FAC-001",
              title: "General Hospital",
              description: "Hospital, 100 beds",
              image: null,
            },
          ],
        },
      ],
      loading: false,
      error: null,
      clearSearch: mockClearSearch,
    })

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Professional")).toBeInTheDocument()
    expect(screen.getByText("Dr. John Doe")).toBeInTheDocument()
    expect(screen.getByText("Cardiology, Active")).toBeInTheDocument()

    expect(screen.getByText("Facility")).toBeInTheDocument()
    expect(screen.getByText("General Hospital")).toBeInTheDocument()
    expect(screen.getByText("Hospital, 100 beds")).toBeInTheDocument()
  })

  it("calls openDrawer with correct type and ID when result clicked", async () => {
    vi.mocked(useGlobalSearch).mockReturnValue({
      query: "test",
      setQuery: mockSetQuery,
      results: [
        {
          title: "Professional",
          results: [
            {
              doctype: "Professional",
              name: "PROF-001",
              title: "Dr. John Doe",
              description: "Cardiology",
              image: null,
            },
          ],
        },
      ],
      loading: false,
      error: null,
      clearSearch: mockClearSearch,
    })

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    const result = screen.getByText("Dr. John Doe")
    fireEvent.click(result)

    await waitFor(() => {
      expect(mockOpenDrawer).toHaveBeenCalledWith("professional", "PROF-001")
    })
  })

  it("calls onOpenChange(false) after result selected", async () => {
    vi.mocked(useGlobalSearch).mockReturnValue({
      query: "test",
      setQuery: mockSetQuery,
      results: [
        {
          title: "Professional",
          results: [
            {
              doctype: "Professional",
              name: "PROF-001",
              title: "Dr. John Doe",
              description: "Cardiology",
              image: null,
            },
          ],
        },
      ],
      loading: false,
      error: null,
      clearSearch: mockClearSearch,
    })

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    const result = screen.getByText("Dr. John Doe")
    fireEvent.click(result)

    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    })
  })

  it('shows "Type to search..." when query is empty', () => {
    vi.mocked(useGlobalSearch).mockReturnValue({
      query: "",
      setQuery: mockSetQuery,
      results: [],
      loading: false,
      error: null,
      clearSearch: mockClearSearch,
    })

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Type to search...")).toBeInTheDocument()
  })

  it('shows "Type at least 2 characters..." when query length is 1', () => {
    vi.mocked(useGlobalSearch).mockReturnValue({
      query: "a",
      setQuery: mockSetQuery,
      results: [],
      loading: false,
      error: null,
      clearSearch: mockClearSearch,
    })

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Type at least 2 characters...")).toBeInTheDocument()
  })

  it('shows "No results found" when results array is empty and query is valid', () => {
    vi.mocked(useGlobalSearch).mockReturnValue({
      query: "nonexistent",
      setQuery: mockSetQuery,
      results: [],
      loading: false,
      error: null,
      clearSearch: mockClearSearch,
    })

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("No results found")).toBeInTheDocument()
  })

  it("shows error message when hook returns error", () => {
    vi.mocked(useGlobalSearch).mockReturnValue({
      query: "test",
      setQuery: mockSetQuery,
      results: [],
      loading: false,
      error: "Search unavailable",
      clearSearch: mockClearSearch,
    })

    render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    expect(screen.getByText("Search unavailable")).toBeInTheDocument()
  })

  it("clears search when modal closes", () => {
    const { rerender } = render(<GlobalSearch open={true} onOpenChange={mockOnOpenChange} />)

    rerender(<GlobalSearch open={false} onOpenChange={mockOnOpenChange} />)

    waitFor(() => {
      expect(mockClearSearch).toHaveBeenCalled()
    })
  })
})
