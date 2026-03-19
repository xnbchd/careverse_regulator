/**
 * Execute promises in batches to avoid overwhelming browser connection limits
 * @param items Array of items to process
 * @param fn Async function that processes each item
 * @param batchSize Number of concurrent operations (default 10)
 * @returns Array of results in original order
 */
export async function batchPromises<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  batchSize = 10
): Promise<R[]> {
  const results: R[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
  }

  return results
}
