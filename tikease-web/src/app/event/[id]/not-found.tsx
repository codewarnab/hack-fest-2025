"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function EventNotFound() {
  const router = useRouter()
  
  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div 
        className="w-full max-w-md"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border-2 border-dashed overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-red-900/10 rounded-full -translate-y-1/2 translate-x-1/2 z-0"></div>
          <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary/10 rounded-full translate-y-1/2 -translate-x-1/2 z-0"></div>
          
          <CardHeader className="text-center relative z-10">
            <motion.div variants={itemVariants} className="mx-auto mb-4">
              <Search className="h-12 w-12 text-red-900/70 mx-auto" />
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl sm:text-3xl font-bold mb-2">Event Not Found</CardTitle>
            </motion.div>
          </CardHeader>
          
          <CardContent className="text-center space-y-4 relative z-10">
            <motion.p variants={itemVariants} className="text-muted-foreground">
              We couldn't find the event you were looking for. It might have been removed, renamed, or the URL might be incorrect.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="bg-muted p-4 rounded-lg max-w-sm mx-auto my-6"
            >
              <Calendar className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium">Meanwhile, check out our featured events happening soon!</p>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
            <motion.div variants={itemVariants}>
              <Button 
                onClick={() => router.back()} 
                variant="outline"
                className="w-full sm:w-auto flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Link href="/">
                <Button className="w-full sm:w-auto bg-red-900 bg-blend-soft-light shadow-amber-500 text-white hover:bg-red-950">
                  Browse Events
                </Button>
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}