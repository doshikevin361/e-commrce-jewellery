import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getPlainTextFromHtml(value?: string) {
  if (!value) return ''
  return value
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Converts relative image URLs to absolute URLs
 * Handles both local development and production environments
 * Works in both server-side and client-side contexts
 * @param imageUrl - The image URL (can be relative or absolute)
 * @param requestUrl - Optional request URL for server-side usage
 * @returns Absolute URL for the image
 */
export function getAbsoluteImageUrl(imageUrl?: string, requestUrl?: string): string {
  if (!imageUrl) return ''
  
  // If already an absolute URL (starts with http:// or https://), return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl
  }
  
  // Get base URL from environment variable or use default
  let baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  
  // If no env variable, try to get from request URL (server-side)
  if (!baseUrl && requestUrl) {
    try {
      const url = new URL(requestUrl)
      baseUrl = `${url.protocol}//${url.host}`
    } catch {
      // Invalid URL, fall through to default
    }
  }
  
  // If still no base URL, use client-side window or default
  if (!baseUrl) {
    if (typeof window !== 'undefined') {
      baseUrl = window.location.origin
    } else {
      baseUrl = 'https://jewellery-commrce-824e.vercel.app'
    }
  }
  
  // Remove leading slash if present to avoid double slashes
  const cleanPath = imageUrl.startsWith('/') ? imageUrl : `/${imageUrl}`
  
  // Return absolute URL
  return `${baseUrl}${cleanPath}`
}