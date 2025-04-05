"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardFooter, CardTitle } from "@/components/ui/card"
import { getUserDeviceInfo, getLocationFromIP } from "@/lib/utils"
import { saveRegistrationProgress, getRegistrationProgress } from "@/lib/cookies"
import { useAnalytics } from "@/components/analytics-provider"
import { Loader2 } from "lucide-react"
import { createClient } from "../../utils/supabase/client"
import { toast } from "sonner"

// Define dynamic form fields data
const dynamicFormFields = [
  {
    step: 1,
    title: "Personal Information",
    description: "Tell us a bit about yourself.",
    fields: [
      { name: "fullName", label: "Full Name", type: "text", placeholder: "John Doe", required: true },
      { name: "email", label: "Email Address", type: "email", placeholder: "john.doe@example.com", required: true },
      { name: "phone", label: "Phone Number", type: "text", placeholder: "+1 (555) 123-4567", description: "For SMS alerts and customer support" },
    ],
  },
  {
    step: 2,
    title: "Location Details",
    description: "Where are you located?",
    fields: [
      { name: "address", label: "Address", type: "text", placeholder: "123 Main St", required: true, colSpan: "md:col-span-2" },
      { name: "city", label: "City", type: "text", placeholder: "San Francisco", required: true },
      { name: "state", label: "State/Province", type: "text", placeholder: "California" },
      { name: "postalCode", label: "Postal/ZIP Code", type: "text", placeholder: "94103" },
      { name: "country", label: "Country", type: "text", placeholder: "United States", required: true },
    ],
  },
  {
    step: 3,
    title: "Demographics",
    description: "Optional demographic information.",
    fields: [
      { name: "dateOfBirth", label: "Date of Birth", type: "date", required: true },
      {
        name: "gender", label: "Gender", type: "radio", required: true, options: [
          { id: "male", label: "Male" },
          { id: "female", label: "Female" },
          { id: "other", label: "Other" },
          { id: "prefer-not-to-say", label: "Prefer not to say" },
        ]
      },
      { name: "occupation", label: "Occupation", type: "text", placeholder: "Software Engineer" },
      { name: "companyName", label: "Company/Organization", type: "text", placeholder: "Acme Inc." },
      {
        name: "interests", label: "Interests", type: "checkbox", description: "Select all that apply", colSpan: "md:col-span-2", options: [
          { id: "technology", label: "Technology" },
          { id: "business", label: "Business" },
          { id: "design", label: "Design" },
          { id: "marketing", label: "Marketing" },
          { id: "development", label: "Development" },
          { id: "data-science", label: "Data Science" },
          { id: "ai", label: "Artificial Intelligence" },
          { id: "networking", label: "Networking" },
        ]
      },
    ],
  },
  {
    step: 4,
    title: "Special Requirements & Preferences",
    description: "Let us know if you have any special needs.",
    fields: [
      {
        name: "dietaryRestrictions", label: "Dietary Restrictions", type: "checkbox", description: "Select all that apply", options: [
          { id: "vegetarian", label: "Vegetarian" },
          { id: "vegan", label: "Vegan" },
          { id: "gluten-free", label: "Gluten-Free" },
          { id: "dairy-free", label: "Dairy-Free" },
          { id: "nut-allergy", label: "Nut Allergy" },
          { id: "kosher", label: "Kosher" },
          { id: "halal", label: "Halal" },
        ]
      },
      {
        name: "accessibilityNeeds", label: "Accessibility Needs", type: "checkbox", description: "Select all that apply", options: [
          { id: "wheelchair", label: "Wheelchair Access" },
          { id: "hearing-impaired", label: "Hearing Assistance" },
          { id: "vision-impaired", label: "Vision Assistance" },
          { id: "mobility-assistance", label: "Mobility Assistance" },
          { id: "service-animal", label: "Service Animal Accommodation" },
          { id: "interpreter", label: "Sign Language Interpreter" },
        ]
      },
      { name: "specialRequirements", label: "Other Special Requirements or Requests", type: "textarea", placeholder: "Please let us know if you have any other special requirements or requests." },
    ],
  },
  {
    step: 5,
    title: "Final Information",
    description: "Almost done! Just a few more details.",
    fields: [
      {
        name: "hearAbout", label: "How did you hear about this event?", type: "select", required: true, options: [
          { id: "social-media", label: "Social Media" },
          { id: "search-engine", label: "Search Engine" },
          { id: "friend", label: "Friend or Colleague" },
          { id: "email", label: "Email Newsletter" },
          { id: "advertisement", label: "Advertisement" },
          { id: "conference", label: "Another Conference" },
          { id: "blog", label: "Blog or Article" },
          { id: "other", label: "Other" },
        ]
      },
      { name: "marketingConsent", label: "I would like to receive marketing communications", type: "checkbox", description: "We'll send you updates about future events, special offers, and related content." },
      { name: "termsAccepted", label: "I agree to the terms and conditions and privacy policy", type: "checkbox", required: true, description: `By checking this box, you agree to our Terms of Service and Privacy Policy.` },
    ],
  },
];

