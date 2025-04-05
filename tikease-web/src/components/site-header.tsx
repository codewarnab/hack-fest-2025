import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Ticket } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary">Tickease</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            <Link href="#about" className="transition-colors hover:text-primary">
              About
            </Link>
            <Link href="#contact" className="transition-colors hover:text-primary">
              Contact
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/registration">
            <Button size="sm" className="bg-red-900 bg-blend-soft-light shadow-amber-500 text-white hover:bg-red-950">
              Get Tickets
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
