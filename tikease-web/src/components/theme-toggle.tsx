"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [animating, setAnimating] = useState(false)
  
  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    // Start animation
    setAnimating(true)
    
    // Wait for animation to start before changing theme
    setTimeout(() => {
      setTheme(theme === 'dark' ? 'light' : 'dark')
      
      // Clear animation state after transition completes
      setTimeout(() => {
        setAnimating(false)
      }, 600)
    }, 10)
  }

  if (!mounted) {
    return null
  }

  const isDark = theme === 'dark'
  const currentIcon = isDark ? 'moon' : 'sun'
  const targetIcon = animating ? (isDark ? 'sun' : 'moon') : currentIcon

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={toggleTheme}
      className="rounded-full relative flex items-center justify-center h-10 w-10"
      disabled={animating}
    >
      <div className="relative flex items-center justify-center w-full h-full">
        {/* Sun Icon */}
        <Sun 
          className={`absolute h-5 w-5 transform transition-all duration-500 ease-in-out ${
            targetIcon === 'sun' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-0'
          }`}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`absolute h-5 w-5 transform transition-all duration-500 ease-in-out ${
            targetIcon === 'moon' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-0'
          }`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}