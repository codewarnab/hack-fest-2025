import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import RegistrationForm from "@/components/registration-form"
import Link from "next/link"
import ChatbotButton from "@/components/chatbot-button"

export default function RegistrationPage() {
  return (
    <main className="min-h-screen bg-black  py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-primary hover:underline inline-flex items-center">
              ← Back to event
            </Link>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Registration Information</CardTitle>
              <CardDescription>
                Please provide your details to continue with the ticket booking process.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RegistrationForm />
            </CardContent>
          </Card>
        </div>
      </div>

      
    </main>
  )
}

