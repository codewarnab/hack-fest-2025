import { Button } from "@/components/ui/button"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Briefcase, Music, Ticket, Utensils, Users, Code, Palette, Mic, Dumbbell, GraduationCap } from "lucide-react"

const categories = [
  { name: "All Events", icon: Ticket },
  { name: "Technology", icon: Code },
  { name: "Business", icon: Briefcase },
  { name: "Music", icon: Music },
  { name: "Food & Drink", icon: Utensils },
  { name: "Networking", icon: Users },
  { name: "Arts", icon: Palette },
  { name: "Comedy", icon: Mic },
  { name: "Sports", icon: Dumbbell },
  { name: "Education", icon: GraduationCap },
]

export function EventCategories() {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex w-max space-x-4 p-1">
        {categories.map((category) => {
          const Icon = category.icon
          return (
            <Button key={category.name} variant="outline" className="flex items-center gap-2 rounded-full" size="sm">
              <Icon className="h-4 w-4" />
              {category.name}
            </Button>
          )
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  )
}

