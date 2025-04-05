"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import { saveRegistrationProgress, getRegistrationProgress } from "@/lib/cookies"
import { generateTransactionId, formatCurrency } from "@/lib/utils"
import { useAnalytics } from "@/components/analytics-provider"

declare global {
  interface Window {
    Razorpay: any;
  }
}


const formSchema = z.object({
  ticketType: z.string({
    required_error: "Please select a ticket type.",
  }),
  quantity: z.number().min(1).max(10),
  addons: z.array(z.string()).optional(),
  promoCode: z.string().optional(),
})

export default function TicketSelectionForm() {
  const router = useRouter()
  const { trackEvent } = useAnalytics()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStartTime, setFormStartTime] = useState<number>(Date.now())
  const [registrationData, setRegistrationData] = useState<any>(null)
  const [promoCodeValid, setPromoCodeValid] = useState<boolean | null>(null)
  const [promoDiscount, setPromoDiscount] = useState<number>(0)
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  // Dummy Data - now directly inside the component
  const dummyTicketData = {
    ticketTypes: [
      { value: "standard", label: "Standard Pass", price: 49, description: "Access to all conference sessions and keynotes.", maxQuantity: 5 },
      { value: "premium", label: "Premium Pass", price: 799, description: "Includes standard pass benefits plus VIP lounge access and networking events.", maxQuantity: 3 },
      { value: "workshop", label: "Workshop Pass", price: 299, description: "Access to pre-conference workshops only.", maxQuantity: 10 },
    ],
    addonOptions: [
      { value: "networking-dinner", label: "Networking Dinner", price: 99, description: "Exclusive dinner with speakers and industry leaders." },
      { value: "conference-swag", label: "Conference Swag Bag", price: 49, description: "Premium merchandise including t-shirt, notebook, and more." },
    ],
    formLabels: {
      ticketTypeLabel: "Conference Pass Type",
      addonsLabel: "Optional Add-ons",
      promoCodeLabel: "Discount Code",
      quantityLabel: "Number of Tickets"
    },
    formDescriptions: {
      addonsDescription: "Enhance your conference experience.",
      promoCodeDescription: "Enter your promotional code if you have one."
    },
    companyName: "Tickease",
    eventDescription: "Business Innovation Conference 2024 Ticket Purchase",
    venueAddress: "Convention Center, New York, NY",
    validPromoCodes: { // Promo codes are now part of dummy data
      TECH25: 25, // 25% discount
      WELCOME10: 10, // 10% discount
      EARLYBIRD: 15, // 15% discount
      VIP2025: 50, // $50 off
    }
  };


  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticketType: dummyTicketData.ticketTypes[0]?.value || "",
      quantity: 1,
      addons: [],
      promoCode: "",
    },
  })


  const watchTicketType = form.watch("ticketType")
  const watchQuantity = form.watch("quantity")
  const watchAddons = form.watch("addons") || []
  const watchPromoCode = form.watch("promoCode")

  // Dynamically load the Razorpay script
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setIsRazorpayLoaded(true);
    script.onerror = () => console.error("Failed to load Razorpay SDK");
    document.body.appendChild(script);
  }, []);


  // Load saved progress and registration data
  useEffect(() => {
    const savedProgress = getRegistrationProgress()
    if (savedProgress.ticketSelection) {
      form.reset(savedProgress.ticketSelection)
    }

    // Get registration data from session storage
    const registrationDataStr = sessionStorage.getItem("registrationData")
    if (registrationDataStr) {
      setRegistrationData(JSON.parse(registrationDataStr))
    }

    // Track form start
    trackEvent("form_start", {
      formName: "ticket_selection",
      timestamp: new Date().toISOString(),
    })

    setFormStartTime(Date.now())

    // Track field interactions
    const handleFieldInteraction = (fieldName: string) => {
      trackEvent("form_field_interaction", {
        formName: "ticket_selection",
        fieldName,
        timestamp: new Date().toISOString(),
      })
    }

    // Add event listeners to form fields
    const formElement = document.querySelector("form")
    if (formElement) {
      const inputElements = formElement.querySelectorAll("input, select, textarea")
      inputElements.forEach((element) => {
        element.addEventListener("focus", () => {
          handleFieldInteraction(element.getAttribute("name") || "unknown")
        })
      })
    }

    return () => {
      // Clean up event listeners
      if (formElement) {
        const inputElements = formElement.querySelectorAll("input, select, textarea")
        inputElements.forEach((element) => {
          element.removeEventListener("focus", () => {})
        })
      }
    }
  }, [form, trackEvent])

  // Save progress as user fills out the form
  useEffect(() => {
    const subscription = form.watch((value) => {
      saveRegistrationProgress("ticketSelection", value)
    })

    return () => subscription.unsubscribe()
  }, [form])

  // Validate promo code
  useEffect(() => {
    if (watchPromoCode && watchPromoCode.length > 0) {
      const validPromoCodes = dummyTicketData.validPromoCodes; // Get promo codes from dummy data
      const code = watchPromoCode.toUpperCase()

      if (validPromoCodes[code as keyof typeof validPromoCodes]) {
        setPromoCodeValid(true)
        setPromoDiscount(validPromoCodes[code as keyof typeof validPromoCodes])

        // Track successful promo code
        trackEvent("promo_code_applied", {
          code: code,
          discount: validPromoCodes[code as keyof typeof validPromoCodes],
          ticketType: watchTicketType,
        })
      } else if (watchPromoCode.length >= 5) {
        setPromoCodeValid(false)
        setPromoDiscount(0)

        // Track invalid promo code
        trackEvent("promo_code_invalid", {
          code: watchPromoCode,
          ticketType: watchTicketType,
        })
      } else {
        setPromoCodeValid(null)
        setPromoDiscount(0)
      }
    } else {
      setPromoCodeValid(null)
      setPromoDiscount(0)
    }
  }, [watchPromoCode, watchTicketType, trackEvent])

  const getTicketPrice = (ticketTypeValue: string) => {
    const foundTicketType = dummyTicketData.ticketTypes.find(type => type.value === ticketTypeValue);
    return foundTicketType ? foundTicketType.price : 0;
  }

  const getAddonPrice = (addonValue: string) => {
    const foundAddon = dummyTicketData.addonOptions.find(addon => addon.value === addonValue);
    return foundAddon ? foundAddon.price : 0;
  }


  const calculateSubtotal = () => {
    const ticketTotal = getTicketPrice(watchTicketType) * watchQuantity;

    const addonTotal = watchAddons.reduce((total, addon) => {
      return total + (getAddonPrice(addon) || 0)
    }, 0)

    return ticketTotal + addonTotal
  }

  const calculateDiscount = () => {
    if (!promoCodeValid) return 0

    const subtotal = calculateSubtotal()

    // If discount is a percentage
    if (promoDiscount < 100) {
      return Math.round((subtotal * promoDiscount) / 100)
    }

    // If discount is a fixed amount
    return Math.min(promoDiscount, subtotal)
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal()
    const discount = calculateDiscount()

    return subtotal - discount
  }


  const initiateRazorpayPayment = async (values: z.infer<typeof formSchema>) => {
    if (!isRazorpayLoaded) {
      alert("Razorpay SDK is not loaded. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAmount = calculateTotal();
      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount, currency: "INR", receipt: generateTransactionId() }),
      });

      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: dummyTicketData.companyName, // Use company name from dummy data
        description: dummyTicketData.eventDescription, // Use event description from dummy data
        order_id: order.id,
        handler: async function (response: any) {
          alert(`Payment successful: ${response.razorpay_payment_id}`);

          // Calculate time spent on form
          const timeSpent = Math.floor((Date.now() - formStartTime) / 1000)
          const transactionId = generateTransactionId();

          // Track successful purchase
          trackEvent("purchase_completed", {
            transactionId,
            ticketType: values.ticketType,
            quantity: values.quantity,
            totalAmount: calculateTotal(),
            paymentMethod: "Razorpay",
          });
           // Prepare complete ticket data
            const completeTicketData = {
              ...values,
              subtotal: calculateSubtotal(),
              discount: calculateDiscount(),
              totalPrice: calculateTotal(),
              purchaseDate: new Date().toISOString(),
              transactionId: response.razorpay_payment_id,
              timeSpentOnForm: timeSpent,
              paymentMethod: "Razorpay",
            };

            // Store ticket data in session storage
            sessionStorage.setItem("ticketData", JSON.stringify(completeTicketData));
            console.log("Ticket data stored in session storage:", completeTicketData);
            router.push("/confirmation");

        },
        prefill: {
          name: registrationData?.firstName + " " + registrationData?.lastName || "Guest User",
          email: registrationData?.email || "guest@example.com",
        },
        notes: {
          address: dummyTicketData.venueAddress, // Use venue address from dummy data
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', function (response: any){
        alert(`Payment Failed: ${response.error.code} - ${response.error.description}`);
        trackEvent("purchase_failed", {
          transactionId: generateTransactionId(),
          ticketType: values.ticketType,
          quantity: values.quantity,
          totalAmount: calculateTotal(),
          paymentMethod: "Razorpay",
          failureReason: response.error.description,
          failureCode: response.error.code,
        });
        setIsSubmitting(false);
      });


    } catch (error) {
      console.error("Payment failed:", error);
      alert("Payment failed. Please try again.");
      setIsSubmitting(false);
    } finally {
      setIsSubmitting(false);
    }
  };


  function onSubmit(values: z.infer<typeof formSchema>) {

    // Track form submission
    trackEvent("purchase_initiated", {
      formName: "ticket_selection",
      timeSpent: Math.floor((Date.now() - formStartTime) / 1000),
      transactionId: generateTransactionId(),
      ticketType: values.ticketType,
      quantity: values.quantity,
      addons: values.addons,
      paymentMethod: "Razorpay",
      totalAmount: calculateTotal(),
      hasPromoCode: !!values.promoCode && promoCodeValid,
      discount: calculateDiscount(),
    });


    initiateRazorpayPayment(values);

  }

  //reset ticket quantity
  useEffect(() => {
    const ticketType = dummyTicketData.ticketTypes.find(type => type.value === watchTicketType);
    if (ticketType) {
      form.setValue("quantity", 1);
    }
  }, [watchTicketType])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="ticketType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{dummyTicketData.formLabels.ticketTypeLabel}</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                  {dummyTicketData.ticketTypes.map((type) => (
                    <FormItem key={type.value} className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={type.value} />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {type.label} - {formatCurrency(type.price)}
                        {type.description && <p className="text-sm text-gray-500">{type.description}</p>}
                      </FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dummyTicketData.formLabels.quantityLabel}</FormLabel>
                <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={dummyTicketData.ticketTypes.find(t => t.value === watchTicketType)?.maxQuantity}
                  {...field}
                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                />
                </FormControl>
              <FormDescription>Maximum {dummyTicketData.ticketTypes.find(t => t.value === watchTicketType)?.maxQuantity} tickets per order</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="addons"
          render={() => (
            <FormItem>
              <div className="mb-4">
                <FormLabel>{dummyTicketData.formLabels.addonsLabel}</FormLabel>
                <FormDescription>{dummyTicketData.formDescriptions.addonsDescription}</FormDescription>
              </div>
              <div className="space-y-4">
                {dummyTicketData.addonOptions.map((addon) => (
                  <FormField
                    key={addon.value}
                    control={form.control}
                    name="addons"
                    render={({ field }) => {
                      return (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(addon.value)}
                              onCheckedChange={(checked) => {
                                return checked
                                  ? field.onChange([...(field.value || []), addon.value])
                                  : field.onChange(field.value?.filter((value) => value !== addon.value))
                              }}
                            />
                          </FormControl>
                          <FormLabel className="font-normal">
                            {addon.label} - {formatCurrency(addon.price)}
                            {addon.description && <p className="text-sm text-gray-500">{addon.description}</p>}
                          </FormLabel>
                        </FormItem>
                      )
                    }}
                  />
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="promoCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{dummyTicketData.formLabels.promoCodeLabel}</FormLabel>
              <div className="flex items-center space-x-2">
                <FormControl>
                  <Input placeholder="Enter promo code" {...field} />
                </FormControl>
                {promoCodeValid === true && (
                  <span className="text-green-500 text-sm">
                    {promoDiscount < 100 ? `${promoDiscount}% off` : `$${promoDiscount} off`}
                  </span>
                )}
                {promoCodeValid === false && <span className="text-red-500 text-sm">Invalid code</span>}
              </div>
              <FormDescription>{dummyTicketData.formDescriptions.promoCodeDescription}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ticket ({dummyTicketData.ticketTypes.find(t => t.value === watchTicketType)?.label || 'N/A'})</span>
                <span>
                  {formatCurrency(getTicketPrice(watchTicketType))} × {watchQuantity}
                </span>
              </div>

              {watchAddons.map((addonValue) => {
                const addon = dummyTicketData.addonOptions.find(ao => ao.value === addonValue);
                return addon ? (
                  <div key={addon.value} className="flex justify-between">
                    <span>{addon.label}</span>
                    <span>{formatCurrency(addon.price)}</span>
                  </div>
                ) : null;
              })}

              <div className="border-t pt-2 mt-2 flex justify-between">
                <span>Subtotal</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>

              {calculateDiscount() > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatCurrency(calculateDiscount())}</span>
                </div>
              )}

              <div className="border-t pt-2 mt-2 flex justify-between font-bold">
                <span>Total</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </CardContent>
        </Card>


        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing Payment...
            </>
          ) : (
            "Pay Now with Razorpay"
          )}
        </Button>
      </form>
    </Form>
  )
}