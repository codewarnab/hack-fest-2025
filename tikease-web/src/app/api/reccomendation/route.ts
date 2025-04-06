import { NextResponse } from "next/server";
import { createClient } from "../../../../utils/supabase/server";
import { cookies } from "next/headers";


/**
 * This API endpoint processes ticket pricing recommendations for events.
 * 
 * Steps:
 * 1. Connect to Supabase using cookies.
 * 2. Retrieve all events from the "events" table.
 * 3. For each event:
 *    - Parse and validate the event date.
 *    - Retrieve all tickets associated with the event.
 * 4. For each ticket:
 *    - Calculate the sale period from event creation to event date.
 *    - Determine elapsed days since sale start.
 *    - Fetch completed sales transactions.
 *    - Compute the expected vs. actual sales rate to derive a demand factor.
 *    - If the demand factor is too high or too low:
 *       - Compute a price increase or decrease recommendation (up to 50% adjustment).
 *       - Insert an escalation record with the recommendation.
 * 5. Respond with a success message upon completion.
 */

function daysBetween(start: Date, end: Date) {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((end.getTime() - start.getTime()) / msPerDay);
}

function parseDMY(dateStr: string): Date {
    const [dd, mm, yyyy] = dateStr.split('-').map(Number)
    return new Date(yyyy, mm - 1, dd)
}


export async function GET(request: Request) {
    try {
        const cookieStore = cookies();
        const supabase = createClient(cookieStore);

        const { data: events, error: eventsError } = await supabase.from("events").select("*")
        if (eventsError) {
            return NextResponse.json({ error: eventsError.message }, { status: 500 });
        }
        if (!events) {
            return NextResponse.json({ error: "No events found" }, { status: 404 });
        }

        for (const event of events) {
            const eventId = event.id
            const eventDate = parseDMY(event.eventDate);
            if (isNaN(eventDate.getTime())) {
                console.warn(`Invalid eventDate for event ${eventId}`);
                continue;
            }

            const { data: tickets, error: ticketError } = await supabase.from("tickets").select("*").eq("eventId", eventId)
            if (ticketError) {
                console.error(`Error fetching tickets for event ${eventId}`)
                continue;
            }
            if (!tickets || tickets.length == 0) {
                // no tickets found for this event 
                continue
            }

            for (const ticket of tickets) {
                const basePrice = Number(ticket.price)
                const maxQty = Number(ticket.quantity)
                const saleStartDate = new Date(ticket.created_at)
                const currentDate = new Date()

                // calculate sale period and elapsed days 
                const totalSalePeriod = daysBetween(saleStartDate, eventDate)
                const elapsedDays = daysBetween(saleStartDate, currentDate)

                if (totalSalePeriod <= 0 || elapsedDays < 0) {
                    // sale period not started or already ended 
                    continue
                }

                const { data: salesData, error: salesError } = await supabase.from("transactions").select("quantity").eq("event_id", eventId).
                    eq("ticket_id", ticket.id).eq("status", "completed")

                if (salesError) {
                    console.error(`Error fetching sales data for event ${eventId}`)
                    continue;
                }

                const ticketSold = salesData?.reduce((sum, row: any) => sum + Number(row.quantity), 0) || 0

                const exoectedRate = maxQty / totalSalePeriod
                const actualRate = ticketSold / elapsedDays
                const demandFactor = actualRate / exoectedRate

                // defind thershold for demand factor
                const upperThersHold = 1.2 // if demandFactor is above , recommend to increase price
                const lowerThersHold = 0.8 // if demandfactor is below . recommend to decrease price
                const baseIncreaseFactor = 0.10 // 10% increase
                const baseDecreaseFactor = 0.10 // 10% decrease

                let recommendation: string | null = null;
                let reccomandationPrice: number | null = null;

                // compute reccomendation based on demandFactor . 
                if (demandFactor >= upperThersHold) {
                    // Proce increase reccomendatiomn 
                    const increasePercentage = Math.min(baseIncreaseFactor * (demandFactor - 1), 0.5) // max increase of 50%


                    reccomandationPrice = basePrice * (1 + increasePercentage);
                    recommendation = `Increase price by ${(increasePercentage * 100).toFixed(1)}% to ${reccomandationPrice.toFixed(2)} (base was ${basePrice.toFixed(2)}).`
                } else if (demandFactor <= lowerThersHold) {

                    const decreasePercentage = Math.min(baseDecreaseFactor * (1 - demandFactor), 0.5) // max decrease of 50%
                    reccomandationPrice = basePrice * (1 - decreasePercentage);
                    recommendation = `Decrease price by ${(decreasePercentage * 100).toFixed(1)}% to ${reccomandationPrice.toFixed(2)} (base was ${basePrice.toFixed(2)}).`;
                }
                else {
                    // No recommendation needed
                    console.log(`No recommendation needed for event ${eventId}`);
                    continue
                }

                // 
                const summary = `Ticket type '${ticket.ticket_type}' for event '${event.title}' requires a pricing adjustment. ${recommendation}`
                const { error: escalationError } = await supabase.from("escalation").insert([
                    {
                        eventId: eventId,
                        ticketId: ticket.id,
                        issue_summary: recommendation,
                        prioriy: "recommendation",
                        
                    }
                ])
                if (escalationError) {
                    console.error(`Error inserting escalation for event ${eventId}: ${escalationError.message}`);
                    continue;
                }
                console.log(`Escalation inserted for event ${eventId}: ${summary}`);
            }
        }
        return NextResponse.json({ message: "Recommendations processed successfully" }, { status: 200 });
    }
    catch (error) {
        console.error("Error processing recommendations:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
export const dynamic = "force-dynamic"


