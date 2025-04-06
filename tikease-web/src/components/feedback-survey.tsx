"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { useAnalytics } from "@/components/analytics-provider"
import { createClient } from "../../utils/supabase/client"

export default function FeedbackSurvey() {
  const { trackEvent } = useAnalytics()
  const [isVisible, setIsVisible] = useState(true)
  const [satisfaction, setSatisfaction] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  
  // Create Supabase client
  const supabaseClient = createClient()

  const handleClose = () => {
    trackEvent("feedback_survey_dismissed", {
      completed: false,
    })
    setIsVisible(false)
  }

  const handleSubmit = async () => {
    if (!satisfaction) return

    setIsSubmitting(true)

    try {
      // Get current event ID
      const eventId = localStorage.getItem("EventId")
      const userId = localStorage.getItem("userId")
      
      if (!eventId) {
        console.error("No event ID found in localStorage")
        setIsSubmitting(false)
        return
      }

      // Update the events table with feedback
      const { error } = await supabaseClient
        .from('transactions')
        .update({
          feedback_rating: satisfaction  // Using the feedback_rating column in events table
        })
        .eq('user_id', userId)

      if (error) {
        console.error("Error saving feedback:", error)
        // Still show thank you message even if database save fails
      }

      // Track survey submission
      trackEvent("feedback_survey_submitted", {
        satisfaction,
        eventId
      })

      setIsSubmitting(false)
      setIsCompleted(true)

      // Auto-close after showing thank you message
      setTimeout(() => {
        setIsVisible(false)
      }, 3000)
    } catch (error) {
      console.error("Failed to submit feedback:", error)
      setIsSubmitting(false)
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-md">
      <Card className="shadow-lg">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">{isCompleted ? "Thank You!" : "Quick Feedback"}</CardTitle>
            <Button variant="ghost" size="icon" onClick={handleClose} className="h-8 w-8">
              <X size={18} />
            </Button>
          </div>
          {!isCompleted && <CardDescription>How was your experience with Tikease?</CardDescription>}
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <p className="text-center py-4">Thank you for your feedback! We appreciate your input.</p>
          ) : (
            <div className="space-y-4">
              <p className="text-sm font-medium">Overall satisfaction</p>
              <RadioGroup
                value={satisfaction?.toString()}
                onValueChange={(value) => setSatisfaction(Number.parseInt(value))}
                className="flex justify-between"
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem value={value.toString()} id={`satisfaction-${value}`} className="sr-only" />
                    <Label
                      htmlFor={`satisfaction-${value}`}
                      className={`cursor-pointer flex flex-col items-center space-y-1 ${
                        satisfaction === value ? "text-primary" : ""
                      }`}
                    >
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                          satisfaction === value ? "border-primary bg-primary/10" : "border-gray-200"
                        }`}
                      >
                        {value}
                      </div>
                      <span className="text-xs">{value === 1 ? "Poor" : value === 5 ? "Excellent" : ""}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          )}
        </CardContent>
        {!isCompleted && (
          <CardFooter className="flex justify-end space-x-2">
            <Button onClick={handleSubmit} disabled={isSubmitting || !satisfaction}>
              {isSubmitting ? "Submitting..." : "Submit Feedback"}
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

