"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, ArrowLeft } from "lucide-react" // Removed Search import
import Link from "next/link"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

export default function EventNotFound() {
  const router = useRouter()
  
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1,
      scale: 1,
      transition: { 
        staggerChildren: 0.15,
        delayChildren: 0.3,
        duration: 0.5
      }
    }
  }
  
  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-red-50 to-amber-50 dark:from-slate-950 dark:to-slate-900">
      <motion.div 
        className="w-full max-w-lg"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <Card className="border-none shadow-2xl backdrop-blur-sm bg-white/80 dark:bg-slate-900/90 overflow-hidden relative">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-100 dark:bg-red-900/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-100 dark:bg-amber-900/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl"></div>
          
          <CardHeader className="text-center relative z-10 pt-10">
            <motion.div 
              variants={itemVariants} 
              className="mx-auto mb-8"
            >
              <img 
                src="https://i.postimg.cc/cJ1D7YNB/8102458.webp" 
                alt="Search Icon" 
                className="h-32 w-32"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardTitle className="text-3xl sm:text-4xl font-bold mb-2 bg-gradient-to-r from-red-900 to-amber-900 dark:from-red-400 dark:to-amber-400 text-transparent bg-clip-text">
                Event Not Found
              </CardTitle>
            </motion.div>
          </CardHeader>
          
          <CardContent className="text-center space-y-6 relative z-10 px-8">
            <motion.p variants={itemVariants} className="text-slate-600 dark:text-slate-300 text-lg">
              We couldn't find the event you were looking for. It might have been removed, renamed, or the URL might be incorrect.
            </motion.p>
            
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-r from-amber-50 to-red-50 dark:from-amber-950/50 dark:to-red-950/50 p-6 rounded-xl max-w-sm mx-auto my-6 border border-amber-100 dark:border-amber-900/50"
            >
              <Calendar className="h-8 w-8 text-amber-700 dark:text-amber-400 mx-auto mb-3" />
              <p className="text-base font-medium text-slate-700 dark:text-slate-300">
                Meanwhile, check out our featured events happening soon!
              </p>
            </motion.div>
          </CardContent>
          
          <CardFooter className="flex justify-center relative z-10 pb-10">
            <motion.div variants={itemVariants}>
              <Link href="/">
                <Button className="bg-gradient-to-r from-red-900 to-amber-800 dark:from-red-700 dark:to-amber-600 text-white hover:opacity-90 transition-all shadow-lg hover:shadow-xl px-8">
                  Return to Home
                </Button>
              </Link>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}