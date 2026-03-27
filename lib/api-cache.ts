import "server-only"

/**
 * Simple in-memory cache with TTL for API responses.
 * Keyed by a hash of the input to avoid duplicate AI calls.
 */

const DEFAULT_TTL_MS = 5 * 60 * 1000 // 5 minutes

interface CacheEntry<T> {
  result: T
  expiresAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

function hashKey(input: unknown): string {
  return JSON.stringify(input)
}

export function getCached<T>(input: unknown): T | null {
  const key = hashKey(input)
  const entry = store.get(key) as CacheEntry<T> | undefined

  if (!entry) return null
  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }

  return entry.result
}

export function setCache<T>(input: unknown, result: T, ttlMs = DEFAULT_TTL_MS): void {
  const key = hashKey(input)
  store.set(key, { result, expiresAt: Date.now() + ttlMs })

  // Evict expired entries if cache grows too large
  if (store.size > 200) {
    const now = Date.now()
    const entries = Array.from(store.entries())
    for (let i = 0; i < entries.length; i++) {
      const [k, v] = entries[i]
      if (now > v.expiresAt) store.delete(k)
    }
  }
}

/** Clear all cached entries. Useful for testing. */
export function clearCache(): void {
  store.clear()
}

