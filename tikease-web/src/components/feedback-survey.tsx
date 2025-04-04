"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { X } from "lucide-react"
import { useAnalytics } from "@/components/analytics-provider"

export default function FeedbackSurvey() {
  const { trackEvent } = useAnalytics()
  const [isVisible, setIsVisible] = useState(true)
  const [step, setStep] = useState(1)
  const [satisfaction, setSatisfaction] = useState<number | null>(null)
  const [easeOfUse, setEaseOfUse] = useState<number | null>(null)
  const [feedback, setFeedback] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)

  const handleClose = () => {
    trackEvent("feedback_survey_dismissed", {
      step,
      completed: false,
    })
    setIsVisible(false)
  }

  const handleSubmit = () => {
    if (!satisfaction) return

    setIsSubmitting(true)

    // Track survey submission
    trackEvent("feedback_survey_submitted", {
      satisfaction,
      easeOfUse,
      hasFeedback: feedback.length > 0,
      feedbackLength: feedback.length,
    })

    // Simulate submission
    setTimeout(() => {
      setIsSubmitting(false)
      setIsCompleted(true)

      // Auto-close after showing thank you message
      setTimeout(() => {
        setIsVisible(false)
      }, 3000)
    }, 1000)
  }

  const handleNext = () => {
    if (step === 1 && !satisfaction) return
    if (step === 2 && !easeOfUse) return

    setStep(step + 1)

    // Track progress through survey
    trackEvent("feedback_survey_step_completed", {
      step,
      satisfaction: step === 1 ? satisfaction : undefined,
      easeOfUse: step === 2 ? easeOfUse : undefined,
    })
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
          {!isCompleted && <CardDescription>Help us improve your booking experience</CardDescription>}
        </CardHeader>
        <CardContent>
          {isCompleted ? (
            <p className="text-center py-4">Thank you for your feedback! We appreciate your input.</p>
          ) : (
            <>
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">How satisfied are you with the booking process?</p>
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

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">How easy was it to complete your booking?</p>
                  <RadioGroup
                    value={easeOfUse?.toString()}
                    onValueChange={(value) => setEaseOfUse(Number.parseInt(value))}
                    className="flex justify-between"
                  >
                    {[1, 2, 3, 4, 5].map((value) => (
                      <div key={value} className="flex flex-col items-center">
                        <RadioGroupItem value={value.toString()} id={`ease-${value}`} className="sr-only" />
                        <Label
                          htmlFor={`ease-${value}`}
                          className={`cursor-pointer flex flex-col items-center space-y-1 ${
                            easeOfUse === value ? "text-primary" : ""
                          }`}
                        >
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                              easeOfUse === value ? "border-primary bg-primary/10" : "border-gray-200"
                            }`}
                          >
                            {value}
                          </div>
                          <span className="text-xs">{value === 1 ? "Difficult" : value === 5 ? "Very Easy" : ""}</span>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-sm font-medium">Any additional feedback or suggestions?</p>
                  <Textarea
                    placeholder="Share your thoughts with us..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                  />
                </div>
              )}
            </>
          )}
        </CardContent>
        {!isCompleted && (
          <CardFooter className="flex justify-end space-x-2">
            {step > 1 && step < 3 && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                Back
              </Button>
            )}

            {step < 3 ? (
              <Button onClick={handleNext}>Next</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Feedback"}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

