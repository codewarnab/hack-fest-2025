import { NextRequest, NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { createClient } from "../../../../../utils/supabase/server";
export const maxDuration = 30;
import { cookies } from "next/headers";

// Create a simple in-memory cache to store event data
// In a production app, you might want to use a more robust caching solution
type EventCache = {
  [eventId: string]: {
    data: any;
    timestamp: number;
  }
};

// Cache will expire after 10 minutes (600000 ms)
const CACHE_EXPIRY = 600000;
const eventCache: EventCache = {};

// Function to get event data with caching
async function getEventData(supabase: any, eventId: string) {
  // Check if we have a valid cached version
  const cachedEvent = eventCache[eventId];
  const now = Date.now();
  
  if (cachedEvent && (now - cachedEvent.timestamp < CACHE_EXPIRY)) {
    console.log("Using cached event data for:", eventId);
    return { data: cachedEvent.data, error: null, cached: true };
  }
  
  // No valid cache found, fetch from database
  console.log("Fetching fresh event data for:", eventId);
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();
    
  // Cache the result if successful
  if (!error && data) {
    eventCache[eventId] = {
      data,
      timestamp: now
    };
  }
  
  return { data, error, cached: false };
}

export async function POST(
  req: NextRequest,
  { params }: { params: { event_id: string } }
) {
  try {
    // Get the dynamic event_id from route parameters
    const { event_id: currentEventId } = await params;
    console.log("Event ID:", currentEventId);

    // Parse the JSON body to get messages
    const { messages } = await req.json();
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);

    // Use the cached version of event data if available
    const { data: eventData, error, cached } = await getEventData(supabase, currentEventId);
    
    // Log the data source and content
    console.log(`Event Data (${cached ? 'cached' : 'fresh'}):`);
    console.log("Event Data 111:", eventData);
    
    if (error) {
      console.error("Error fetching event data:", error);
    }

    // 1. Escalate Issue Tool (Enhanced)
    const escalateToManager = tool({
      description: `Use this tool ONLY to escalate a user's significant issue, complaint, or complex request that cannot be resolved with provided info. 
                  Requires user's name, contact (email/phone), a summary of the issue, and an assessed priority level. 
                  If name/contact are missing, you MUST ask the user for them BEFORE calling this tool.`,
      parameters: z.object({
        userName: z
          .string()
          .describe("The full name of the user experiencing the issue."),
        userContact: z
          .string()
          .describe("The user's email address or phone number for follow-up."),
        issueSummary: z
          .string()
          .describe(
            "A concise summary of the user's complaint, issue, or request needing escalation. Minimum 30 characters."
          ),
        priority: z
          .enum(["Low", "Medium", "Severe"])
          .describe(
            "The assessed priority level based on urgency and severity (Low, Medium, Severe)."
          ),
      }),
      execute: async ({ userName, userContact, issueSummary, priority }) => {
        console.log("--- TOOL CALL: escalateToManager ---");
        console.log(`Priority: ${priority}`);
        console.log(`User Name: ${userName}`);
        console.log(`User Contact: ${userContact}`);
        console.log(`Issue Summary: ${issueSummary}`);

        // Ensure event_id is available
        if (!currentEventId) {
          console.error("Error: event_id is missing.");
          return {
            status: "failed",
            message: `Failed to escalate issue for **${userName}**. Event ID is missing.`,
          };
        }

        // Insert escalation into the database
        const { data, error } = await supabase.from("escalations").insert([
          {
            user_name: userName,
            user_contact: userContact,
            issue_summary: issueSummary,
            priority: priority,
            event_id: currentEventId, // Use dynamic event_id
            created_at: new Date().toISOString(),
          },
        ]);

        if (error) {
          console.error("Error storing escalation in database:", error);
          return {
            status: "failed",
            message: `Failed to escalate issue for **${userName}**. Please try again later.`,
          };
        }

        console.log("Escalation stored in database:", currentEventId);
        console.log("------------------------------------");
        return {
          status: "success",
          confirmationMessage: `Escalated issue for **${userName}** with **${priority}** priority. Summary: *${issueSummary}*`,
        };
      },
    });

    // 2. Check Ticket Availability Tool
    const checkTicketAvailability = tool({
      description:
        "Check the current availability status of a specific ticket type (Early Bird, Regular, VIP). Use this when a user asks if a ticket is still available or in stock.",
      parameters: z.object({
        ticketType: z
          .enum(["Early Bird", "Regular", "VIP"])
          .describe("The type of ticket to check availability for."),
      }),
      execute: async ({ ticketType }) => {
        console.log("--- TOOL CALL: checkTicketAvailability ---");
        let status = "Available";
        if (ticketType === "Early Bird") {
          status = Math.random() > 0.3 ? "Sold Out" : "Limited Availability";
        } else if (ticketType === "VIP") {
          status = Math.random() > 0.8 ? "Limited Availability" : "Available";
        }
        console.log("Simulated Status:", status);
        console.log("------------------------------------");
        return { ticketType: ticketType, availabilityStatus: `**${status}**` };
      },
    });

    // 3. Get Session Details Tool
    const getSessionDetails = tool({
      description:
        "Retrieve specific details for a conference session (speaker, time, room) when the user asks for details about a particular talk or topic by title or speaker.",
      parameters: z.object({
        sessionQuery: z
          .string()
          .describe(
            "The title, speaker name, or main topic of the session the user wants details about."
          ),
      }),
      execute: async ({ sessionQuery }) => {
        console.log("--- TOOL CALL: getSessionDetails ---");
        const queryLower = sessionQuery.toLowerCase();
        let details = null;
        if (
          queryLower.includes("jane smith") ||
          queryLower.includes("keynote")
        ) {
          details = {
            title: "Opening Keynote: The Future of Tech",
            speaker: "Jane Smith",
            time: "May 15, 9:00 AM",
            room: "Main Hall A",
          };
        } else if (
          queryLower.includes("john doe") ||
          queryLower.includes("ai")
        ) {
          details = {
            title: "Deep Dive into AI Ethics",
            speaker: "John Doe",
            time: "May 16, 2:00 PM",
            room: "Room 101",
          };
        } else if (
          queryLower.includes("sarah johnson") ||
          queryLower.includes("blockchain")
        ) {
          details = {
            title: "Blockchain Beyond Crypto",
            speaker: "Sarah Johnson",
            time: "May 17, 11:00 AM",
            room: "Room 205",
          };
        } else if (
          queryLower.includes("michael chen") ||
          queryLower.includes("ux")
        ) {
          details = {
            title: "Designing for Delight: Modern UX",
            speaker: "Michael Chen",
            time: "May 15, 1:30 PM",
            room: "Workshop B",
          };
        }
        console.log("Simulated Details:", details);
        console.log("------------------------------------");
        return details
          ? { status: "found", ...details }
          : {
              status: "not_found",
              message: `Sorry, I couldn't find specific details for '${sessionQuery}'. Please check the full schedule on the website.`,
            };
      },
    });

    // 4. Register for Add-on Tool
    const registerForAddon = tool({
      description:
        "Register the user for a specific event add-on (e.g., 'Workshop Access'). Assume the user is identified and wants to proceed.",
      parameters: z.object({
        addonName: z
          .string()
          .describe("The exact name of the add-on to register for."),
      }),
      execute: async ({ addonName }) => {
        console.log("--- TOOL CALL: registerForAddon ---");
        const validAddons = [
          "Workshop Access",
          "Networking Event",
          "Event Merchandise",
          "VIP Lounge Access",
          "Session Recordings",
          "Private Session",
        ];
        let result;
        if (validAddons.includes(addonName)) {
          console.log(`Simulating successful registration for ${addonName}`);
          result = {
            status: "success",
            message: `Successfully registered for: **${addonName}**. Confirmation email sent.`,
          };
        } else {
          console.log(`Add-on '${addonName}' not found.`);
          result = {
            status: "failed",
            message: `Sorry, **'${addonName}'** is not a valid add-on.`,
          };
        }
        console.log("------------------------------------");
        return result;
      },
    });

    const result = streamText({
      model: google("gemini-1.5-pro-latest"),
      tools: {
        escalateToManager,
        checkTicketAvailability,
        getSessionDetails,
        registerForAddon,
      },
      maxSteps: 5,
      system: `
YOU ARE A PROFESSIONAL, EMPATHETIC, AND EFFICIENT AI EVENT ASSISTANT . YOUR PRIMARY ROLE IS TO PROVIDE ACCURATE INFORMATION AND ASSISTANCE BASED *SOLELY* ON THE PROVIDED EVENT DETAILS AND YOUR AVAILABLE TOOLS. MAINTAIN A FRIENDLY AND HELPFUL TONE IN SHORT CONCISE AND TO THE POINT MANNER .

**MARKDOWN FORMATTING FOR HIGHLIGHTING:**
*   Use **bold markdown (\`**text**\`)** to highlight key details such as:
    *   Prices (e.g., **$399**)
    *   Dates (e.g., **May 15-17, 2025**)
    *   Ticket Types (e.g., **VIP Ticket**)
    *   Speaker Names (e.g., **Jane Smith**)
    *   Add-on Names (e.g., **Workshop Access**)
    *   Availability Status (e.g., **Available**, **Sold Out**, **Limited Availability**)
    *   Locations (e.g., **Main Hall A**)
*   Do NOT overuse bolding.

**EVENT DETAILS:**
${JSON.stringify(eventData || {})}
** USE THIS eventData for every primary query of the user  **
**YOUR AVAILABLE TOOLS:**
*   **checkTicketAvailability(ticketType)**: Checks current stock for 'Early Bird', 'Regular', or 'VIP' tickets.
*   **getSessionDetails(sessionQuery)**: Retrieves speaker, time, and room details for a specific session.
*   **registerForAddon(addonName)**: Registers the user for a specified event add-on.
*   **escalateToManager(userName, userContact, issueSummary, priority)**: Logs a significant user issue or complaint for manager review.

**GENERAL INTERACTION FLOW:**
1.  Understand the user's request.
2.  Provide information based solely on the EVENT DETAILS.
3.  Use the available tools when appropriate.
4.  If an issue cannot be resolved, escalate using **escalateToManager**.

Please provide your request below.
      `,
      messages,
    });

    const response = await result.toDataStreamResponse();
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );
    console.log("Response type:", response.type);
    return response;
  } catch (error) {
    console.error("Error handling POST request:", error);
    return NextResponse.json(
      { error: "Failed to process the request" },
      { status: 500 }
    );
  }
}
