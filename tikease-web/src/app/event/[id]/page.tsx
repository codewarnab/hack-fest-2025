import React from "react";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EventBanner from "@/components/event-banner";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Share2, Download, Briefcase, Music, Ticket, Utensils, Users, Code, Palette, Mic, Dumbbell, GraduationCap, Facebook, Instagram, Twitter } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FlashSaleBanner } from "@/components/flash-sale-banner";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import EventStorage from "@/components/event-storage";

// Define categories array similar to event-categories.tsx
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
];

// Define default social links
const defaultSocials = [
  { name: "Facebook", icon: Facebook, url: "https://facebook.com", color: "bg-blue-600 hover:bg-blue-700" },
  { name: "Instagram", icon: Instagram, url: "https://instagram.com", color: "bg-pink-600 hover:bg-pink-700" },
  { name: "Twitter", icon: Twitter, url: "https://twitter.com", color: "bg-blue-400 hover:bg-blue-500" },
];

export const dynamic = "force-dynamic";

async function getEvent(id: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Error fetching event:", error);
    return null;
  }
  console.log("Fetched event data:", data);
  return {
    ...data
  };
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }
  
  // Flash sale data
  const flashSale = {
    title: "Early Bird Flash Sale",
    originalPrice: 399,
    salePrice: 299,
    endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    code: "FLASH25",
    ticketUrl: "/registration" // Use a direct URL instead of a function
  };
  
  // Format the event object to match EventBanner props
  const bannerEvent = {
    id: event.id,
    title: event.title,
    date: new Date(event.start_date).toLocaleDateString(),
    time: `${new Date(event.start_date).toLocaleTimeString()} - ${new Date(event.end_date).toLocaleTimeString()}`,
    location: event.venue,
    description: event.description,
    image: event.image || "/placeholder.svg",
    category: event.context,
    attendees: event.attendees || 0,
    featured: event.featured || false,
  };

  // Get the category icon
  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find(cat => cat.name.toLowerCase() === categoryName?.toLowerCase());
    return category ? category.icon : Ticket; // Default to Ticket if not found
  };

  // Filter categories to only show those that match the event tags
  const eventTags = event.tags || [];
  const filteredCategories = categories.filter(category => 
    category.name === "All Events" || // Always show "All Events"
    eventTags.some((tag: string) => tag.toLowerCase() === category.name.toLowerCase())
  );

  return (
    <>
    <SiteHeader />
    {/* Include the EventStorage component to save event ID to localStorage */}
    <EventStorage eventId={id} />
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Hero Banner - Centered */}
      <div className="w-full flex justify-center">
        <EventBanner event={bannerEvent} />
      </div>

      {/* Categories Section - Centered */}
      <div className="my-8 w-full flex justify-center">
        <ScrollArea className="w-full max-w-4xl whitespace-nowrap">
          <div className="flex w-max space-x-4 p-1 justify-center">
            {filteredCategories.map((category) => {
              const Icon = category.icon;
              const isActive = category.name.toLowerCase() === event.context?.toLowerCase();
              return (
                <Button 
                  key={category.name} 
                  variant={isActive ? "default" : "outline"} 
                  className={`flex items-center gap-2 rounded-full ${isActive ? "bg-primary text-primary-foreground" : ""}`} 
                  size="sm"
                >
                  <Icon className="h-4 w-4" />
                  {category.name}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
   
      <div className="my-8">
            <FlashSaleBanner {...flashSale} />
      </div>
      {/* Content Section - Centered with equal columns */}
      <div className="grid gap-8 mt-10 w-full">
        {/* Main Content - Left Side */}
        <div className="space-y-8 flex flex-col items-center">
          {/* About Section */}
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">About This Event</h2>
            <p className="text-muted-foreground">{event.description}</p>
            <div className="flex justify-center gap-4 pt-2">
              <Link href="/registration">
                <Button size="lg" className="bg-red-900 bg-blend-soft-light shadow-amber-500 text-white hover:bg-red-950" >Book Ticket</Button>
              </Link>
              <Button variant="outline" size="lg">
                Share Event
              </Button>
            </div>
          </div>




          {/* Social Links Section - Already centered by design */}
          <section className="mt-16 rounded-lg p-8 text-center shadow-lg w-full">
            <h2 className="text-3xl font-extrabold mb-6">Stay Connected</h2>
            <p className="mb-8 mx-auto text-base md:text-lg">
              Follow us on social media to stay updated with the latest events, exclusive offers, and more.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {(event.social_links ? [
                event.social_links.facebook && { name: "Facebook", icon: Facebook, url: `https://facebook.com/${event.social_links.facebook}`, color: "bg-blue-600 hover:bg-blue-700" },
                event.social_links.instagram && { name: "Instagram", icon: Instagram, url: `https://instagram.com/${event.social_links.instagram}`, color: "bg-pink-600 hover:bg-pink-700" },
                event.social_links.twitter && { name: "Twitter", icon: Twitter, url: `https://twitter.com/${event.social_links.twitter}`, color: "bg-blue-400 hover:bg-blue-500" },
                event.social_links.linkedin && { name: "LinkedIn", icon: Facebook, url: `https://linkedin.com/in/${event.social_links.linkedin}`, color: "bg-blue-700 hover:bg-blue-800" },
              ].filter(Boolean) : defaultSocials).map((social: any) => {
                const SocialIcon = social.icon;
                return (
                  <Link 
                    key={social.name} 
                    href={social.url} 
                    target="_blank" 
                    className={`flex items-center gap-2 ${social.color} text-white px-4 py-2 md:px-6 md:py-3 rounded-lg shadow-md`}
                  >
                    Follow on <SocialIcon size={20} />
                  </Link>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
    </>
  );
}