// Create schemas for each step separately
interface FieldOption {
  id: string;
  label: string;
}

interface StepField {
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  description?: string;
  colSpan?: string;
  options?: FieldOption[];
}

interface StepSchema {
  [key: string]: z.ZodTypeAny;
}

const createStepSchema = (stepFields: StepField[]): z.ZodObject<StepSchema> => {
  const schemaObj: StepSchema = {};
  
  stepFields.forEach(field => {
    let fieldSchema: z.ZodTypeAny = z.string().optional(); // Default to optional string

    if (field.required) {
      if (field.type === 'email') {
        fieldSchema = z.string().email({ message: "Please enter a valid email address." });
      } else if (field.type === 'date') {
        fieldSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Please enter a valid date in YYYY-MM-DD format." });
      } else if (field.type === 'radio') {
        fieldSchema = z.enum((field.options?.map(opt => opt.id) || []) as [string, ...string[]], {
          required_error: `Please select a ${field.label} option.`,
        });
      } else if (field.type === 'select') {
        fieldSchema = z.string().min(1, { message: `Please select an option.` });
      } else if (field.type === 'checkbox' && field.name === 'termsAccepted') {
        fieldSchema = z.boolean().refine((val) => val === true, {
          message: "You must accept the terms and conditions.",
        });
      } else if (field.type === 'checkbox' && field.options) {
        fieldSchema = z.array(z.string()).optional();
      } else {
        fieldSchema = z.string().min(2, { message: `${field.label} must be at least 2 characters.` });
      }
    } else if (field.type === 'checkbox' && field.options) {
      fieldSchema = z.array(z.string()).optional();
    } else if (field.type === 'checkbox' && !field.options) {
      fieldSchema = z.boolean().default(false);
    }

    schemaObj[field.name] = fieldSchema;
  });
  
  return z.object(schemaObj);
};

// Build the complete form schema


