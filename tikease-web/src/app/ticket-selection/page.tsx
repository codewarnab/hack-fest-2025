import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import TicketSelectionForm from "@/components/ticket-selection-form"
import Link from "next/link"
import ChatbotButton from "@/components/chatbot-button"

export default function TicketSelectionPage() {
  return (
    <main className="min-h-screen  py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/registration" className="text-primary hover:underline inline-flex items-center">
              ← Back to registration
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Select Your Ticket</CardTitle>
              <CardDescription>Choose the ticket type that best suits your needs.</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketSelectionForm />
            </CardContent>
          </Card>
        </div>
      </div>

      <ChatbotButton />
    </main>
  )
}

