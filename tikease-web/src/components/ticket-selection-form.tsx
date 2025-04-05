"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
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
import { saveRegistrationProgress, getRegistrationProgress, getCookie } from "@/lib/cookies"
import { generateTransactionId, formatCurrency } from "@/lib/utils"
import { useAnalytics } from "@/components/analytics-provider"
import { createClient } from "../../utils/supabase/client"

declare global {
  interface Window {
    Razorpay: any;
  }
}

// Ticket data moved outside component to prevent re-creation on each render
const TICKET_DATA = {
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
  validPromoCodes: {
    TECH25: 25,
    WELCOME10: 10,
    EARLYBIRD: 15,
    VIP2025: 50,
  }
};

const formSchema = z.object({
  ticketType: z.string({
    required_error: "Please select a ticket type.",
  }),
  quantity: z.number().min(1).max(10),
  addons: z.array(z.string()).optional(),
  promoCode: z.string().optional(),
});

// Create Supabase client once, outside the component
const supabaseClient = createClient();

// Load Razorpay script only once
const loadRazorpayScript = () => {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    
    if (document.getElementById('razorpay-script')) {
      const checkInterval = setInterval(() => {
        if (window.Razorpay) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }
    
    const script = document.createElement("script");
    script.id = 'razorpay-script';
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Razorpay SDK"));
    document.body.appendChild(script);
  });
};

