import { supabase } from "@/utils/supabase";

// Define a more specific type based on your table structure
export interface Escalation {
  user_name?: string;
  user_contact?: string;
  issue_summary?: string;
  priority?: string;
  Created_at?: string;
}

export const getEscalationsForUser = async (): Promise<Escalation[] | null> => {
  try {
    // Step 1: Get the session and validate the user ID
    const { data: sessionData, error: sessionError } =
      await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error getting session:", sessionError);
      return null;
    }

    const sessionUserId = sessionData?.session?.user?.id;

    // Step 2: Fetch all event IDs associated with the user
    const { data: eventIds, error: eventError } = await supabase
      .from("events")
      .select("id")
      .eq("user_id", sessionUserId);

    if (eventError) {
      console.error("Error fetching event IDs:", eventError);
      return null;
    }

    if (!eventIds || eventIds.length === 0) {
      console.log("No events found for the user");
      return [];
    }

    // Step 3: Fetch all escalations for the retrieved event IDs
    const eventIdsArray = eventIds.map((event) => event.id);

    const { data: escalations, error: escalationError } = await supabase
      .from("escalations")
      .select("*")
      .in("event_id", eventIdsArray);

    if (escalationError) {
      console.error("Error fetching escalations:", escalationError);
      return null;
    }

    return escalations as Escalation[];
  } catch (error) {
    console.error("Unexpected error:", error);
    return null;
  }
};
