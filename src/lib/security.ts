/**
 * Security utilities to protect against common web attacks
 */

/**
 * Sanitizes user input to prevent XSS attacks
 * @param input - The string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input) return ''
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
}

/**
 * Sanitizes a plain object by cleaning all string values
 * @param obj - The object to sanitize
 * @returns A new object with sanitized values
 */
export function sanitizeObject<T extends Record<string, unknown>>(obj: T): T {
  const result = {} as T
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = obj[key]
      
      if (typeof value === 'string') {
        result[key] = sanitizeInput(value) as unknown as T[typeof key]
      } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        result[key] = sanitizeObject(value as Record<string, unknown>) as unknown as T[typeof key]
      } else if (Array.isArray(value)) {
        result[key] = value.map((item: unknown) => 
          typeof item === 'string' 
            ? sanitizeInput(item) 
            : typeof item === 'object' && item !== null 
              ? sanitizeObject(item as Record<string, unknown>) 
              : item
        ) as unknown as T[typeof key]
      } else {
        result[key] = value
      }
    }
  }
  
  return result
}

/**
 * Validates an API key format (simplified example)
 * @param apiKey - The API key to validate
 * @returns Boolean indicating if key format is valid
 */
export function isValidApiKeyFormat(apiKey: string): boolean {
  if (!apiKey || typeof apiKey !== 'string') return false
  
  // Example of a simple check - adjust based on your actual API key format
  // This example checks for a key that's at least 32 characters and alphanumeric with dashes
  return /^[a-zA-Z0-9-_]{32,}$/.test(apiKey)
}

/**
 * Checks if a request is likely from a bot based on simple heuristics
 * @param userAgent - The User-Agent header
 * @param headers - Optional additional headers to check
 * @returns Boolean indicating if the request appears to be from a bot
 */
export function isLikelyBot(
  userAgent: string, 
  headers?: Record<string, string>
): boolean {
  if (!userAgent) return true
  
  // Common bot patterns
  const botPatterns = [
    /bot/i, 
    /crawl/i, 
    /spider/i, 
    /headless/i, 
    /scrape/i
  ]
  
  // Check user agent
  for (const pattern of botPatterns) {
    if (pattern.test(userAgent)) {
      return true
    }
  }
  
  // Check suspicious header combinations if headers are provided
  if (headers) {
    // No Accept-Language header often indicates a bot
    if (!headers['accept-language']) {
      return true
    }
    
    // No Referer on non-direct traffic can be suspicious
    if (!headers['referer'] && headers['origin']) {
      return true
    }
  }
  
  return false
}

/**
 * Simple token obfuscation for client-side storage (not for sensitive data)
 * @param token - The token to obfuscate
 * @returns Obfuscated token
 */
export function obfuscateToken(token: string): string {
  if (!token) return ''
  
  // Simple encoding to make tokens not immediately readable
  // Not for security, just to prevent casual inspection
  return btoa(token.split('').reverse().join(''))
}

/**
 * Deobfuscate a token from client-side storage
 * @param obfuscatedToken - The obfuscated token
 * @returns Original token
 */
export function deobfuscateToken(obfuscatedToken: string): string {
  if (!obfuscatedToken) return ''
  
  try {
    // Reverse the obfuscation process
    return atob(obfuscatedToken).split('').reverse().join('')
  } catch {
    return ''
  }
} 