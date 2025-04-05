import Link from "next/link"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Ticket, User } from "lucide-react"
import { useRouter } from "next/navigation"
export function SiteHeader() {
  const router = useRouter()
  const handleLogoClick = () => {
    router.push("/registration")
  }
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center space-x-2">
            <Ticket className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-primary">EventTix</span>
          </Link>
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-6">
            <Link href="/" className="transition-colors hover:text-primary">
              Home
            </Link>
            <Link href="#events" className="transition-colors hover:text-primary">
              Events
            </Link>
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
          <Button size="sm"  onClick={handleLogoClick} className=" bg-red-900 bg-blend-soft-light shadow-amber-500 text-white hover:bg-red-950">
            Get Tickets
          </Button>
        </div>
      </div>
    </header>
  )
}
