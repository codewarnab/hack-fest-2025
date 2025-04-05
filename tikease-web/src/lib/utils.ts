import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { UAParser } from "ua-parser-js"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount)
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)
}

export function generateTransactionId(): string {
  return `TRX-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
}

export function getUserDeviceInfo(): {
  browser: string
  os: string
  device: string
  isMobile: boolean
} {
  if (typeof window === "undefined") {
    return {
      browser: "unknown",
      os: "unknown",
      device: "unknown",
      isMobile: false,
    }
  }

  const parser = new UAParser(window.navigator.userAgent)
  const result = parser.getResult()

  return {
    browser: `${result.browser.name || "unknown"} ${result.browser.version || ""}`.trim(),
    os: `${result.os.name || "unknown"} ${result.os.version || ""}`.trim(),
    device: result.device.model ? `${result.device.vendor || ""} ${result.device.model || ""}`.trim() : "Desktop",
    isMobile: result.device.type === "mobile" || result.device.type === "tablet",
  }
}

export function getLocationFromIP(): Promise<{
  country: string
  city: string
  region: string
  timezone: string
}> {
  return fetch("https://ipapi.co/json/")
    .then((response) => response.json())
    .then((data) => ({
      country: data.country_name || "Unknown",
      city: data.city || "Unknown",
      region: data.region || "Unknown",
      timezone: data.timezone || "Unknown",
    }))
    .catch(() => ({
      country: "Unknown",
      city: "Unknown",
      region: "Unknown",
      timezone: "Unknown",
    }))
}

export function trackEvent(eventName: string, eventData: Record<string, any>): void {
  // In a real app, this would send data to your analytics service
  // For now, we'll just log to console and store in localStorage for demo purposes
  console.log(`[Analytics] ${eventName}:`, eventData)

  try {
    // Store in localStorage for demo purposes
    const analyticsData = JSON.parse(localStorage.getItem("eventAnalytics") || "{}")
    analyticsData[Date.now()] = { event: eventName, data: eventData }
    localStorage.setItem("eventAnalytics", JSON.stringify(analyticsData))
  } catch (error) {
    console.error("Error storing analytics data:", error)
  }
}

export function getTimeSpentOnPage(): number {
  const pageLoadTime = window.performance?.timing?.navigationStart || Date.now()
  return Math.floor((Date.now() - pageLoadTime) / 1000) // Time in seconds
}

