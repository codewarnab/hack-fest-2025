"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CountdownTimer } from "./countdown-timer"
import { Sparkles } from "lucide-react"
import { useState } from "react"
import { formatCurrency } from "@/lib/utils"
import Link from "next/link"

interface FlashSaleProps {
  title: string
  originalPrice: number
  salePrice: number
  endTime: Date
  code: string
  ticketUrl: string // Changed from onGetTickets function to ticketUrl string
}

export function FlashSaleBanner({ title, originalPrice, salePrice, endTime, code, ticketUrl }: FlashSaleProps) {
  const [isCopied, setIsCopied] = useState(false)
  const discount = Math.round(((originalPrice - salePrice) / originalPrice) * 100)

  const copyCode = () => {
    navigator.clipboard.writeText(code)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <Card className="border-primary/20 overflow-hidden">
      <div className="bg-primary px-4 py-1 text-primary-foreground text-center text-sm font-medium">
        Limited Time Offer
      </div>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <h3 className="font-bold text-lg">{title}</h3>
              <Badge variant="destructive" className="ml-1">
                {discount}% OFF
              </Badge>
            </div>
            <p className="text-muted-foreground text-sm mb-2">
              Use code{" "}
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs cursor-pointer" onClick={copyCode}>
                {code}
              </span>{" "}
              {isCopied && <span className="text-green-500 text-xs ml-1">Copied!</span>}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold">{formatCurrency(salePrice)}</span>
              <span className="text-muted-foreground line-through">{formatCurrency(originalPrice)}</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Offer ends in:</p>
              <CountdownTimer endTime={endTime} />
            </div>
            <Link href={ticketUrl}>
              <Button className="w-full md:w-auto bg-red-900 bg-blend-soft-light shadow-amber-500 text-white hover:bg-red-950">
                Get Tickets Now
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

