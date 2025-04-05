"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Download, Calendar, Share2 } from "lucide-react"
import ChatbotButton from "@/components/chatbot-button"
import { clearRegistrationProgress } from "@/lib/cookies"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useAnalytics } from "@/components/analytics-provider"
import FeedbackSurvey from "@/components/feedback-survey"

interface TicketData {
  ticketType: string
  quantity: number
  addons: string[]
  totalPrice: number
  purchaseDate: string
  transactionId: string
  subtotal: number
  discount: number
}

interface RegistrationData {
  fullName: string
  email: string
  phone?: string
}

export default function ConfirmationPage() {
  const { trackEvent } = useAnalytics()
  const [ticketData, setTicketData] = useState<TicketData | null>(null)
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  const [showFeedbackSurvey, setShowFeedbackSurvey] = useState(false)
  const [isAddingToCalendar, setIsAddingToCalendar] = useState(false)

  useEffect(() => {
    // Retrieve data from session storage
    const ticketDataStr = sessionStorage.getItem("ticketData")
    const registrationDataStr = sessionStorage.getItem("registrationData")

    if (ticketDataStr) {
      setTicketData(JSON.parse(ticketDataStr))
    }

    if (registrationDataStr) {
      setRegistrationData(JSON.parse(registrationDataStr))
    }

    // Clear registration progress as the process is complete
    clearRegistrationProgress()

    // Track page view
    trackEvent("purchase_confirmation_viewed", {
      timestamp: new Date().toISOString(),
    })

    // Show feedback survey after 5 seconds
    const timer = setTimeout(() => {
      setShowFeedbackSurvey(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [trackEvent])

  if (!ticketData || !registrationData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading confirmation details...</p>
      </div>
    )
  }

  const formatTicketType = (type: string) => {
    return type
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const formatAddonName = (addon: string) => {
    return addon
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const handleAddToCalendar = () => {
    setIsAddingToCalendar(true)

    // Track calendar add
    trackEvent("add_to_calendar", {
      ticketType: ticketData.ticketType,
    })

    // Create calendar event (this is a simplified example)
    const eventDetails = {
      title: "Tech Conference 2025",
      description: `Your ${formatTicketType(ticketData.ticketType)} ticket for Tech Conference 2025. Transaction ID: ${ticketData.transactionId}`,
      location: "San Francisco Convention Center",
      startDate: "2025-05-15T09:00:00",
      endDate: "2025-05-17T18:00:00",
    }

    // In a real app, this would generate an .ics file or integrate with Google Calendar API
    // For this demo, we'll just simulate the action
    setTimeout(() => {
      alert("Event added to your calendar!")
      setIsAddingToCalendar(false)
    }, 1500)
  }

  const handleShareTicket = () => {
    // Track share action
    trackEvent("share_ticket", {
      ticketType: ticketData.ticketType,
    })

    // In a real app, this would open a share dialog
    // For this demo, we'll just simulate the action
    if (navigator.share) {
      navigator.share({
        title: "My Tech Conference 2025 Ticket",
        text: `I'm attending Tech Conference 2025! Join me from May 15-17, 2025 at the San Francisco Convention Center.`,
        url: window.location.href,
      })
    } else {
      alert("Sharing is not supported on this browser. Copy the URL to share manually.")
    }
  }

  return (
    <main className="min-h-screen bg-black py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card className="border-green-200 shadow-lg">
            <CardHeader className=" border-b border-green-100">
              <div className="flex items-center justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-center">Booking Confirmed!</CardTitle>
              <CardDescription className="text-center">
                Your ticket has been booked successfully. A confirmation email has been sent to {registrationData.email}
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Ticket Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Ticket Type</p>
                    <p className="font-medium">{formatTicketType(ticketData.ticketType)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Quantity</p>
                    <p className="font-medium">{ticketData.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Purchase Date</p>
                    <p className="font-medium">{formatDate(ticketData.purchaseDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Transaction ID</p>
                    <p className="font-medium">{ticketData.transactionId}</p>
                  </div>
                </div>

                {ticketData.addons && ticketData.addons.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500">Add-ons</p>
                    <ul className="list-disc list-inside">
                      {ticketData.addons.map((addon) => (
                        <li key={addon} className="font-medium">
                          {formatAddonName(addon)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className=" p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-gray-500">Subtotal</p>
                    <p className="font-medium">{formatCurrency(ticketData.subtotal)}</p>
                  </div>

                  {ticketData.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <p className="text-sm">Discount</p>
                      <p className="font-medium">-{formatCurrency(ticketData.discount)}</p>
                    </div>
                  )}

                  <div className="flex justify-between border-t pt-2">
                    <p className="text-sm font-bold">Total Amount Paid</p>
                    <p className="text-xl font-bold">{formatCurrency(ticketData.totalPrice)}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Attendee Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{registrationData.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{registrationData.email}</p>
                  </div>
                  {registrationData.phone && (
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="font-medium">{registrationData.phone}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="0 p-4 rounded-lg">
                <h3 className="text-lg font-medium mb-2">Event Details</h3>
                <p className="font-medium">Tech Conference 2025</p>
                <p>May 15-17, 2025</p>
                <p>San Francisco Convention Center</p>
                <p>123 Tech Blvd, San Francisco, CA 94103</p>
                <p className="mt-2 text-sm">Please arrive 30 minutes before the event for check-in.</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={handleAddToCalendar}
                    disabled={isAddingToCalendar}
                  >
                    <Calendar className="h-4 w-4" />
                    {isAddingToCalendar ? "Adding..." : "Add to Calendar"}
                  </Button>

                  <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={handleShareTicket}>
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                </div>
              </div>

              <div className="border border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-medium">Your Ticket</h3>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    Download
                  </Button>
                </div>

                <div className="bg-black p-4 rounded border">
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500">ATTENDEE</p>
                      <p className="font-bold">{registrationData.fullName}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">TICKET TYPE</p>
                      <p className="font-bold">{formatTicketType(ticketData.ticketType)}</p>
                    </div>
                  </div>

                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-500">EVENT</p>
                      <p className="font-bold">Tech Conference 2025</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">DATE</p>
                      <p className="font-bold">May 15-17, 2025</p>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-gray-500">LOCATION</p>
                      <p className="font-bold">San Francisco Convention Center</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">TRANSACTION ID</p>
                      <p className="font-medium text-sm">{ticketData.transactionId}</p>
                    </div>
                  </div>

                  <div className="mt-4 border-t pt-4 text-center">
                    <p className="text-sm">Scan this QR code at the event entrance</p>
                    <div className="mt-2 bg-gray-100 h-32 w-32 mx-auto flex items-center justify-center">
                      <p className="text-xs text-gray-500">[QR Code Placeholder]</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:space-y-0">
              <Button variant="outline" onClick={() => window.print()}>
                Print Ticket
              </Button>
              <Link href="/">
                <Button>Back to Home</Button>
              </Link>
            </CardFooter>
          </Card>

          <div className="mt-8 text-center">
            <h3 className="text-lg font-medium mb-2">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions or need assistance, please contact our support team or use the chat assistant.
            </p>
            <div className="flex justify-center">
              <Button variant="outline" className="mr-4">
                <Link href="mailto:support@techconference.com">Email Support</Link>
              </Button>
              <Button variant="outline">
                <Link href="tel:+1234567890">Call Support</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {showFeedbackSurvey && <FeedbackSurvey />}
      <ChatbotButton />
    </main>
  )
}

