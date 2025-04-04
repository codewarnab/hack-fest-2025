"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MessageCircle, X } from "lucide-react"
import ChatInterface from "./chat-interface"
import "./button.css" // Import custom CSS for animations

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating chat button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg glow-animation hover:scale-110 transition-transform duration-300"
        aria-label="Open chat"
      >
        <MessageCircle size={24} />
      </Button>

      {/* Chat interface */}
      {isOpen && (
        <Card className="fixed bottom-24 right-6 w-[390px] h-[500px] shadow-xl flex flex-col overflow-hidden z-50 slide-in-animation">
          <div className="bg-primary text-primary-foreground p-3 flex justify-between items-center">
            <h3 className="font-medium">Event Assistant</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 text-primary-foreground hover:text-primary-foreground/80"
            >
              <X size={18} />
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <ChatInterface />
          </div>
        </Card>
      )}
    </>
  )
}

