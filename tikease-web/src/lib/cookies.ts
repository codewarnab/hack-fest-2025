import Cookies from "js-cookie"

// Cookie names
export const COOKIE_NAMES = {
  CONSENT: "event_cookie_consent",
  USER_ID: "event_user_id",
  SESSION_ID: "event_session_id",
  LAST_VISIT: "event_last_visit",
  REFERRER: "event_referrer",
  REGISTRATION_PROGRESS: "event_registration_progress",
}

// Cookie expiration times
export const COOKIE_EXPIRY = {
  CONSENT: 365, // days
  USER_ID: 365, // days
  SESSION_ID: 1, // day
  LAST_VISIT: 30, // days
  REFERRER: 30, // days
  REGISTRATION_PROGRESS: 1, // day
}

// Set cookie with expiry
export function setCookie(name: string, value: string, days: number): void {
  Cookies.set(name, value, { expires: days, sameSite: "strict" })
}

// Get cookie value
export function getCookie(name: string): string | undefined {
  return Cookies.get(name)
}

// Remove cookie
export function removeCookie(name: string): void {
  Cookies.remove(name)
}

// Generate unique ID for user tracking
export function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

// Initialize essential cookies
export function initializeEssentialCookies(): void {
  // Only run on client side
  if (typeof window === "undefined") return

  // Set or update session ID
  if (!getCookie(COOKIE_NAMES.SESSION_ID)) {
    setCookie(COOKIE_NAMES.SESSION_ID, generateUniqueId(), COOKIE_EXPIRY.SESSION_ID)
  }

  // Set last visit time
  setCookie(COOKIE_NAMES.LAST_VISIT, new Date().toISOString(), COOKIE_EXPIRY.LAST_VISIT)

  // Store referrer if available
  if (document.referrer && !getCookie(COOKIE_NAMES.REFERRER)) {
    setCookie(COOKIE_NAMES.REFERRER, document.referrer, COOKIE_EXPIRY.REFERRER)
  }
}

// Save registration progress
export function saveRegistrationProgress(step: string, data: any): void {
  try {
    const progressData = JSON.parse(getCookie(COOKIE_NAMES.REGISTRATION_PROGRESS) || "{}")
    progressData.currentStep = step
    progressData[step] = data
    setCookie(COOKIE_NAMES.REGISTRATION_PROGRESS, JSON.stringify(progressData), COOKIE_EXPIRY.REGISTRATION_PROGRESS)
  } catch (error) {
    console.error("Error saving registration progress:", error)
  }
}

// Get registration progress
export function getRegistrationProgress(): { currentStep: string; [key: string]: any } {
  try {
    return JSON.parse(getCookie(COOKIE_NAMES.REGISTRATION_PROGRESS) || "{}")
  } catch (error) {
    console.error("Error getting registration progress:", error)
    return { currentStep: "" }
  }
}

// Clear registration progress
export function clearRegistrationProgress(): void {
  removeCookie(COOKIE_NAMES.REGISTRATION_PROGRESS)
}

