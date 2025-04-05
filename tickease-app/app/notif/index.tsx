import { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Example notification data
const SAMPLE_NOTIFICATIONS = [
    {
        id: 1,
        title: 'Ticket Price Suggestion',
        message: 'Consider decreasing ticket prices by 15% to boost attendance for your upcoming event.',
        time: '2 hours ago',
        type: 'suggestion',
        read: false
    },
    {
        id: 2,
        title: 'New Registration',
        message: 'You have 5 new registrations for "Tech Conference 2025".',
        time: '6 hours ago',
        type: 'info',
        read: false
    },
    {
        id: 3,
        title: 'Venue Availability',
        message: 'Your preferred venue has a cancellation on June 15th. Would you like to book it now?',
        time: '1 day ago',
        type: 'opportunity',
        read: true
    },
    {
        id: 4,
        title: 'Marketing Suggestion',
        message: 'Based on engagement data, sending reminder emails now could increase attendance by 25%.',
        time: '2 days ago',
        type: 'suggestion',
        read: true
    },
    {
        id: 5,
        title: 'Weather Alert',
        message: 'There\'s a 70% chance of rain on your outdoor event day. Consider preparing contingency plans.',
        time: '3 days ago',
        type: 'alert',
        read: true
    }
];

export default function NotificationComponent() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);

    const unreadCount = notifications.filter(notification => !notification.read).length;

    const markAsRead = (id) => {
        setNotifications(notifications.map(notification =>
            notification.id === id ? { ...notification, read: true } : notification
        ));
    };

    const markAllAsRead = () => {
        setNotifications(notifications.map(notification => ({ ...notification, read: true })));
    };

    const deleteNotification = (id) => {
        setNotifications(notifications.filter(notification => notification.id !== id));
    };

    const handleNotificationAction = (notification) => {
        markAsRead(notification.id);

        // Different actions based on notification type
        switch (notification.type) {
            case 'suggestion':
                Alert.alert(
                    'Apply Suggestion?',
                    `Would you like to implement this suggestion: ${notification.message}`,
                    [
                        { text: 'Not Now', style: 'cancel' },
                        { text: 'Apply', onPress: () => Alert.alert('Success', 'Suggestion applied successfully!') }
                    ]
                );
                break;
            case 'opportunity':
                Alert.alert(
                    'Take Action',
                    `Would you like to act on this opportunity: ${notification.message}`,
                    [
                        { text: 'Dismiss', style: 'cancel' },
                        { text: 'Take Action', onPress: () => Alert.alert('Success', 'Action initiated!') }
                    ]
                );
                break;
            default:
                // Just mark as read for info and alerts
                break;
        }
    };

    const getIconName = (type) => {
        switch (type) {
            case 'suggestion': return 'bulb';
            case 'info': return 'information-circle';
            case 'opportunity': return 'star';
            case 'alert': return 'warning';
            default: return 'notifications';
        }
    };

    const getIconColor = (type) => {
        switch (type) {
            case 'suggestion': return '#6366F1';
            case 'info': return '#3B82F6';
            case 'opportunity': return '#F59E0B';
            case 'alert': return '#EF4444';
            default: return '#6366F1';
        }
    };

    return (
        <View style={styles.container}>
            {/* Notification Bell Icon */}
            <TouchableOpacity
                style={styles.notificationIcon}
                onPress={() => setShowNotifications(true)}
            >
                <Ionicons name="notifications" size={24} color="#6366F1" />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Notifications Modal */}
            <Modal
                visible={showNotifications}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowNotifications(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Notifications</Text>
                            <View style={styles.modalActions}>
                                {unreadCount > 0 && (
                                    <TouchableOpacity
                                        style={styles.markAllReadButton}
                                        onPress={markAllAsRead}
                                    >
                                        <Text style={styles.markAllReadText}>Mark all as read</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => setShowNotifications(false)}
                                >
                                    <Ionicons name="close" size={24} color="#333" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        <ScrollView style={styles.notificationsList}>
                            {notifications.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="notifications-off" size={48} color="#DFE3FF" />
                                    <Text style={styles.emptyStateText}>No notifications</Text>
                                </View>
                            ) : (
                                notifications.map(notification => (
                                    <TouchableOpacity
                                        key={notification.id}
                                        style={[
                                            styles.notificationItem,
                                            !notification.read && styles.unreadNotification
                                        ]}
                                        onPress={() => handleNotificationAction(notification)}
                                    >
                                        <View style={styles.notificationIconContainer}>
                                            <Ionicons
                                                name={getIconName(notification.type)}
                                                size={24}
                                                color={getIconColor(notification.type)}
                                            />
                                        </View>
                                        <View style={styles.notificationContent}>
                                            <View style={styles.notificationHeader}>
                                                <Text style={styles.notificationTitle}>{notification.title}</Text>
                                                <TouchableOpacity
                                                    onPress={() => deleteNotification(notification.id)}
                                                    style={styles.deleteButton}
                                                >
                                                    <Ionicons name="trash-outline" size={16} color="#888" />
                                                </TouchableOpacity>
                                            </View>
                                            <Text style={styles.notificationMessage}>{notification.message}</Text>
                                            <Text style={styles.notificationTime}>{notification.time}</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: "80%",
        right: "10%",
        zIndex: 1000,
        marginTop: 20,
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    badge: {
        position: 'absolute',
        top: -5,
        right: -5,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFFFFF',
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        height: '80%',
        maxHeight: 600,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#DFE3FF',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    modalActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    markAllReadButton: {
        marginRight: 16,
    },
    markAllReadText: {
        color: '#6366F1',
        fontWeight: '500',
    },
    notificationsList: {
        flex: 1,
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F7FF',
    },
    unreadNotification: {
        backgroundColor: '#F5F7FF',
    },
    notificationIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#DFE3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    notificationTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    deleteButton: {
        padding: 4,
    },
    notificationMessage: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
    },
    notificationTime: {
        fontSize: 12,
        color: '#888',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    emptyStateText: {
        marginTop: 16,
        fontSize: 16,
        color: '#888',
    },
});