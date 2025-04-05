import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import EventBanner from "@/components/event-banner";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Share2, Download } from "lucide-react";
import { Card } from "@/components/ui/card";

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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Banner */}
      <EventBanner event={bannerEvent} />

      {/* Content Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
        {/* Main Content - 2/3 width on desktop */}
        <div className="md:col-span-2 space-y-8">
          {/* About Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4">About This Event</h2>
            <div className="prose max-w-none dark:prose-invert">
              <p>{event.description}</p>
            </div>
          </section>

          {/* Tags Section */}
          {event.tags && event.tags.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-muted rounded-full text-sm hover:bg-muted/80 transition-colors">
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Social Links Section */}
          {event.social_links && (
            <section>
              <h2 className="text-2xl font-bold mb-4">Follow Us</h2>
              <div className="space-y-2">
                {event.social_links.twitter && (
                  <p>Twitter: <a href={`https://twitter.com/${event.social_links.twitter}`} target="_blank" className="text-blue-600 hover:underline">{event.social_links.twitter}</a></p>
                )}
                {event.social_links.linkedin && (
                  <p>LinkedIn: <a href={event.social_links.linkedin} target="_blank" className="text-blue-600 hover:underline">{event.social_links.linkedin}</a></p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar - 1/3 width on desktop */}
        <div className="space-y-6">
          {/* Event Details Card */}
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Event Details</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Date</p>
                  <p className="text-sm">{new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-sm">{event.venue}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}