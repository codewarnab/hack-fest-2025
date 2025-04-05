import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/utils/supabase';

// Configure how notifications appear when app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

/**
 * Register for push notifications and get Expo push token
 * @returns Promise with the Expo push token
 */
export async function registerForPushNotifications() {
    let token;

    // Check if this is a physical device (push notifications don't work on simulators/emulators)
    if (!Device.isDevice) {
        console.warn('Push notifications require a physical device. They will not work on simulators or emulators.');
        return null;
    }

    // Request notification permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // If we don't have permission yet, ask for it
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    // If permission was denied, return null
    if (finalStatus !== 'granted') {
        console.warn('Failed to get push notification permissions!');
        return null;
    }

    // Get the Expo push token
    try {
        // Make sure to use your project ID from EAS
        const projectId = Constants?.expoConfig?.extra?.eas?.projectId;
        token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
        console.log('Push token:', token);

        // Configure device-specific settings
        if (Platform.OS === 'android') {
            Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        return token;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}

/**
 * Save a user's push token to Supabase
 * @param userId User ID to associate with the push token
 * @param pushToken Expo push token
 * @returns Promise with the result of the operation
 */
export async function savePushToken(userId: string, pushToken: string) {
    try {
        // Check if token already exists for this user
        const { data: existingTokens, error: fetchError } = await supabase
            .from('push_tokens')
            .select('*')
            .eq('user_id', userId)
            .eq('token', pushToken);

        if (fetchError) {
            console.error('Error checking existing push token:', fetchError);
            return null;
        }

        // If token already exists, no need to insert again
        if (existingTokens && existingTokens.length > 0) {
            console.log('Push token already exists for this user');
            return existingTokens[0];
        }

        // Insert the new token
        const { data, error } = await supabase
            .from('push_tokens')
            .insert([
                {
                    user_id: userId,
                    token: pushToken,
                    device_type: Platform.OS,
                }
            ])
            .select();

        if (error) {
            console.error('Error saving push token:', error);
            return null;
        }

        console.log('Push token saved successfully:', data);
        return data;
    } catch (error) {
        console.error('Error in savePushToken:', error);
        return null;
    }
}

/**
 * Add notification event listeners for handling notifications
 * @param onNotification Function to call when a notification is received
 * @param onNotificationResponse Function to call when user taps a notification
 * @returns Object with functions to remove the listeners
 */
export function addNotificationListeners(
    onNotification: (notification: Notifications.Notification) => void,
    onNotificationResponse: (response: Notifications.NotificationResponse) => void
) {
    // When a notification is received while the app is in the foreground
    const notificationListener = Notifications.addNotificationReceivedListener(onNotification);

    // When the user taps on a notification (foreground or background)
    const responseListener = Notifications.addNotificationResponseReceivedListener(onNotificationResponse);

    // Return functions to clean up listeners
    return {
        removeNotificationListener: () => notificationListener.remove(),
        removeResponseListener: () => responseListener.remove(),
    };
}

/**
 * Send a push notification using Expo's push notification service
 * @param token Expo push token to send the notification to
 * @param title Notification title
 * @param body Notification body
 * @param data Any additional data to send with the notification
 * @returns Promise with the result of the operation
 */
export async function sendPushNotification(
    token: string,
    title: string,
    body: string,
    data: Record<string, any> = {}
) {
    const message = {
        to: token,
        sound: 'default',
        title,
        body,
        data,
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Accept-encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const responseData = await response.json();
        console.log('Push notification sent:', responseData);
        return responseData;
    } catch (error) {
        console.error('Error sending push notification:', error);
        return null;
    }
}