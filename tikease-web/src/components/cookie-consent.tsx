"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { COOKIE_NAMES, COOKIE_EXPIRY, setCookie, getCookie, generateUniqueId } from "@/lib/cookies"
import { X } from "lucide-react"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [preferences, setPreferences] = useState({
    essential: true, // Always required
    functional: false,
    analytics: false,
    marketing: false,
  })

  useEffect(() => {
    // Check if consent has already been given
    const hasConsent = getCookie(COOKIE_NAMES.CONSENT)
    if (!hasConsent) {
      // Show the consent banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAcceptAll = () => {
    setPreferences({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    })
    saveConsent({
      essential: true,
      functional: true,
      analytics: true,
      marketing: true,
    })
  }

  const handleAcceptSelected = () => {
    saveConsent(preferences)
  }

  const handleRejectAll = () => {
    const minimalPreferences = {
      essential: true, // Essential cookies are always required
      functional: false,
      analytics: false,
      marketing: false,
    }
    setPreferences(minimalPreferences)
    saveConsent(minimalPreferences)
  }

  const saveConsent = (consentPreferences: typeof preferences) => {
    // Save consent preferences
    setCookie(COOKIE_NAMES.CONSENT, JSON.stringify(consentPreferences), COOKIE_EXPIRY.CONSENT)

    // Set user ID if it doesn't exist yet
    if (!getCookie(COOKIE_NAMES.USER_ID) && consentPreferences.functional) {
      setCookie(COOKIE_NAMES.USER_ID, generateUniqueId(), COOKIE_EXPIRY.USER_ID)
    }

    // Hide the consent banner
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-background/80 backdrop-blur-sm">
      <Card className="max-w-4xl mx-auto border-primary/20">
        <CardContent className="p-4 md:p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-semibold">Cookie Preferences</h3>
            <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} className="h-8 w-8">
              <X size={18} />
            </Button>
          </div>

          <p className="mb-4">
            We use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. By
            clicking "Accept All", you consent to our use of cookies.
          </p>

          {showDetails && (
            <div className="space-y-4 mt-4 border-t pt-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="essential"
                  checked={preferences.essential}
                  disabled={true} // Essential cookies cannot be disabled
                />
                <div className="space-y-1">
                  <Label htmlFor="essential" className="font-medium">
                    Essential Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies are necessary for the website to function and cannot be disabled.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="functional"
                  checked={preferences.functional}
                  onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, functional: checked === true }))}
                />
                <div className="space-y-1">
                  <Label htmlFor="functional" className="font-medium">
                    Functional Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies enable personalized features and functionality.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="analytics"
                  checked={preferences.analytics}
                  onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, analytics: checked === true }))}
                />
                <div className="space-y-1">
                  <Label htmlFor="analytics" className="font-medium">
                    Analytics Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies help us understand how visitors interact with our website.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="marketing"
                  checked={preferences.marketing}
                  onCheckedChange={(checked) => setPreferences((prev) => ({ ...prev, marketing: checked === true }))}
                />
                <div className="space-y-1">
                  <Label htmlFor="marketing" className="font-medium">
                    Marketing Cookies
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    These cookies are used to track visitors across websites to display relevant advertisements.
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-wrap gap-2 justify-end p-4 md:p-6 pt-0 md:pt-0">
          <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Hide Details" : "Customize"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleRejectAll}>
            Reject All
          </Button>
          {showDetails && (
            <Button variant="outline" size="sm" onClick={handleAcceptSelected}>
              Accept Selected
            </Button>
          )}
          <Button size="sm" onClick={handleAcceptAll}>
            Accept All
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

