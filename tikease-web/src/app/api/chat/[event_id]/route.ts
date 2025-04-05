import { google } from "@ai-sdk/google";
import { streamText, tool } from "ai";
import { z } from "zod";
import { createClient } from "../../../../../utils/supabase/server";
export const maxDuration = 30;
import { cookies } from "next/headers";

// --- Tool Definitions (Keep them as they were) ---
// Removed global cookieStore and supabase initialization
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
      .describe(
        "The user's email address or phone number for follow-up.",
      ),
    issueSummary: z
      .string()
      .describe(
        "A concise summary of the user's complaint, issue, or request needing escalation. minimum 30 string",
      ),
    priority: z
      .enum(["Low", "Medium", "Severe"])
      .describe(
        "The assessed priority level based on urgency and severity (Low, Medium, Severe).",
      ),
  }),
  execute: async ({ userName, userContact, issueSummary, priority }) => {
    console.log("--- TOOL CALL: escalateToManager ---");
    console.log(`Priority: ${priority}`);
    console.log(`User Name: ${userName}`);
    console.log(`User Contact: ${userContact}`);
    console.log(`Issue Summary: ${issueSummary}`);


    const supabase = createClient(cookies()); // Pass the cookieStore as an argument
    const { data, error } = await supabase
      .from("escalations")
      .insert([
        {
          user_name: userName,
          user_contact: userContact,
          issue_summary: issueSummary,
          priority: priority,
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

    console.log("Escalation stored in database:", data);
    console.log("------------------------------------");
    return {
      status: "success",
      confirmationMessage: `Escalated issue for **${userName}** with **${priority}** priority. Summary: *${issueSummary}*`, // Added slight markdown here too
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
    // ... (execution logic remains the same) ...
    let status = "Available";
    if (ticketType === "Early Bird") {
      status = Math.random() > 0.3 ? "Sold Out" : "Limited Availability";
    } else if (ticketType === "VIP") {
      status = Math.random() > 0.8 ? "Limited Availability" : "Available";
    }
    console.log("Simulated Status:", status);
    console.log("------------------------------------");
    // Return markdown in the status
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
        "The title, speaker name, or main topic of the session the user wants details about.",
      ),
  }),
  execute: async ({ sessionQuery }) => {
    console.log("--- TOOL CALL: getSessionDetails ---");
     // ... (lookup logic remains the same) ...
    const queryLower = sessionQuery.toLowerCase();
    let details = null;
    if (queryLower.includes("jane smith") || queryLower.includes("keynote")) {
      details = { title: "Opening Keynote: The Future of Tech", speaker: "Jane Smith", time: "May 15, 9:00 AM", room: "Main Hall A" };
    } else if (queryLower.includes("john doe") || queryLower.includes("ai")) {
      details = { title: "Deep Dive into AI Ethics", speaker: "John Doe", time: "May 16, 2:00 PM", room: "Room 101" };
    } else if (queryLower.includes("sarah johnson") || queryLower.includes("blockchain")) {
      details = { title: "Blockchain Beyond Crypto", speaker: "Sarah Johnson", time: "May 17, 11:00 AM", room: "Room 205" };
    } else if (queryLower.includes("michael chen") || queryLower.includes("ux")) {
      details = { title: "Designing for Delight: Modern UX", speaker: "Michael Chen", time: "May 15, 1:30 PM", room: "Workshop B" };
    }
    console.log("Simulated Details:", details);
    console.log("------------------------------------");
    // Return details - the LLM will format the final response using markdown based on prompt
    return details ? { status: "found", ...details } : { status: "not_found", message: `Sorry, I couldn't find specific details for '${sessionQuery}'. Please check the full schedule on the website.` };
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
    // ... (execution logic remains the same) ...
    const validAddons = ["Workshop Access", "Networking Event", "Event Merchandise", "VIP Lounge Access", "Session Recordings", "Private Session"];
    let result;
    if (validAddons.includes(addonName)) {
      console.log(`Simulating successful registration for ${addonName}`);
      // Return markdown in the message
      result = { status: "success", message: `Successfully registered for: **${addonName}**. Confirmation email sent.` };
    } else {
      console.log(`Add-on '${addonName}' not found.`);
      result = { status: "failed", message: `Sorry, **'${addonName}'** is not a valid add-on.` };
    }
    console.log("------------------------------------");
    return result;
  },
});


