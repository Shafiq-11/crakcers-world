import 'server-only'

interface RateLimitEntry {
  count: number
  resetTime: number
}

const limiters = new Map<string, Map<string, RateLimitEntry>>()

// Cleanup stale entries every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [, limiterMap] of limiters) {
      for (const [key, entry] of limiterMap) {
        if (now > entry.resetTime) {
          limiterMap.delete(key)
        }
      }
    }
  }, 5 * 60 * 1000)
}

export interface RateLimitConfig {
  /** Unique identifier for this rate limiter (e.g., 'checkout', 'admin-login') */
  id: string
  /** Maximum number of requests allowed in the window */
  maxRequests: number
  /** Time window in seconds */
  windowSeconds: number
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetIn: number // seconds until reset
}

/**
 * Check rate limit for a given key (typically client IP).
 * Uses in-memory sliding window — appropriate for single-server VPS deployment.
 */
export function checkRateLimit(
  config: RateLimitConfig,
  key: string
): RateLimitResult {
  if (!limiters.has(config.id)) {
    limiters.set(config.id, new Map())
  }

  const limiterMap = limiters.get(config.id)!
  const now = Date.now()
  const entry = limiterMap.get(key)

  if (!entry || now > entry.resetTime) {
    // Start new window
    limiterMap.set(key, {
      count: 1,
      resetTime: now + config.windowSeconds * 1000,
    })
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetIn: config.windowSeconds,
    }
  }

  if (entry.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetIn: Math.ceil((entry.resetTime - now) / 1000),
    }
  }

  entry.count++
  return {
    success: true,
    remaining: config.maxRequests - entry.count,
    resetIn: Math.ceil((entry.resetTime - now) / 1000),
  }
}

/**
 * Get client IP from request headers.
 * Handles X-Forwarded-For from Nginx reverse proxy.
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  // Fallback — in production behind Nginx, X-Forwarded-For should always be set
  return '127.0.0.1'
}
