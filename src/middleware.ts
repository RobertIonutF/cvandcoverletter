import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple in-memory store for rate limiting
// Note: For production, use Redis or another persistent store
const ipRequestMap = new Map()

// Configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute in milliseconds
const MAX_REQUESTS_PER_WINDOW = 60 // Max requests per minute
const BLOCK_DURATION = 5 * 60 * 1000 // 5 minutes block for detected bots

// List of bot user agent patterns to block
const BOT_USER_AGENT_PATTERNS = [
  /bot/i,
  /crawl/i,
  /spider/i,
  /scrape/i,
  /headless/i,
  /selenium/i,
  /puppeteer/i,
  /chrome-lighthouse/i,
  /slurp/i,
  /dataminer/i,
  /wget/i,
  /curl/i
]

// List of allowed bots (search engines)
const ALLOWED_BOTS = [
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i
]

// API routes that should be protected
const PROTECTED_API_ROUTES = [
  '/api/generate',
  '/api/download'
]

// Clean up old entries from the rate limiting map
function cleanupOldEntries() {
  const now = Date.now()
  ipRequestMap.forEach((data, ip) => {
    if (data.blockUntil && data.blockUntil < now) {
      // Unblock IPs whose block time has expired
      ipRequestMap.delete(ip)
    } else if (data.windowStart && (data.windowStart + RATE_LIMIT_WINDOW) < now) {
      // Reset count for IPs whose window has expired
      ipRequestMap.delete(ip)
    }
  })
}

// Run cleanup every minute
setInterval(cleanupOldEntries, 60 * 1000)

function isBot(userAgent: string): boolean {
  if (!userAgent) return false
  
  // Check if it's an allowed bot
  for (const pattern of ALLOWED_BOTS) {
    if (pattern.test(userAgent)) {
      return false
    }
  }
  
  // Check if it's a bot to block
  for (const pattern of BOT_USER_AGENT_PATTERNS) {
    if (pattern.test(userAgent)) {
      return true
    }
  }
  
  return false
}

function shouldProtectRoute(pathname: string): boolean {
  // Protect API routes
  if (pathname.startsWith('/api/')) {
    return PROTECTED_API_ROUTES.some(route => pathname.startsWith(route))
  }
  
  // Other routes that might need protection
  return pathname === '/generate' || 
         pathname === '/download' ||
         pathname.includes('/auth/')
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const ip = request.ip || 'unknown'
  const userAgent = request.headers.get('user-agent') || ''
  
  // Check if route should be protected
  if (!shouldProtectRoute(pathname)) {
    return NextResponse.next()
  }
  
  // Detect obvious bots by user agent
  if (isBot(userAgent)) {
    console.log(`Bot detected and blocked: ${ip}, ${userAgent}`)
    return new NextResponse('Not allowed', { status: 403 })
  }
  
  // Skip rate limiting for non-API routes in development
  if (process.env.NODE_ENV === 'development' && !pathname.startsWith('/api/')) {
    return NextResponse.next()
  }
  
  // Initialize or get IP data
  if (!ipRequestMap.has(ip)) {
    ipRequestMap.set(ip, {
      count: 1,
      windowStart: Date.now(),
      suspiciousCount: 0
    })
    return NextResponse.next()
  }
  
  const ipData = ipRequestMap.get(ip)
  
  // Check if IP is blocked
  if (ipData.blockUntil && ipData.blockUntil > Date.now()) {
    console.log(`Blocked request from: ${ip}`)
    return new NextResponse('Too many requests', { status: 429 })
  }
  
  const now = Date.now()
  
  // Reset window if needed
  if ((ipData.windowStart + RATE_LIMIT_WINDOW) < now) {
    ipData.count = 1
    ipData.windowStart = now
    return NextResponse.next()
  }
  
  // Increment request count
  ipData.count++
  
  // Check if rate limit exceeded
  if (ipData.count > MAX_REQUESTS_PER_WINDOW) {
    console.log(`Rate limit exceeded for IP: ${ip}`)
    ipData.suspiciousCount = (ipData.suspiciousCount || 0) + 1
    
    // If repeatedly exceeding rate limits, block for longer
    if (ipData.suspiciousCount >= 3) {
      ipData.blockUntil = now + BLOCK_DURATION
      console.log(`Blocking suspicious IP: ${ip} until ${new Date(ipData.blockUntil).toISOString()}`)
      return new NextResponse('Too many requests', { status: 429 })
    }
    
    return new NextResponse('Too many requests', { status: 429 })
  }
  
  return NextResponse.next()
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.well-known).*)',
  ],
} 