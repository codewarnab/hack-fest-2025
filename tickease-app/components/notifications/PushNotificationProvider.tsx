import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import {
    registerForPushNotifications,
    savePushToken,
    addNotificationListeners
} from './NotificationManager';
import { useSession } from '@/context/SessionProvider';

// Create a context for push notifications
interface PushNotificationContextType {
    expoPushToken: string | null;
    notification: Notifications.Notification | null;
    sendNotification: (
        title: string,
        body: string,
        data?: Record<string, any>
    ) => Promise<void>;
}

const PushNotificationContext = createContext<PushNotificationContextType>({
    expoPushToken: null,
    notification: null,
    sendNotification: async () => { },
});

// Hook to access notification context
export const usePushNotifications = () => useContext(PushNotificationContext);

// Provider component for push notifications
export const PushNotificationProvider: React.FC<{ children: React.ReactNode }> = ({
    children
}) => {
    const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
    const [notification, setNotification] = useState<Notifications.Notification | null>(null);
    const notificationListener = useRef<() => void>();
    const responseListener = useRef<() => void>();
    const session = useSession();

    useEffect(() => {
        // Register for push notifications and get token
        const setupPushNotifications = async () => {
            try {
                const token = await registerForPushNotifications();
                if (token) {
                    setExpoPushToken(token);

                    // If user is logged in, save the token to Supabase
                    if (session?.user?.id) {
                        await savePushToken(session.user.id, token);
                    }
                }
            } catch (error) {
                console.error('Error setting up push notifications:', error);
            }
        };

        if (Platform.OS !== 'web') {
            setupPushNotifications();
        }

        // Add notification listeners
        const listeners = addNotificationListeners(
            // Handler for notifications received while app is in foreground
            (notification) => {
                setNotification(notification);
            },
            // Handler for when user taps on a notification
            (response) => {
                console.log('Notification tapped:', response);
                // You can add custom logic here to navigate to specific screens
                // based on the notification data
            }
        );

        notificationListener.current = listeners.removeNotificationListener;
        responseListener.current = listeners.removeResponseListener;

        // Clean up listeners on unmount
        return () => {
            if (notificationListener.current) {
                notificationListener.current();
            }
            if (responseListener.current) {
                responseListener.current();
            }
        };
    }, [session?.user?.id]);

    // Function to send a notification (for testing purposes)
    const sendNotification = async (
        title: string,
        body: string,
        data: Record<string, any> = {}
    ) => {
        if (!expoPushToken) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                data,
            },
            trigger: null, // Immediate notification
        });
    };

    return (
        <PushNotificationContext.Provider
            value={{
                expoPushToken,
                notification,
                sendNotification,
            }}
        >
            {children}
        </PushNotificationContext.Provider>
    );
};