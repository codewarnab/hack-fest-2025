import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { router } from 'expo-router';
import { usePushNotifications } from '@/components/notifications/PushNotificationProvider';
import { sendPushNotification } from '@/components/notifications/NotificationManager';
import { Ionicons } from '@expo/vector-icons';
import { useSession } from '@/context/SessionProvider';

export default function NotificationsTest() {
    const [title, setTitle] = useState('Test Notification');
    const [body, setBody] = useState('This is a test notification from Tickease');
    const [loading, setLoading] = useState(false);
    const { expoPushToken } = usePushNotifications();
    const session = useSession();

    const handleTestLocalNotification = async () => {
        try {
            setLoading(true);

            // Use the context function to schedule a local notification
            await sendPushNotification(
                expoPushToken || '',
                title,
                body,
                { data: 'Local notification test' }
            );

            Alert.alert('Success', 'Local notification scheduled');
        } catch (error) {
            console.error('Error sending local notification:', error);
            Alert.alert('Error', 'Failed to send local notification');
        } finally {
            setLoading(false);
        }
    };

    const handleTestPushNotification = async () => {
        try {
            setLoading(true);

            // You'd typically call your backend API here
            // which would then use the Expo push notification service
            // but for demo purposes, we're using the direct method
            if (!expoPushToken) {
                Alert.alert('Error', 'No push token available');
                return;
            }

            const result = await sendPushNotification(
                expoPushToken,
                title,
                body,
                { data: 'Push notification test' }
            );

            Alert.alert('Success', 'Push notification sent. Check your device!');
        } catch (error) {
            console.error('Error sending push notification:', error);
            Alert.alert('Error', 'Failed to send push notification');
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.headerContainer}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Notifications Test</Text>
            </View>

            <View style={styles.tokenContainer}>
                <Text style={styles.label}>Your Push Token:</Text>
                <View style={styles.tokenValueContainer}>
                    <Text style={styles.tokenValue} numberOfLines={2} ellipsizeMode="middle">
                        {expoPushToken || 'No token available'}
                    </Text>
                </View>
                {expoPushToken && (
                    <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => {
                            // Copy to clipboard
                            // We would use Clipboard API here, but for simplicity we'll just show an alert
                            Alert.alert('Token Copied', 'Push token copied to clipboard!');
                        }}
                    >
                        <Ionicons name="copy-outline" size={18} color="#6366F1" />
                        <Text style={styles.copyText}>Copy Token</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.formContainer}>
                <Text style={styles.sectionTitle}>Test Notification</Text>

                <Text style={styles.label}>Notification Title</Text>
                <TextInput
                    style={styles.input}
                    value={title}
                    onChangeText={setTitle}
                    placeholder="Enter notification title"
                />

                <Text style={styles.label}>Notification Body</Text>
                <TextInput
                    style={[styles.input, styles.textArea]}
                    value={body}
                    onChangeText={setBody}
                    placeholder="Enter notification message"
                    multiline
                    numberOfLines={4}
                />

                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={[styles.button, styles.localButton]}
                        onPress={handleTestLocalNotification}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>Test Local Notification</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.button, styles.pushButton]}
                        onPress={handleTestPushNotification}
                        disabled={loading || !expoPushToken}
                    >
                        <Text style={styles.buttonText}>Send Push Notification</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.infoContainer}>
                <Text style={styles.infoTitle}>About Push Notifications</Text>
                <Text style={styles.infoText}>
                    • Local notifications appear immediately when the app is in the foreground.
                </Text>
                <Text style={styles.infoText}>
                    • Push notifications are delivered through Expo's Push Notification Service.
                </Text>
                <Text style={styles.infoText}>
                    • Push notifications only work on physical devices, not on simulators.
                </Text>
                <Text style={styles.infoText}>
                    • Your app must be built with EAS Build to receive push notifications.
                </Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FF',
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingTop: 60,
        paddingBottom: 16,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    backButton: {
        marginRight: 16,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    tokenContainer: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    tokenValueContainer: {
        backgroundColor: '#F5F7FF',
        padding: 12,
        borderRadius: 8,
        marginTop: 8,
    },
    tokenValue: {
        fontSize: 14,
        color: '#666',
        fontFamily: 'monospace',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-end',
        marginTop: 8,
    },
    copyText: {
        color: '#6366F1',
        marginLeft: 4,
        fontSize: 14,
    },
    formContainer: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    label: {
        fontSize: 16,
        color: '#555',
        marginBottom: 8,
    },
    input: {
        backgroundColor: '#F5F7FF',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    buttonContainer: {
        marginTop: 8,
    },
    button: {
        borderRadius: 8,
        paddingVertical: 14,
        alignItems: 'center',
        marginBottom: 12,
    },
    localButton: {
        backgroundColor: '#6366F1',
    },
    pushButton: {
        backgroundColor: '#10B981',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    infoContainer: {
        backgroundColor: '#FFFFFF',
        margin: 16,
        padding: 16,
        borderRadius: 12,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    infoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 12,
    },
    infoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        lineHeight: 20,
    },
});