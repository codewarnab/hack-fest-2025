"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, Download, Calendar, Share2, Mail } from "lucide-react"
import ChatbotButton from "@/components/chatbot-button"
import { clearRegistrationProgress } from "@/lib/cookies"
import { formatDate, formatCurrency } from "@/lib/utils"
import { useAnalytics } from "@/components/analytics-provider"
import FeedbackSurvey from "@/components/feedback-survey"
import QRCode_generator from "qrcode"

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
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("")

  useEffect(() => {
    // Retrieve data from session storage
    const ticketDataStr = sessionStorage.getItem("ticketData")
    const registrationDataStr = sessionStorage.getItem("registrationData")

    if (ticketDataStr) {
      const parsedTicketData = JSON.parse(ticketDataStr)
      setTicketData(parsedTicketData)
      
      // Generate QR code when ticket data is available
      if (parsedTicketData.transactionId) {
        generateQRCode(parsedTicketData.transactionId)
      }
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

  // Generate QR code for display in the UI
  const generateQRCode = async (transactionId: string) => {
    try {
      const qrCodeDataUrl = await QRCode_generator.toDataURL(transactionId, { 
        width: 128,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQrCodeUrl(qrCodeDataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    }
  }

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

  const generateEmailTicket = async () => {
    // Generate QR code data URL for email
    const qrCodeDataUrl = await QRCode_generator.toDataURL(ticketData.transactionId, { 
      width: 128,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
    
    // Generate HTML for email ticket
    const formattedAddons = ticketData.addons && ticketData.addons.length > 0 
      ? `<div style="margin-top: 15px;">
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 5px;">Add-ons:</p>
          <ul style="margin: 0; padding-left: 20px;">
            ${ticketData.addons.map(addon => `<li style="font-weight: 500;">${formatAddonName(addon)}</li>`).join('')}
          </ul>
        </div>` 
      : '';

    const discountSection = ticketData.discount > 0
      ? `<div style="display: flex; justify-content: space-between; color: #16a34a; margin-bottom: 10px;">
          <p style="margin: 0; font-size: 14px;">Discount:</p>
          <p style="margin: 0; font-weight: 500;">-${formatCurrency(ticketData.discount)}</p>
        </div>`
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Tech Conference 2025 Ticket</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5; color: #111827; margin: 0; padding: 0; background-color: #f3f4f6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); margin-top: 40px; margin-bottom: 40px;">
          <!-- Header --> 
          <div style="background-color: #4f46e5; padding: 24px; text-align: center; border-bottom: 1px solid #e5e7eb;">
            <div style="display: inline-block; background-color: #ffffff; border-radius: 9999px; width: 64px; height: 64px; margin-bottom: 16px; display: flex; align-items: center; justify-content: center;">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">Booking Confirmed!</h1>
            <p style="color: #e0e7ff; margin-top: 8px;">Your ticket has been booked successfully.</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 24px;">
            <!-- Ticket Information -->
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #111827;">Ticket Information</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Ticket Type</p>
                  <p style="font-weight: 500; margin: 0;">${formatTicketType(ticketData.ticketType)}</p>
                </div>
                <div>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Quantity</p>
                  <p style="font-weight: 500; margin: 0;">${ticketData.quantity}</p>
                </div>
                <div>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Purchase Date</p>
                  <p style="font-weight: 500; margin: 0;">${formatDate(ticketData.purchaseDate)}</p>
                </div>
                <div>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Transaction ID</p>
                  <p style="font-weight: 500; margin: 0;">${ticketData.transactionId}</p>
                </div>
              </div>
              
              ${formattedAddons}
              
              <div style="margin-top: 16px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">Subtotal:</p>
                  <p style="margin: 0; font-weight: 500;">${formatCurrency(ticketData.subtotal)}</p>
                </div>
                
                ${discountSection}
                
                <div style="display: flex; justify-content: space-between; border-top: 1px solid #e5e7eb; padding-top: 10px; margin-top: 10px;">
                  <p style="margin: 0; font-weight: 600; font-size: 14px;">Total Amount Paid:</p>
                  <p style="margin: 0; font-weight: 700; font-size: 18px;">${formatCurrency(ticketData.totalPrice)}</p>
                </div>
              </div>
            </div>
            
            <!-- Attendee Information -->
            <div style="margin-bottom: 24px;">
              <h2 style="font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #111827;">Attendee Information</h2>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Name</p>
                  <p style="font-weight: 500; margin: 0;">${registrationData.fullName}</p>
                </div>
                <div>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Email</p>
                  <p style="font-weight: 500; margin: 0;">${registrationData.email}</p>
                </div>
                ${registrationData.phone ? `
                <div>
                  <p style="color: #6b7280; font-size: 14px; margin-bottom: 4px;">Phone</p>
                  <p style="font-weight: 500; margin: 0;">${registrationData.phone}</p>
                </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Event Details -->
            <div style="margin-bottom: 24px; padding: 16px; background-color: #f9fafb; border-radius: 8px;">
              <h2 style="font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px; color: #111827;">Event Details</h2>
              <p style="font-weight: 600; margin: 0 0 4px 0;">Tech Conference 2025</p>
              <p style="margin: 0 0 4px 0;">May 15-17, 2025</p>
              <p style="margin: 0 0 4px 0;">San Francisco Convention Center</p>
              <p style="margin: 0 0 16px 0;">123 Tech Blvd, San Francisco, CA 94103</p>
              <p style="margin: 0; font-size: 14px; color: #6b7280;">Please arrive 30 minutes before the event for check-in.</p>
            </div>
            
            <!-- Ticket -->
            <div style="border: 2px dashed #d1d5db; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
              <h2 style="font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center;">
                <span>Your Ticket</span>
              </h2>
              
              <div style="background-color: #1f2937; color: white; padding: 16px; border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                  <div>
                    <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; margin: 0 0 4px 0;">ATTENDEE</p>
                    <p style="font-weight: 700; margin: 0;">${registrationData.fullName}</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; margin: 0 0 4px 0;">TICKET TYPE</p>
                    <p style="font-weight: 700; margin: 0;">${formatTicketType(ticketData.ticketType)}</p>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                  <div>
                    <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; margin: 0 0 4px 0;">EVENT</p>
                    <p style="font-weight: 700; margin: 0;">Tech Conference 2025</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; margin: 0 0 4px 0;">DATE</p>
                    <p style="font-weight: 700; margin: 0;">May 15-17, 2025</p>
                  </div>
                </div>
                
                <div style="display: flex; justify-content: space-between;">
                  <div>
                    <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; margin: 0 0 4px 0;">LOCATION</p>
                    <p style="font-weight: 700; margin: 0;">San Francisco Convention Center</p>
                  </div>
                  <div style="text-align: right;">
                    <p style="color: #9ca3af; font-size: 12px; text-transform: uppercase; margin: 0 0 4px 0;">TRANSACTION ID</p>
                    <p style="font-weight: 500; font-size: 14px; margin: 0;">${ticketData.transactionId}</p>
                  </div>
                </div>
                
                <div style="margin-top: 16px; border-top: 1px solid #374151; padding-top: 16px; text-align: center;">
                  <p style="font-size: 14px; margin: 0 0 8px 0;">Scan this QR code at the event entrance</p>
                  <div style="margin: 0 auto; display: flex; align-items: center; justify-content: center;">
                    <img src="${qrCodeDataUrl}" alt="QR Code" style="width: 128px; height: 128px;" />
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Help Section -->
            <div style="text-align: center; border-top: 1px solid #e5e7eb; padding-top: 24px;">
              <h2 style="font-size: 18px; font-weight: 600; margin-top: 0; margin-bottom: 8px;">Need Help?</h2>
              <p style="color: #6b7280; margin-bottom: 16px;">If you have any questions or need assistance, please contact our support team.</p>
              <p style="margin: 0;">
                <a href="mailto:support@techconference.com" style="display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 8px 16px; border-radius: 4px; font-weight: 500;">Email Support</a>
                <a href="tel:+1234567890" style="display: inline-block; background-color: #e5e7eb; color: #111827; text-decoration: none; padding: 8px 16px; border-radius: 4px; font-weight: 500; margin-left: 8px;">Call Support</a>
              </p>
            </div>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f3f4f6; padding: 16px; text-align: center; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px; margin: 0;">© Tech Conference 2025. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  };

  const sendTicketByEmail = async () => {
    setIsSendingEmail(true);
    
    try {
      // Track email send action
      trackEvent("send_ticket_email", {
        ticketType: ticketData.ticketType,
      });
      
      const emailContent = await generateEmailTicket();
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: registrationData.email,
          message: emailContent,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      setEmailSent(true);
      setTimeout(() => {
        setEmailSent(false);
      }, 5000);
    } catch (error) {
      console.error('Error sending ticket email:', error);
      alert('Failed to send ticket email. Please try again.');
    } finally {
      setIsSendingEmail(false);
    }
  };

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
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="flex items-center gap-1" onClick={sendTicketByEmail} disabled={isSendingEmail}>
                      <Mail className="h-4 w-4" />
                      {isSendingEmail ? "Sending..." : emailSent ? "Sent!" : "Email Ticket"}
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
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
                      {qrCodeUrl ? (
                        <img src={qrCodeUrl} alt="QR Code" className="h-24 w-24" />
                      ) : (
                        <p className="text-xs text-gray-500">Loading QR code...</p>
                      )}
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

