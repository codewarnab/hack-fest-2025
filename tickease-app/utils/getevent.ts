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

// Existing getTotalTicketBought function (assuming it exists)
export const getTotalTicketBought = async (eventId: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("quantity")
      .eq("event_id", eventId);

    if (error) {
      console.error("Error fetching transactions:", error);
      return null;
    }

    // Sum up all quantity values
    const count = data ? data.reduce((sum, transaction) => sum + (transaction.quantity || 0), 0) : 0;

    if (error) {
      console.error("Error fetching tickets count:", error);
      return null;
    }

    return count;
  } catch (error) {
    console.error("Unexpected error fetching tickets:", error);
    return null;
  }
};

// Updated function to correctly calculate the total revenue
export const getTotalRevenue = async (eventId: string): Promise<number | null> => {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("total_amount")
      .eq("event_id", eventId);
      // Calculate the sum of total_amount from all transactions
      if (data && data.length > 0) {
        const totalAmount = data.reduce((sum, transaction) => sum + (transaction.total_amount || 0), 0);
        return totalAmount;
      }
    if (error) {
      console.error("Error fetching revenue data:", error);
      return null;
    }

    // Calculate the sum of amounts from all tickets
    if (data && data.length > 0) {
      const totalAmount = data.reduce((sum, ticket) => sum + (ticket.total_amount || 0), 0);
      return totalAmount;
    }
    
    return 0;
  } catch (error) {
    console.error("Unexpected error fetching revenue:", error);
    return null;
  }
};

