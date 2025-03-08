import { NextApiRequest, NextApiResponse } from 'next'
import { isLikelyBot } from './security'

// Simple in-memory store for rate limiting - use Redis in production
// Map of IP address to request data
interface RequestData {
  count: number
  windowStart: number
  suspiciousCount: number
  blockUntil?: number
}

const ipRequestMap = new Map<string, RequestData>()

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30 // 30 requests per minute
const BLOCK_DURATION = 5 * 60 * 1000 // 5 minutes

// Clean up old entries periodically (if we're on the client)
if (typeof window === 'undefined') {
  // Only run on the server side
  const cleanupOldEntries = () => {
    const now = Date.now()
    ipRequestMap.forEach((data, ip) => {
      if ((data.blockUntil && data.blockUntil < now) || 
          (data.windowStart && (data.windowStart + RATE_LIMIT_WINDOW * 2) < now)) {
        ipRequestMap.delete(ip)
      }
    })
  }

  // Run cleanup every 5 minutes
  setInterval(cleanupOldEntries, 5 * 60 * 1000)
}

type ApiHandler = (req: NextApiRequest, res: NextApiResponse) => Promise<void> | void

/**
 * Rate limiting middleware for Next.js API routes
 * 
 * @param handler - The API route handler
 * @returns A wrapped handler with rate limiting
 */
export function withRateLimit(handler: ApiHandler): ApiHandler {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Get IP address
    const ip = req.headers['x-forwarded-for'] as string || 
               req.socket.remoteAddress || 
               'unknown'
               
    // Get user agent
    const userAgent = req.headers['user-agent'] || ''
    
    // Block obvious bots
    if (isLikelyBot(userAgent, req.headers as Record<string, string>)) {
      return res.status(403).json({ error: 'Not allowed' })
    }
    
    // Check if already blocked
    if (ipRequestMap.has(ip)) {
      const ipData = ipRequestMap.get(ip)!
      
      // If IP is currently blocked
      if (ipData.blockUntil && ipData.blockUntil > Date.now()) {
        return res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((ipData.blockUntil - Date.now()) / 1000)
        })
      }
      
      const now = Date.now()
      
      // Reset window if needed
      if ((ipData.windowStart + RATE_LIMIT_WINDOW) < now) {
        ipData.count = 1
        ipData.windowStart = now
      } else {
        // Increment request count
        ipData.count++
        
        // Check if rate limit exceeded
        if (ipData.count > MAX_REQUESTS_PER_WINDOW) {
          ipData.suspiciousCount = (ipData.suspiciousCount || 0) + 1
          
          // If repeatedly exceeding rate limits, block for longer
          if (ipData.suspiciousCount >= 3) {
            ipData.blockUntil = now + BLOCK_DURATION
            
            return res.status(429).json({ 
              error: 'Too many requests',
              retryAfter: BLOCK_DURATION / 1000 
            })
          }
          
          return res.status(429).json({ 
            error: 'Too many requests',
            retryAfter: 60 // Try again in a minute
          })
        }
      }
    } else {
      // First request from this IP
      ipRequestMap.set(ip, {
        count: 1,
        windowStart: Date.now(),
        suspiciousCount: 0
      })
    }
    
    // Set rate limit headers
    const ipData = ipRequestMap.get(ip)!
    res.setHeader('X-RateLimit-Limit', MAX_REQUESTS_PER_WINDOW.toString())
    res.setHeader('X-RateLimit-Remaining', Math.max(0, MAX_REQUESTS_PER_WINDOW - ipData.count).toString())
    res.setHeader('X-RateLimit-Reset', (ipData.windowStart + RATE_LIMIT_WINDOW).toString())
    
    // Call the original handler
    return handler(req, res)
  }
}

/**
 * Example usage:
 * 
 * export default withRateLimit(async function handler(req, res) {
 *   // Your API logic here
 * })
 */ 