export default function RegistrationForm() {
  const router = useRouter();
  const { trackEvent, deviceInfo, locationInfo } = useAnalytics();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [formStartTime, setFormStartTime] = useState(Date.now());
  const [eventId, setEventId] = useState<string | null>(null); // For storing event ID
  
  interface Location {
    city: string;
    country: string;
  }
  
  const [autoDetectedLocation, setAutoDetectedLocation] = useState<Location | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = dynamicFormFields.length;
  const [formData, setFormData] = useState({});
  const [userIP, setUserIP] = useState<string | null>(null);

useEffect(() => {
  // Fetch the user's IP address from the API route
  const fetchIP = async () => {
    try {
      const response = await fetch("/api/get-ip");
      const data = await response.json();
      setUserIP(data.ip);
    } catch (error) {
      console.error("Failed to fetch IP address:", error);
    }
  };

  // Get the event ID from URL or localStorage (assuming event ID is in the URL)
  const params = new URLSearchParams(window.location.search);
  const eventIdFromUrl = params.get('eventId');
  if (eventIdFromUrl) {
    setEventId(eventIdFromUrl);
    localStorage.setItem('currentEventId', eventIdFromUrl);
  } else {
    // Try to get from localStorage if not in URL
    const storedEventId = localStorage.getItem('currentEventId');
    if (storedEventId) {
      setEventId(storedEventId);
    }
  }

  fetchIP();
}, []);

  // Initialize form with default values
  interface FormValues {
    [key: string]: any;
  }

  const form = useForm<FormValues>({
    defaultValues: dynamicFormFields.reduce((defaults, stepConfig) => {
      stepConfig.fields.forEach((field) => {
        if (field.type === "checkbox" && "options" in field) {
          (defaults as Record<string, any>)[field.name] = [];
        } else if (field.type === "radio" && field.name === "gender") {
          (defaults as Record<string, any>)[field.name] = "prefer-not-to-say";
        } else if (field.type === "checkbox" && !("options" in field)) {
          (defaults as Record<string, any>)[field.name] = false;
        } else {
          (defaults as Record<string, any>)[field.name] = "";
        }
      });
      return defaults;
    }, {})
  });

  useEffect(() => {
    const savedProgress = getRegistrationProgress();
    if (savedProgress.registration) {
      form.reset(savedProgress.registration);
    }

    // Track form start - only on initial load
    if (currentStep === 1) {
      trackEvent("form_start", {
        formName: "registration",
        timestamp: new Date().toISOString(),
      });
      setFormStartTime(Date.now());
    }
    // Auto-detect location - only on step 2
    if (currentStep === 2 && isLoadingLocation) {
      getLocationFromIP().then((locationData) => {
        setAutoDetectedLocation({
          city: locationData.city,
          country: locationData.country,
        });

        // Pre-fill location fields if they're empty
        const currentCity = form.getValues("city");
        const currentCountry = form.getValues("country");

        if (!currentCity && locationData.city !== "Unknown") {
          form.setValue("city", locationData.city);
        }

        if (!currentCountry && locationData.country !== "Unknown") {
          form.setValue("country", locationData.country);
        }

        setIsLoadingLocation(false);
      });
    }

    // Track field interactions
    const handleFieldInteraction = (fieldName:any) => {
      trackEvent("form_field_interaction", {
        formName: "registration",
        step: currentStep,
        fieldName,
        timestamp: new Date().toISOString(),
      });
    };

    // Add event listeners to form fields
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
      // Clean up event listeners
      if (formElement) {
        const inputElements = formElement.querySelectorAll("input, select, textarea");
        inputElements.forEach((element) => {
          element.removeEventListener("focus", () => {});
        });
      }
    };
  }, [form, trackEvent, currentStep, isLoadingLocation]);

  // Save progress as user fills out the form
  useEffect(() => {
    const subscription = form.watch((value) => {
      saveRegistrationProgress("registration", value);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const currentStepFields = dynamicFormFields.find(step => step.step === currentStep);
  const currentStepSchema = createStepSchema(currentStepFields?.fields || []);

  // Handle next button click - validate only current step fields
  const handleNext = async () => {
    const currentStepValues: Record<string, any> = {};
    
    // Get only values for current step fields
    currentStepFields?.fields.forEach(field => {
      currentStepValues[field.name] = form.getValues(field.name);
    });

    try {
      // Validate only current step fields
      await currentStepSchema.parseAsync(currentStepValues);
      
      // If validation passes, update formData and move to next step
      setFormData(prevData => ({ ...prevData, ...currentStepValues }));
      
      // Track step submission
      trackEvent("form_step_submit", {
        formName: "registration",
        step: currentStep,
        timestamp: new Date().toISOString(),
      });
      
      setCurrentStep(currentStep + 1);
    } catch (error) {
      // If validation fails, trigger form errors
      const fieldErrors: Record<string, string> = {};
      
      if (error instanceof z.ZodError && error.errors) {
        error.errors.forEach(err => {
          if (err.path && err.path.length > 0) {
            fieldErrors[err.path[0]] = err.message;
          }
        });
        
        // Set errors on form
        Object.keys(fieldErrors).forEach(fieldName => {
          form.setError(fieldName, { 
            type: "manual", 
            message: fieldErrors[fieldName] 
          });
        });
      }
    }
  };

  // Function to save registration data to Supabase
  async function saveRegistrationToDatabase(registrationData: CompleteRegistrationData) {
    try {
      const supabase = createClient();
      
      // First check if user already exists and create if not
      let userId = null;
      
      const { data: existingUser, error: userError } = await supabase
        .from('web_users')
        .select('id')
        .eq('email', registrationData.email)
        .maybeSingle();
      
      if (userError) {
        console.error("Error checking for existing user:", userError);
        throw new Error("Failed to check for existing user");
      }
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // Create new user
        const { data: newUser, error: createUserError } = await supabase
          .from('web_users')
          .insert({
            name: registrationData.fullName,
            email: registrationData.email,
            contact_phone: registrationData.phone,
            discovery: registrationData.hearAbout,
            organizion_name: registrationData.companyName || null
          })
          .select('id')
          .single();
        
        if (createUserError) {
          console.error("Error creating user:", createUserError);
          throw new Error("Failed to create user account");
        }
        
        userId = newUser.id;
        localStorage.setItem("userId", userId);
        console.log("UserId ID saved to localStorage:", userId);


      }
      
      // Now save the registration data
      const { error: registrationError } = await supabase
        .from('registrations')
        .insert({
          event_id: eventId,
          user_id: userId,
          form_data: registrationData,
          registration_date: registrationData.registrationDate,
          time_spent_on_form: registrationData.timeSpentOnForm,
          ip_address: registrationData.ipAddress,
          referrer: registrationData.referrer,
          user_agent: registrationData.userAgent,
          screen_resolution: registrationData.screenResolution,
          window_size: registrationData.windowSize,
          language: registrationData.language,
          timezone: registrationData.timezone,
          device: registrationData.device,
          location: registrationData.location
        });
      
      if (registrationError) {
        console.error("Error saving registration:", registrationError);
        throw new Error("Failed to save registration data");
      }
      
      return { success: true, userId };
    } catch (error) {
      console.error("Registration save error:", error);
      throw error;
    }
  }

  interface CompleteRegistrationData {
    registrationDate: string;
    timeSpentOnForm: number;
    device: Record<string, any>;
    location: {
      country: string;
      city: string;
      region: string;
      timezone: string;
    };
    ipAddress: string;
    referrer: string;
    userAgent: string;
    screenResolution: string;
    windowSize: string;
    language: string;
    timezone: string;
    [key: string]: any;
  }

  interface AnalyticsFormData {
    interests?: string[];
    hearAbout?: string;
    marketingConsent?: boolean;
    hasAccessibilityNeeds?: boolean;
    hasDietaryRestrictions?: boolean;
  }

  async function onSubmit(values: Record<string, any>): Promise<void> {
    // Pre-check for terms and conditions before submission
    if (!values.termsAccepted) {
      form.setError("termsAccepted", { 
        type: "manual", 
        message: "You must accept the terms and conditions." 
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Accumulate form data
    const finalFormData: Record<string, any> = { ...formData, ...values };
    
    // Track step submission
    trackEvent("form_step_complete", {
      formName: "registration",
      step: currentStep,
      timestamp: new Date().toISOString(),
    });
    
    // Calculate time spent on form
    const timeSpent: number = Math.floor((Date.now() - formStartTime) / 1000); // in seconds
    
    // Collect device and browser information
    const deviceData: Record<string, any> = deviceInfo || getUserDeviceInfo();
    
    // Prepare complete registration data
    const completeRegistrationData: CompleteRegistrationData = {
      ...finalFormData,
      registrationDate: new Date().toISOString(),
      timeSpentOnForm: timeSpent,
      device: deviceData,
      location: locationInfo || { country: "Unknown", city: "Unknown", region: "Unknown", timezone: "Unknown" },
      ipAddress: userIP || "Unknown", // Include the IP address
      referrer: document.referrer || "direct",
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      windowSize: `${window.innerWidth}x${window.innerHeight}`,
      language: navigator.language,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
    
    // Track final form submission
    const analyticsFormData: AnalyticsFormData = {
      interests: completeRegistrationData.interests,
      hearAbout: completeRegistrationData.hearAbout,
      marketingConsent: completeRegistrationData.marketingConsent,
      hasAccessibilityNeeds: completeRegistrationData.accessibilityNeeds && completeRegistrationData.accessibilityNeeds.length > 0,
      hasDietaryRestrictions: completeRegistrationData.dietaryRestrictions && completeRegistrationData.dietaryRestrictions.length > 0,
    };
  
    trackEvent("form_submit", {
      formName: "registration",
      timeSpent,
      formData: analyticsFormData,
    });
    
    console.log("Complete Registration Data:", completeRegistrationData);
    
    try {
      await saveRegistrationToDatabase(completeRegistrationData);
      toast.success("Registration saved successfully!");
    } catch (error) {
      toast.error("Failed to save registration. Please try again.");
    }
    
    // Store form data in session storage
    sessionStorage.setItem("registrationData", JSON.stringify(completeRegistrationData));
    
    // Simulate form submission with a delay
    setTimeout((): void => {
      router.push("/ticket-selection");
      setIsSubmitting(false);
    }, 1500);
  }

  interface FieldConfig {
    name: string;
    label: string;
    type: string;
    placeholder?: string;
    required?: boolean;
    description?: string;
    colSpan?: string;
    options?: FieldOption[];
  }

  const renderFormField = (fieldConfig: FieldConfig) => {
    switch (fieldConfig.type) {
      case "text":
      case "email":
      case "date":
        return (
          <FormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field }: { field: any }) => (
              <FormItem className={fieldConfig.colSpan}>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Input placeholder={fieldConfig.placeholder} type={fieldConfig.type} {...field} />
                </FormControl>
                {fieldConfig.description && <FormDescription>{fieldConfig.description}</FormDescription>}
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "textarea":
        return (
          <FormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field }: { field: any }) => (
              <FormItem className={fieldConfig.colSpan}>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <Textarea placeholder={fieldConfig.placeholder} className="resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "select":
        return (
          <FormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field }: { field: any }) => (
              <FormItem className={fieldConfig.colSpan}>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required && <span className="text-red-500">*</span>}
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={`Select an option`} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {fieldConfig.options?.map((option) => (
                      <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "radio":
        return (
          <FormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name}
            render={({ field }: { field: any }) => (
              <FormItem className={fieldConfig.colSpan}>
                <FormLabel>
                  {fieldConfig.label}
                  {fieldConfig.required && <span className="text-red-500">*</span>}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    {fieldConfig.options?.map((option) => (
                      <FormItem key={option.id} className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={option.id} />
                        </FormControl>
                        <FormLabel className="font-normal">{option.label}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );
      case "checkbox":
        if (fieldConfig.options) {
          return (
            <FormField
              key={fieldConfig.name}
              control={form.control}
              name={fieldConfig.name}
              render={({ field }: { field: any }) => (
                <FormItem className={fieldConfig.colSpan}>
                  {fieldConfig.label && (
                    <div className="mb-2">
                      <FormLabel>{fieldConfig.label}</FormLabel>
                      {fieldConfig.description && <FormDescription>{fieldConfig.description}</FormDescription>}
                    </div>
                  )}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {(fieldConfig.options ?? []).map((option) => (
                      <FormItem key={option.id} className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(option.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...(field.value || []), option.id])
                                : field.onChange(field.value?.filter((value: string) => value !== option.id));
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">{option.label}</FormLabel>
                      </FormItem>
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        } else {
          return (
            <FormField
              key={fieldConfig.name}
              control={form.control}
              name={fieldConfig.name}
              render={({ field }: { field: any }) => (
                <FormItem className={`flex flex-row items-start space-x-3 space-y-0 ${fieldConfig.colSpan}`}>
                  <FormControl>
                    <Checkbox 
                      checked={field.value} 
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      {fieldConfig.label}
                      {fieldConfig.required && <span className="text-red-500">*</span>}
                    </FormLabel>
                    {fieldConfig.description && (
                      <FormDescription>
                        {fieldConfig.description}
                      </FormDescription>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          );
        }
      default:
        return null;
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>{currentStepFields?.title}</CardTitle>
            <p>{currentStepFields?.description}</p>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {currentStepFields?.fields.map(renderFormField)}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
              disabled={currentStep === 1 || isSubmitting}
            >
              Previous
            </Button>
            {currentStep < totalSteps ? (
              <Button 
                type="button" 
                onClick={handleNext}
                disabled={isSubmitting}
              >
                Next
              </Button>
            ) : (
              <Button 
                    type="button" 
                    onClick={form.handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      "Submit"
                   )}
                 </Button>
            )}
          </CardFooter>
        </Card>

        {/* Device Information Card (Hidden but collected) */}
        {currentStep === totalSteps && (
          <Card className="bg-muted/40 border-dashed">
            <CardContent className="p-4">
              <h4 className="text-sm font-medium mb-2">Device Information We Collect</h4>
              <p className="text-xs text-muted-foreground mb-2">
                To improve your experience, we automatically collect the following information:
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside space-y-1">
                <li>Browser and device type</li>
                <li>Operating system</li>
                <li>Screen resolution</li>
                <li>Language preferences</li>
                <li>Approximate location (country/city)</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-2">
                This helps us optimize our website and provide better support. See our{" "}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>{" "}
                for details.
              </p>
            </CardContent>
          </Card>
        )}
      </form>
    </Form>
  );
}