"use client"

import { useEffect, createContext, useContext, useState, type ReactNode } from "react"
import { getUserDeviceInfo, getLocationFromIP, trackEvent } from "@/lib/utils"
import { initializeEssentialCookies, getCookie, COOKIE_NAMES } from "@/lib/cookies"

interface AnalyticsContextType {
  trackPageView: (pageName: string) => void
  trackEvent: (eventName: string, eventData: Record<string, any>) => void
  deviceInfo: {
    browser: string
    os: string
    device: string
    isMobile: boolean
  } | null
  locationInfo: {
    country: string
    city: string
    region: string
    timezone: string
  } | null
  sessionId: string | null
  userId: string | null
}

const AnalyticsContext = createContext<AnalyticsContextType>({
  trackPageView: () => {},
  trackEvent: () => {},
  deviceInfo: null,
  locationInfo: null,
  sessionId: null,
  userId: null,
})

export const useAnalytics = () => useContext(AnalyticsContext)

export default function AnalyticsProvider({ children }: { children: ReactNode }) {
  const [deviceInfo, setDeviceInfo] = useState<AnalyticsContextType["deviceInfo"]>(null)
  const [locationInfo, setLocationInfo] = useState<AnalyticsContextType["locationInfo"]>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // Initialize cookies
    initializeEssentialCookies()

    // Get session and user IDs from cookies
    const sessionIdFromCookie = getCookie(COOKIE_NAMES.SESSION_ID) || null
    const userIdFromCookie = getCookie(COOKIE_NAMES.USER_ID) || null

    setSessionId(sessionIdFromCookie)
    setUserId(userIdFromCookie)

    // Get device info
    setDeviceInfo(getUserDeviceInfo())

    // Get location info
    getLocationFromIP().then(setLocationInfo)

    // Track initial page view
    const path = window.location.pathname
    const pageName = path === "/" ? "home" : path.substring(1).replace(/\//g, "-")

    trackEvent("page_view", {
      page: pageName,
      url: window.location.href,
      referrer: document.referrer || "direct",
      sessionId: sessionIdFromCookie,
      userId: userIdFromCookie,
    })

    setIsInitialized(true)

    // Track when user leaves the page
    const handleBeforeUnload = () => {
      trackEvent("page_exit", {
        page: pageName,
        timeSpent: Math.floor((Date.now() - performance.now()) / 1000), // Time in seconds
        sessionId: sessionIdFromCookie,
      })
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [])

  const trackPageView = (pageName: string) => {
    if (!isInitialized) return

    trackEvent("page_view", {
      page: pageName,
      url: window.location.href,
      referrer: document.referrer || "direct",
      sessionId,
      userId,
    })
  }

  const contextValue: AnalyticsContextType = {
    trackPageView,
    trackEvent: (eventName, eventData) => {
      if (!isInitialized) return

      trackEvent(eventName, {
        ...eventData,
        sessionId,
        userId,
        timestamp: new Date().toISOString(),
      })
    },
    deviceInfo,
    locationInfo,
    sessionId,
    userId,
  }

  return <AnalyticsContext.Provider value={contextValue}>{children}</AnalyticsContext.Provider>
}

