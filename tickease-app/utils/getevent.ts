import { supabase } from "@/utils/supabase";

// Define a type for the event structure


export const getEventById = async (eventId: string): Promise<Event | null> => {
  try {
    // Fetch the event by its ID
    const { data: event, error } = await supabase
      .from("events")
      .select("*")
      .eq("id", eventId)
      .single();

    if (error) {
      console.error("Error fetching event:", error);
      return null;
    }

    if (!event) {
      console.log("No event found with the provided ID");
      return null;
    }

    return event as Event;
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
};