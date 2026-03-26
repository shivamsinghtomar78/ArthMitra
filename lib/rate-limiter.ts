import "server-only"

/**
 * Sliding-window rate limiter per user.
 * Limits to MAX_REQUESTS within WINDOW_MS.
 */

const MAX_REQUESTS = 5
const WINDOW_MS = 60_000 // 1 minute

const requests = new Map<string, number[]>()

export function isRateLimited(uid: string): boolean {
  const now = Date.now()
  const timestamps = (requests.get(uid) || []).filter((t) => now - t < WINDOW_MS)

  if (timestamps.length >= MAX_REQUESTS) {
    requests.set(uid, timestamps)
    return true
  }

  timestamps.push(now)
  requests.set(uid, timestamps)
  return false
}

// Periodic cleanup (every 5 min) to prevent memory leaks
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    const entries = Array.from(requests.entries())
    for (let i = 0; i < entries.length; i++) {
      const [uid, timestamps] = entries[i]
      const active = timestamps.filter((t: number) => now - t < WINDOW_MS)
      if (active.length === 0) {
        requests.delete(uid)
      } else {
        requests.set(uid, active)
      }
    }
  }, 5 * 60_000)
}
