"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
interface EventBannerProps {
  event: {
    id: string
    title: string
    date: string
    time: string
    location: string
    image: string
    category: string
    attendees: number
    featured?: boolean
  }
}

export default function EventBanner({ event }: EventBannerProps) {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()
  const handleClick = () => {
    router.push("/registration")
  }
  useEffect(() => {
    // Delay animation to ensure it runs after component mount
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative w-full h-[500px] md:h-[600px] overflow-hidden rounded-lg">
      {/* Background image with overlay */}
      <Image
        src={event.image || "/placeholder.svg"}
        alt={`${event.title} banner`}
        fill
        className="object-cover"
        priority
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />

      {/* Content container */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-12">
        <div className="max-w-3xl">
          {/* Category badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5 }}
          >
            <Badge className="mb-4" variant={event.featured ? "default" : "secondary"}>
              {event.category}
              {event.featured && " • Featured Event"}
            </Badge>
          </motion.div>

          {/* Event title */}
          <motion.h1
            className="text-3xl md:text-5xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {event.title}
          </motion.h1>

          {/* Event details */}
          <motion.div
            className="flex flex-wrap gap-4 mb-6 text-white/90"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{event.date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{event.attendees.toLocaleString()} attending</span>
            </div>
          </motion.div>

          {/* Call to action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-wrap gap-3"
          >
            <Button size="lg" onClick={handleClick}  className="font-semibold bg-red-900 bg-blend-soft-light shadow-amber-500 text-white hover:bg-red-950">
              Get Tickets
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="bg-black/30 text-white border-white/30 hover:bg-black/50 hover:text-white"
            >
              Learn More
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

