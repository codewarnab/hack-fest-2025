"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import EventBanner from "@/components/event-banner"
import ChatbotButton from "@/components/chatbot-button"
import { SiteHeader } from "@/components/site-header"
import { FlashSaleBanner } from "@/components/flash-sale-banner"
import { EventCategories } from "@/components/event-categories"
import { useRouter } from "next/navigation"
import { Facebook, Instagram, Twitter } from "lucide-react"


export default function HomePage() {
  const router = useRouter()

  // Dummy event data
  const event = {
    id: "event-123",
    title: "Tech Conference 2025: Innovation Summit",
    date: "May 15-17, 2025",
    time: "9:00 AM - 6:00 PM",
    location: "San Francisco Convention Center",
    description:
      "Join us for the biggest tech conference of the year featuring keynotes from industry leaders, hands-on workshops, networking opportunities, and the latest innovations in technology. Early bird tickets available now!",
    image: "https://data.10thcollection.com/1663160999122.jpg",
    category: "Technology",
    attendees: 1250,
    featured: true,
    price: {
      earlyBird: 299,
      regular: 399,
      vip: 699,
    },
  }

  // Flash sale data
  const flashSale = {
    title: "Early Bird Flash Sale",
    originalPrice: event.price.regular,
    salePrice: event.price.earlyBird,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    code: "FLASH25",
  }


  const handleGetTickets = () => {
    router.push("/registration")
  }

  return (
    <>
      <SiteHeader />
      <main className="min-h-screen">
        <div className="container mx-auto px-4 py-8 space-y-8">
          {/* Hero Banner */}
          <EventBanner event={event} />

          {/* Flash Sale Banner */}
          <div className="my-8">
            <FlashSaleBanner {...flashSale} onGetTickets={handleGetTickets} />
          </div>

          {/* Event Categories */}
          <div className="my-8">
            <EventCategories />
          </div>

          {/* Event Description */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">About This Event</h2>
            <p className="text-muted-foreground">{event.description}</p>
            <div className="flex justify-center gap-4 pt-2">
              <Link href="/registration">
                <Button size="lg" className="bg-red-900 bg-blend-soft-light shadow-amber-500 text-white hover:bg-red-950" >Book Ticket</Button>
              </Link>
              <Button variant="outline" size="lg">
                Share Event
              </Button>
            </div>
          </div>

       

        

          {/* social media follow */}
            <div className="mt-16  rounded-lg p-8 text-center text-white shadow-2xl">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Stay Connected</h2>
              <p className="mb-8 max-w-xl mx-auto text-base md:text-lg">
              Follow us on social media or subscribe to stay updated with the latest events, exclusive offers, and more.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
              <Button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-lg"
                onClick={() => window.open("https://facebook.com", "_blank")}
              >
                Follow on <Facebook size={20} />
              </Button>
              <Button
                className="flex items-center gap-2 bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-md"
                onClick={() => window.open("https://instagram.com", "_blank")}
              >
                Follow on <Instagram size={20} />
              </Button>
              <Button
                className="flex items-center gap-2 bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-md"
                onClick={() => window.open("https://twitter.com", "_blank")}
              >
                Follow on <Twitter size={20} />
              </Button>
              
            </div>
            </div>
        </div>
      </main>

      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <span className="font-bold text-xl">EventTix</span>
              <span className="text-muted-foreground text-sm">© 2025 All rights reserved</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <ChatbotButton />
    </>
  )
}