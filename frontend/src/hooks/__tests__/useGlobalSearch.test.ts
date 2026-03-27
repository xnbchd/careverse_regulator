import { renderHook, waitFor, act } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { useGlobalSearch } from "../useGlobalSearch"
import { apiClient } from "@/api/client"

// Mock apiClient
vi.mock("@/api/client", () => ({
  apiClient: {
    post: vi.fn(),
  },
}))

describe("useGlobalSearch", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.runOnlyPendingTimers()
    vi.useRealTimers()
  })

  it("returns initial state", () => {
    const { result } = renderHook(() => useGlobalSearch())

    expect(result.current.query).toBe("")
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("debounces query input and does not call API immediately", async () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery("test")
    })

    // API should not be called immediately
    expect(apiClient.post).not.toHaveBeenCalled()

    // Fast-forward 200ms (before debounce completes)
    act(() => {
      vi.advanceTimersByTime(200)
    })

    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it("calls API after 300ms debounce with correct parameters", async () => {
    const mockResponse = {
      message: [
        {
          doctype: "Professional",
          name: "PROF-001",
          title: "Dr. John Doe",
          content: "Specialty : Cardiology ||| License : ACTIVE",
          image: null,
        },
      ],
    }

    vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery("test")
    })

    // Fast-forward 300ms to complete debounce
    await act(async () => {
      vi.advanceTimersByTime(300)
      await vi.runOnlyPendingTimersAsync()
    })

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith(
        "/api/method/frappe.utils.global_search.search",
        {
          text: "test",
          start: 0,
          limit: 50,
          doctype: "",
        },
        expect.objectContaining({
          signal: expect.any(AbortSignal),
        })
      )
    })
  })

  it("transforms API response into grouped results", async () => {
    const mockResponse = {
      message: [
        {
          doctype: "Professional",
          name: "PROF-001",
          title: "Dr. John Doe",
          content: "Specialty : Cardiology ||| License : ACTIVE",
          image: null,
        },
        {
          doctype: "Professional",
          name: "PROF-002",
          title: "Dr. Jane Smith",
          content: "Specialty : Neurology",
          image: null,
        },
        {
          doctype: "Facility",
          name: "FAC-001",
          title: "General Hospital",
          content: "Type : Hospital ||| Beds : 100",
          image: null,
        },
      ],
    }

    vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery("hospital")
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      await vi.runOnlyPendingTimersAsync()
    })

    await waitFor(() => {
      expect(result.current.results).toHaveLength(2)
      expect(result.current.results[0].title).toBe("Professional")
      expect(result.current.results[0].results).toHaveLength(2)
      expect(result.current.results[1].title).toBe("Facility")
      expect(result.current.results[1].results).toHaveLength(1)
    })
  })

  it("sets loading state during API call", async () => {
    const mockResponse = {
      message: [],
    }

    vi.mocked(apiClient.post).mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => resolve(mockResponse), 100)
      })
    })

    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery("test")
    })

    // After debounce, loading should be true
    await act(async () => {
      vi.advanceTimersByTime(300)
      await vi.runOnlyPendingTimersAsync()
    })

    expect(result.current.loading).toBe(true)

    // Wait for API to resolve
    await act(async () => {
      vi.advanceTimersByTime(100)
      await vi.runOnlyPendingTimersAsync()
    })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it("handles API errors gracefully", async () => {
    vi.mocked(apiClient.post).mockRejectedValue(new Error("Network error"))

    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery("test")
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      await vi.runOnlyPendingTimersAsync()
    })

    await waitFor(() => {
      expect(result.current.error).toBe("Search unavailable")
      expect(result.current.results).toEqual([])
      expect(result.current.loading).toBe(false)
    })
  })

  it("clearSearch resets all state", async () => {
    const mockResponse = {
      message: [
        {
          doctype: "Professional",
          name: "PROF-001",
          title: "Dr. John Doe",
          content: "test",
          image: null,
        },
      ],
    }

    vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery("test")
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      await vi.runOnlyPendingTimersAsync()
    })

    await waitFor(() => {
      expect(result.current.results.length).toBeGreaterThan(0)
    })

    act(() => {
      result.current.clearSearch()
    })

    expect(result.current.query).toBe("")
    expect(result.current.results).toEqual([])
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  it("does not call API for queries less than 2 characters", async () => {
    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery("a")
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      await vi.runOnlyPendingTimersAsync()
    })

    expect(apiClient.post).not.toHaveBeenCalled()
    expect(result.current.results).toEqual([])
  })

  it("filters out unsupported doctypes", async () => {
    const mockResponse = {
      message: [
        {
          doctype: "Professional",
          name: "PROF-001",
          title: "Dr. John Doe",
          content: "test",
          image: null,
        },
        {
          doctype: "UnsupportedType",
          name: "UNSUP-001",
          title: "Unsupported",
          content: "test",
          image: null,
        },
        {
          doctype: "Facility",
          name: "FAC-001",
          title: "Hospital",
          content: "test",
          image: null,
        },
      ],
    }

    vi.mocked(apiClient.post).mockResolvedValue(mockResponse)

    const { result } = renderHook(() => useGlobalSearch())

    act(() => {
      result.current.setQuery("test")
    })

    await act(async () => {
      vi.advanceTimersByTime(300)
      await vi.runOnlyPendingTimersAsync()
    })

    await waitFor(() => {
      // Should only have Professional and Facility groups
      expect(result.current.results).toHaveLength(2)
      expect(
        result.current.results.every((g) => ["Professional", "Facility"].includes(g.title))
      ).toBe(true)
    })
  })
})
