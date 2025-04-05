"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setIsTransitioning(true)
    
    // Set a small delay to allow animation to complete before changing theme
    setTimeout(() => {
      setTheme(theme === 'dark' ? 'light' : 'dark')
      
      // Reset transition state after animation completes
      setTimeout(() => {
        setIsTransitioning(false)
      }, 300)
    }, 150)
  }

  if (!mounted) {
    return null
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full relative flex items-center justify-center"
      disabled={isTransitioning}
    >
      <div className="relative flex items-center justify-center w-6 h-6">
        {/* Sun Icon */}
        <Sun 
          className={`absolute transition-all duration-300 ${
            isTransitioning 
              ? 'transform rotate-180 scale-150' 
              : theme === 'dark' 
                ? 'opacity-0 rotate-90 scale-0' 
                : 'opacity-100 rotate-0 scale-100'
          }`} 
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`absolute transition-all duration-300 ${
            isTransitioning 
              ? 'transform -rotate-180 scale-150' 
              : theme === 'dark' 
                ? 'opacity-100 rotate-0 scale-100' 
                : 'opacity-0 -rotate-90 scale-0'
          }`} 
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}