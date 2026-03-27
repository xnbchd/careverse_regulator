import { describe, it, expect, vi } from "vitest"
import { batchPromises } from "./promise"

describe("batchPromises", () => {
  it("should execute promises in batches", async () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    const fn = vi.fn((x: number) => Promise.resolve(x * 2))

    const results = await batchPromises(items, fn, 5)

    expect(results).toEqual([2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22])
    expect(fn).toHaveBeenCalledTimes(11)
  })

  it("should handle empty array", async () => {
    const results = await batchPromises([], () => Promise.resolve(1), 5)
    expect(results).toEqual([])
  })

  it("should handle batch size larger than array", async () => {
    const items = [1, 2, 3]
    const results = await batchPromises(items, (x) => Promise.resolve(x * 2), 10)
    expect(results).toEqual([2, 4, 6])
  })
})