export default function TicketSelectionForm() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStartTime] = useState<number>(Date.now());
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [promoCodeValid, setPromoCodeValid] = useState<boolean | null>(null);
  const [promoDiscount, setPromoDiscount] = useState<number>(0);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [userId, setUserId] = useState<any>(undefined);
  const [eventId, setEventId] = useState<any>(undefined);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ticketType: TICKET_DATA.ticketTypes[0]?.value || "",
      quantity: 1,
      addons: [],
      promoCode: "",
    },
  });

  const watchTicketType = form.watch("ticketType");
  const watchQuantity = form.watch("quantity");
  const watchAddons = form.watch("addons") || [];
  const watchPromoCode = form.watch("promoCode");

  // Initialize user data and load Razorpay
  useEffect(() => {
    // Load Razorpay SDK
    loadRazorpayScript()
      .then(() => {
        console.log("Razorpay SDK loaded successfully");
        setIsRazorpayLoaded(true);
      })
      .catch(error => console.error(error));
    
    // Get user and event IDs
    const userIdFromCookie = localStorage.getItem("userId");
    const eventIdFromStorage = localStorage.getItem("EventId");
    console.log("User ID from cookie:", userIdFromCookie, "\nEvent ID from storage:", eventIdFromStorage);
    setUserId(userIdFromCookie);
    setEventId(eventIdFromStorage);
  }, []);

  // Load saved progress and track form start
  useEffect(() => {
    const savedProgress = getRegistrationProgress();
    if (savedProgress.ticketSelection) {
      form.reset(savedProgress.ticketSelection);
    }

    const registrationDataStr = sessionStorage.getItem("registrationData");
    if (registrationDataStr) {
      setRegistrationData(JSON.parse(registrationDataStr));
    }

    trackEvent("form_start", {
      formName: "ticket_selection",
      timestamp: new Date().toISOString(),
    });

    // Add field interaction tracking
    const handleFieldInteraction = (fieldName: string) => {
      trackEvent("form_field_interaction", {
        formName: "ticket_selection",
        fieldName,
        timestamp: new Date().toISOString(),
      });
    };

    const formElement = document.querySelector("form");
    if (formElement) {
      const inputElements = formElement.querySelectorAll("input, select, textarea");
      inputElements.forEach((element) => {
        element.addEventListener("focus", () => {
          handleFieldInteraction(element.getAttribute("name") || "unknown");
        });
      });
    }

    return () => {
      if (formElement) {
        const inputElements = formElement.querySelectorAll("input, select, textarea");
        inputElements.forEach((element) => {
          element.removeEventListener("focus", () => {});
        });
      }
    };
  }, [form, trackEvent]);

  // Save form progress on changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      saveRegistrationProgress("ticketSelection", value);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Reset quantity when ticket type changes
  useEffect(() => {
    const ticketType = TICKET_DATA.ticketTypes.find(type => type.value === watchTicketType);
    if (ticketType) {
      form.setValue("quantity", 1);
    }
  }, [watchTicketType, form]);

  // Handle promo code validation
  useEffect(() => {
    if (!watchPromoCode || watchPromoCode.length === 0) {
      setPromoCodeValid(null);
      setPromoDiscount(0);
      return;
    }

    const code = watchPromoCode.toUpperCase();
    const discount = TICKET_DATA.validPromoCodes[code as keyof typeof TICKET_DATA.validPromoCodes];

    if (discount) {
      setPromoCodeValid(true);
      setPromoDiscount(discount);
      trackEvent("promo_code_applied", {
        code,
        discount,
        ticketType: watchTicketType,
      });
    } else if (watchPromoCode.length >= 5) {
      setPromoCodeValid(false);
      setPromoDiscount(0);
      trackEvent("promo_code_invalid", {
        code: watchPromoCode,
        ticketType: watchTicketType,
      });
    } else {
      setPromoCodeValid(null);
      setPromoDiscount(0);
    }
  }, [watchPromoCode, watchTicketType, trackEvent]);

  // Price calculation functions with memoization
  const getTicketPrice = useCallback((ticketTypeValue: string) => {
    const foundTicketType = TICKET_DATA.ticketTypes.find(type => type.value === ticketTypeValue);
    return foundTicketType ? foundTicketType.price : 0;
  }, []);

  const getAddonPrice = useCallback((addonValue: string) => {
    const foundAddon = TICKET_DATA.addonOptions.find(addon => addon.value === addonValue);
    return foundAddon ? foundAddon.price : 0;
  }, []);

  const calculateSubtotal = useCallback(() => {
    const ticketTotal = getTicketPrice(watchTicketType) * watchQuantity;
    const addonTotal = watchAddons.reduce((total, addon) => {
      return total + getAddonPrice(addon);
    }, 0);
    return ticketTotal + addonTotal;
  }, [watchTicketType, watchQuantity, watchAddons, getTicketPrice, getAddonPrice]);

  const calculateDiscount = useCallback(() => {
    if (!promoCodeValid) return 0;
    const subtotal = calculateSubtotal();
    return promoDiscount < 100 
      ? Math.round((subtotal * promoDiscount) / 100) 
      : Math.min(promoDiscount, subtotal);
  }, [promoCodeValid, promoDiscount, calculateSubtotal]);

  const calculateTotal = useCallback(() => {
    return calculateSubtotal() - calculateDiscount();
  }, [calculateSubtotal, calculateDiscount]);

  // Database functions
  const saveTransactionToDatabase = useCallback(async (transactionData: any, status: string = "pending") => {
    try {
      if (!userId || !eventId) {
        return { success: false, error: "Missing user ID or event ID" };
      }
      
      const transactionRecord = {
        transaction_id: transactionData.transactionId,
        event_id: eventId,
        user_id: userId,
        ticket_type: transactionData.ticketType,
        quantity: transactionData.quantity.toString(),
        addons: transactionData.addons || [],
        total_amount: transactionData.totalPrice.toString(),
        payment_method: transactionData.paymentMethod || "Razorpay",
        discount: transactionData.discount ? transactionData.discount.toString() : "0.00",
        promo_code: transactionData.promoCode || null,
        status: status,
        timestamp: new Date().toISOString()
      };
      
      console.log(transactionRecord);

      const { data, error } = await supabaseClient
        .from('transactions')
        .insert(transactionRecord)
        .select()
        .single();
      
      if (error) {
        console.error("Error saving transaction:", error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Transaction save error:", error);
      return { success: false, error: String(error) };
    }
  }, [userId, eventId]);

  // Function to fetch payment details from our API endpoint that proxies Razorpay
  const fetchRazorpayPaymentDetails = useCallback(async (paymentId: string) => {
    try {
      const response = await fetch(`/api/payment-details?paymentId=${paymentId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch payment details: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error("Error fetching Razorpay payment details:", error);
      return null;
    }
  }, []);

  const updateTransactionStatus = useCallback(async (transactionId: string, status: string, paymentDetails?: any) => {
    try {
      const updateData: any = { status };
      
      if (paymentDetails) {
        updateData.payment_details = paymentDetails;
      }
      
      const { data, error } = await supabaseClient
        .from('transactions')
        .update(updateData)
        .eq('transaction_id', transactionId)
        .select()
        .single();
      
      if (error) {
        console.error("Error updating transaction:", error);
        return { success: false, error: error.message };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error("Transaction update error:", error);
      return { success: false, error: String(error) };
    }
  }, []);

  // Payment handling
  const initiateRazorpayPayment = useCallback(async (values: z.infer<typeof formSchema>) => {
    if (!isRazorpayLoaded) {
      alert("Razorpay SDK is not loaded. Please try again.");
      return;
    }

    setIsSubmitting(true);

    try {
      const totalAmount = calculateTotal();
      const transactionId = generateTransactionId();
      
      // Prepare complete ticket data
      const completeTicketData = {
        ...values,
        subtotal: calculateSubtotal(),
        discount: calculateDiscount(),
        totalPrice: totalAmount,
        purchaseDate: new Date().toISOString(),
        transactionId: transactionId,
        timeSpentOnForm: Math.floor((Date.now() - formStartTime) / 1000),
        paymentMethod: "Razorpay",
      };
      
      // Create pending transaction record
      const initialSaveResult = await saveTransactionToDatabase(completeTicketData, "pending");
      if (!initialSaveResult.success) {
        alert("Failed to process your order. Please try again.");
        setIsSubmitting(false);
        return;
      }

      const res = await fetch("/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: totalAmount, currency: "INR", receipt: transactionId }),
      });

      const order = await res.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: TICKET_DATA.companyName,
        description: TICKET_DATA.eventDescription,
        order_id: order.id,
        handler: async function (response: any) {
          // Payment successful - update transaction status
          const razorpayPaymentId = response.razorpay_payment_id;
          
          // Fetch complete payment details from Razorpay API
          const paymentDetails = await fetchRazorpayPaymentDetails(razorpayPaymentId);
          
          // Update transaction with complete payment details
          await updateTransactionStatus(
            transactionId, 
            "completed",
            paymentDetails || {
              // Fallback to basic payment details if API call fails
              razorpay_payment_id: razorpayPaymentId,
              razorpay_order_id: order.id,
              razorpay_signature: response.razorpay_signature,
              payment_time: new Date().toISOString()
            }
          );

          trackEvent("purchase_completed", {
            transactionId,
            ticketType: values.ticketType,
            quantity: values.quantity,
            totalAmount: calculateTotal(),
            paymentMethod: "Razorpay",
            razorpayPaymentId,
          });

          // Store ticket data in session storage with updated payment info
          const finalTicketData = {
            ...completeTicketData,
            razorpayPaymentId,
            status: "completed",
          };
          
          sessionStorage.setItem("ticketData", JSON.stringify(finalTicketData));
          alert(`Payment successful: ${razorpayPaymentId}`);
          router.push("/confirmation");
        },
        prefill: {
          name: registrationData?.firstName && registrationData?.lastName 
            ? `${registrationData.firstName} ${registrationData.lastName}` 
            : "Guest User",
          email: registrationData?.email || "guest@example.com",
        },
        notes: {
          address: TICKET_DATA.venueAddress,
          transaction_id: transactionId,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
      rzp.on('payment.failed', async function (response: any){
        // Payment failed - update transaction status
        await updateTransactionStatus(
          transactionId, 
          "failed",
          {
            error_code: response.error.code,
            error_description: response.error.description,
            error_source: response.error.source,
            error_step: response.error.step,
            error_reason: response.error.reason,
            failure_time: new Date().toISOString()
          }
        );
        
        alert(`Payment Failed: ${response.error.code} - ${response.error.description}`);
        trackEvent("purchase_failed", {
          transactionId,
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
  }, [
    isRazorpayLoaded, 
    calculateTotal, 
    calculateSubtotal, 
    calculateDiscount, 
    formStartTime, 
    saveTransactionToDatabase, 
    updateTransactionStatus,
    fetchRazorpayPaymentDetails,
    trackEvent, 
    registrationData, 
    router
  ]);

  const onSubmit = useCallback((values: z.infer<typeof formSchema>) => {
    initiateRazorpayPayment(values);
  }, [initiateRazorpayPayment]);

  // Selected ticket type data
  const selectedTicketType = useMemo(() => 
    TICKET_DATA.ticketTypes.find(t => t.value === watchTicketType) || TICKET_DATA.ticketTypes[0],
  [watchTicketType]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="ticketType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{TICKET_DATA.formLabels.ticketTypeLabel}</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                  {TICKET_DATA.ticketTypes.map((type) => (
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
              <FormLabel>{TICKET_DATA.formLabels.quantityLabel}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={selectedTicketType?.maxQuantity}
                  {...field}
                  onChange={(e) => field.onChange(Number.parseInt(e.target.value))}
                />
              </FormControl>
              <FormDescription>Maximum {selectedTicketType?.maxQuantity} tickets per order</FormDescription>
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
                <FormLabel>{TICKET_DATA.formLabels.addonsLabel}</FormLabel>
                <FormDescription>{TICKET_DATA.formDescriptions.addonsDescription}</FormDescription>
              </div>
              <div className="space-y-4">
                {TICKET_DATA.addonOptions.map((addon) => (
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
              <FormLabel>{TICKET_DATA.formLabels.promoCodeLabel}</FormLabel>
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
              <FormDescription>{TICKET_DATA.formDescriptions.promoCodeDescription}</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Card>
          <CardContent className="p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Ticket ({selectedTicketType?.label || 'N/A'})</span>
                <span>
                  {formatCurrency(getTicketPrice(watchTicketType))} × {watchQuantity}
                </span>
              </div>

              {watchAddons.map((addonValue) => {
                const addon = TICKET_DATA.addonOptions.find(ao => ao.value === addonValue);
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