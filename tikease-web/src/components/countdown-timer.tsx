"use client"

import { useEffect, useState } from "react"

interface CountdownTimerProps {
  endTime: Date
  onComplete?: () => void
}

export function CountdownTimer({ endTime, onComplete }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  })
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = endTime.getTime() - new Date().getTime()

      if (difference <= 0) {
        setIsComplete(true)
        if (onComplete) onComplete()
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
        }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }

    setTimeLeft(calculateTimeLeft())

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [endTime, onComplete])

  const formatNumber = (num: number) => {
    return num < 10 ? `0${num}` : num
  }

  if (isComplete) {
    return <div className="text-center text-muted-foreground">Offer expired</div>
  }

  return (
    <div className="flex justify-center gap-2 md:gap-4">
      <div className="flex flex-col items-center">
        <div className="bg-primary/10 text-primary rounded-md px-2 py-1 min-w-[40px] text-center font-mono text-lg md:text-2xl font-bold">
          {formatNumber(timeLeft.days)}
        </div>
        <span className="text-xs mt-1 text-muted-foreground">Days</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary/10 text-primary rounded-md px-2 py-1 min-w-[40px] text-center font-mono text-lg md:text-2xl font-bold">
          {formatNumber(timeLeft.hours)}
        </div>
        <span className="text-xs mt-1 text-muted-foreground">Hours</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary/10 text-primary rounded-md px-2 py-1 min-w-[40px] text-center font-mono text-lg md:text-2xl font-bold">
          {formatNumber(timeLeft.minutes)}
        </div>
        <span className="text-xs mt-1 text-muted-foreground">Mins</span>
      </div>
      <div className="flex flex-col items-center">
        <div className="bg-primary/10 text-primary rounded-md px-2 py-1 min-w-[40px] text-center font-mono text-lg md:text-2xl font-bold">
          {formatNumber(timeLeft.seconds)}
        </div>
        <span className="text-xs mt-1 text-muted-foreground">Secs</span>
      </div>
    </div>
  )
}