// --- Event Details (Used in System Prompt) ---
const event_details = `
EVENT DETAILS:
- Name: Tech Conference 2025
- Dates: May 15-17, 2025
- Location: San Francisco Convention Center, 123 Tech Blvd, San Francisco, CA 94103
- Website: techconference2025.com

TICKET TYPES & PRICES:
- Early Bird: $299 (Limited availability)
- Regular: $399 (Standard admission)
- VIP: $699 (Premium experience with priority seating and exclusive events)

ADD-ONS & PRICES:
- Workshop Access: $99
- Networking Event: $49
- Event Merchandise: $39
- VIP Lounge Access: $149 (Requires VIP Ticket)
- Session Recordings: $29
- Private Session: $199

SPEAKERS (Partial List):
- Jane Smith - CEO of TechGiant (Keynote)
- John Doe - AI Researcher (Talk: Deep Dive into AI Ethics)
- Sarah Johnson - Blockchain Expert (Talk: Blockchain Beyond Crypto)
- Michael Chen - UX Design Lead (Talk: Designing for Delight: Modern UX)

FREQUENTLY ASKED QUESTIONS:
- Refund Policy: Full refunds available up to 30 days before the event, 50% refund up to 14 days before.
- Dress Code: Business casual
- Wi-Fi: Complimentary high-speed Wi-Fi available throughout the venue
- Parking: Available at the convention center for $25/day
- Accessibility: The venue is fully accessible with ramps, elevators, and accessible restrooms
`;

