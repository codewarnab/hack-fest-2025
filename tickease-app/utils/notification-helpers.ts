import { supabase } from '@/utils/supabase';
import { sendPushNotification } from '@/components/notifications/NotificationManager';

/**
 * Send a push notification to a specific user
 * @param userId User ID to send the notification to
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data to include with the notification
 * @returns Promise that resolves when the notification is sent
 */
export async function sendNotificationToUser(
    userId: string,
    title: string,
    body: string,
    data: Record<string, any> = {}
) {
    try {
        // Fetch the user's push tokens from Supabase
        const { data: tokens, error } = await supabase
            .from('push_tokens')
            .select('token')
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user push tokens:', error);
            return null;
        }

        if (!tokens || tokens.length === 0) {
            console.warn(`No push tokens found for user ${userId}`);
            return null;
        }

        // Send notifications to all of the user's devices
        const promises = tokens.map(tokenRecord =>
            sendPushNotification(tokenRecord.token, title, body, data)
        );

        const results = await Promise.all(promises);
        console.log(`Sent ${results.length} push notifications to user ${userId}`);
        return results;
    } catch (error) {
        console.error('Error sending notification to user:', error);
        return null;
    }
}

/**
 * Send a push notification to all users related to an event
 * @param eventId Event ID
 * @param title Notification title
 * @param body Notification body
 * @param data Additional data to include with the notification
 * @returns Promise that resolves when all notifications are sent
 */
export async function sendNotificationForEvent(
    eventId: string,
    title: string,
    body: string,
    data: Record<string, any> = {}
) {
    try {
        // First, get all users associated with this event
        // This assumes you have a table that links users to events
        // Adjust the query based on your database schema
        const { data: eventUsers, error } = await supabase
            .from('event_users') // Replace with your actual table name
            .select('user_id')
            .eq('event_id', eventId);

        if (error) {
            console.error('Error fetching users for event:', error);
            return null;
        }

        if (!eventUsers || eventUsers.length === 0) {
            console.warn(`No users found for event ${eventId}`);
            return null;
        }

        // Send notifications to each user
        const promises = eventUsers.map(user =>
            sendNotificationToUser(user.user_id, title, body, {
                ...data,
                eventId // Include the event ID in the notification data
            })
        );

        const results = await Promise.all(promises);
        console.log(`Sent notifications for event ${eventId} to ${eventUsers.length} users`);
        return results;
    } catch (error) {
        console.error('Error sending notifications for event:', error);
        return null;
    }
}

/**
 * Set up a Supabase listener for events that should trigger push notifications
 * @param eventId Event ID to listen for changes on
 * @param onNotification Callback when a notification is triggered
 * @returns Supabase subscription that can be used to unsubscribe
 */
export function setupNotificationListeners(
    eventId: string,
    onNotification: (payload: any) => void
) {
    // This is an example of how you could listen for changes to an event
    // and trigger push notifications automatically when something changes
    const subscription = supabase
        .channel(`event-${eventId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'events', // Replace with your actual table name
            filter: `id=eq.${eventId}`
        }, (payload) => {
            console.log('Event updated:', payload);
            onNotification(payload);

            // You could automatically send notifications here based on certain conditions
            // For example, if the event status changes to "started"
            if (payload.new.status === 'started' && payload.old.status !== 'started') {
                sendNotificationForEvent(
                    eventId,
                    'Event Started',
                    'Your event has just started!',
                    { type: 'event_started', eventId }
                );
            }
        })
        .subscribe();

    return subscription;
}