// --- API Route Handler ---
export async function POST(req: Request) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { messages } = await req.json();
  const result = streamText({
    model: google("gemini-1.5-pro-latest"),
    tools: {
      escalateToManager,
      checkTicketAvailability,
      getSessionDetails,
      registerForAddon,
    },
    maxSteps: 5,
    // System Prompt Updated for Markdown Highlighting
    system: `
YOU ARE A PROFESSIONAL, EMPATHETIC, AND EFFICIENT AI EVENT ASSISTANT FOR TECH CONFERENCE 2025. YOUR PRIMARY ROLE IS TO PROVIDE ACCURATE INFORMATION AND ASSISTANCE BASED *SOLELY* ON THE PROVIDED EVENT DETAILS AND YOUR AVAILABLE TOOLS. MAINTAIN A FRIENDLY AND HELPFUL TONE.

**MARKDOWN FORMATTING FOR HIGHLIGHTING:**
*   Use **bold markdown (\`**text**\`)** to highlight key pieces of information like:
    *   Prices (e.g., **$399**)
    *   Dates (e.g., **May 15-17, 2025**)
    *   Ticket Types (e.g., **VIP Ticket**)
    *   Speaker Names (e.g., **Jane Smith**)
    *   Add-on Names (e.g., **Workshop Access**)
    *   Availability Status (e.g., **Available**, **Sold Out**, **Limited Availability**)
    *   Room Numbers / Locations (e.g., **Main Hall A**)
*   Do NOT overuse bolding. Only use it for specific, important details the user asked for or needs to know.

**EVENT DETAILS:**
${event_details}

**YOUR AVAILABLE TOOLS:**
*   **checkTicketAvailability(ticketType)**: Checks current stock for 'Early Bird', 'Regular', or 'VIP' tickets. Returns availability status.
*   **getSessionDetails(sessionQuery)**: Retrieves speaker, time, room for a *specific* session identified by title, speaker, or topic.
*   **registerForAddon(addonName)**: Registers the user for a specified add-on from the list.
*   **escalateToManager(userName, userContact, issueSummary, priority)**: Logs a significant user issue/complaint for manager review. Requires name, contact, summary, and priority (Low, Medium, Severe).

**CRITICAL ESCALATION PROTOCOL (Using escalateToManager):**
1.  IDENTIFY complaint, frustration, manager request, or unsolvable issue.
2.  ACKNOWLEDGE with empathy.
3.  GATHER INFO (IF NEEDED): Politely ask for name & contact (email/phone) **before** calling tool if missing.
4.  ASSESS PRIORITY: (Severe, Medium, Low) based on urgency/impact.
5.  SUMMARIZE the issue concisely.
6.  EXECUTE TOOL: Call \`escalateToManager\` with ALL parameters.
7.  INFORM USER: "Thank you, **[Name]**. I have escalated your issue with **[Priority]** priority. Summary: '[Issue Summary]'. Our team will contact you at **[User Contact]**."

**GENERAL INTERACTION FLOW:**
1.  Understand user request.
2.  Consult EVENT DETAILS. Answer directly if possible, using **bold markdown** for key details.
3.  Consider Tools: If applicable and prerequisites met (like contact info for escalation), use the appropriate tool.
4.  Formulate Response: Use event details OR tool results. Incorporate markdown highlighting. Inform user of tool actions.
5.  Redirect: If info unavailable/no tool applies, redirect to support@techconference2025.com or +1-800-TECH-CONF.

**RULES & CONSTRAINTS:**
*   **BASE RESPONSES ON PROVIDED INFO ONLY.**
*   **USE TOOLS PRECISELY.**
*   **USE MARKDOWN HIGHLIGHTING** as specified.
*   **GATHER CONTACT INFO ONLY WHEN ESCALATING** and only if missing.
*   **BE CONCISE AND FRIENDLY.**

**FEW-SHOT EXAMPLES (With Markdown Highlighting):**

*User*: How much are regular tickets?
*Assistant*: The **Regular** tickets cost **$399** for standard admission.

*User*: Are early bird tickets still for sale?
*Assistant*: Let me check the current availability for **Early Bird** tickets.
➡️ checkTicketAvailability(ticketType: "Early Bird")
*(Assistant Response after tool)*: **Early Bird** tickets currently have **Limited Availability**. You might want to purchase soon! *(Assuming tool returned 'Limited Availability')*

*User*: Tell me about Jane Smith's talk.
*Assistant*: Certainly, let me get the details for **Jane Smith**'s session.
➡️ getSessionDetails(sessionQuery: "Jane Smith's talk")
*(Assistant Response after tool)*: The 'Opening Keynote: The Future of Tech' by **Jane Smith** is on **May 15, 9:00 AM** in **Main Hall A**.

*User*: Add the workshop access please.
*Assistant*: Okay, I can register you for the **Workshop Access**.
➡️ registerForAddon(addonName: "Workshop Access")
*(Assistant Response after tool)*: You've been successfully registered for: **Workshop Access**! You'll get a confirmation email.

*User*: This is awful! My VIP pass isn't working! I need help NOW!
*Assistant*: I'm really sorry to hear your **VIP** pass isn't working, that sounds very frustrating. To escalate this immediately, could I please get your name and contact information (email or phone)?
*(User provides Name & Contact)*
*Assistant*: Thank you, **[User Name]**. I'm escalating this right now.
➡️ escalateToManager(userName: "[User Name]", userContact: "[User Contact]", issueSummary: "User reports VIP pass not working for lounge access.", priority: "Severe")
*(Assistant Response after tool)*: Thank you, **[User Name]**. I have escalated your issue regarding **VIP** lounge access with **Severe** priority. The summary logged is: 'User reports VIP pass not working for lounge access.'. Our team will contact you at **[User Contact]** urgently.
`,
    messages,
  });

  return result.toDataStreamResponse();
}

