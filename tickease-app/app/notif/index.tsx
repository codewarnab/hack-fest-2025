import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getEscalationsForUser } from '@/utils/suamn';
import { supabase } from '@/utils/supabase';


export default function NotificationComponent() {
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Reference to store the subscription
    const subscriptionRef = useRef(null);

    const fetchEscalations = async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Get user ID from the session
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.session?.user?.id;

            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Fetch escalations
            const escalationsData = await getEscalationsForUser();
            console.log('Fetched escalations:', escalationsData);

            if (escalationsData) {
                // Transform escalations into notification format
                const notificationsData = escalationsData.map((escalation, index) => ({
                    id: escalation.id || index + 1,
                    title: `Escalation: ${escalation.priority || 'New'} Priority`,
                    message: escalation.issue_summary || 'A new issue has been escalated.',
                    time: escalation.Created_at ? new Date(escalation.Created_at).toLocaleString() : 'Recently',
                    type: mapPriorityToType(escalation.priority),
                    read: escalation.read || false, // Use read status from database, default to false if not present
                    originalData: escalation
                })).reverse();

                setNotifications(notificationsData);
            } else {
                setNotifications([]);
            }
        } catch (err) {
            console.error('Error fetching escalations:', err);
            setError('Failed to load notifications');
        } finally {
            setIsLoading(false);
        }
    };

    // Subscribe to realtime updates
    const subscribeToEscalations = async () => {
        try {
            // Get user ID from the session
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.session?.user?.id;

            if (!userId) {
                console.error('Cannot subscribe: User not authenticated');
                return;
            }

            // Clean up any existing subscription
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }

            // Create a new subscription for the escalations table
            // Filter for records that match the current user
            const channel = supabase
                .channel('escalations-channel')
                .on('postgres_changes', {
                    event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
                    schema: 'public',
                    table: 'escalations',
                    filter: `event_id.user_id=eq.${userId}` // Filter for the current user's escalations
                }, handleRealtimeEvent)
                .subscribe((status) => {
                    console.log('Realtime subscription status:', status);
                });

            subscriptionRef.current = channel;

        } catch (err) {
            console.error('Error setting up realtime subscription:', err);
        }
    };

    // Handle realtime events
    const handleRealtimeEvent = (payload) => {
        console.log('Realtime event received:', payload);

        const { eventType, new: newRecord, old: oldRecord } = payload;

        // Handle different event types
        switch (eventType) {
            case 'INSERT':
                // Add new notification
                if (newRecord) {
                    const newNotification = {
                        id: newRecord.id,
                        title: `Escalation: ${newRecord.priority || 'New'} Priority`,
                        message: newRecord.issue_summary || 'A new issue has been escalated.',
                        time: newRecord.Created_at ? new Date(newRecord.Created_at).toLocaleString() : 'Recently',
                        type: mapPriorityToType(newRecord.priority),
                        read: false,
                        originalData: newRecord,
                        isNew: true // Mark as new to potentially highlight it
                    };

                    setNotifications(current => [newNotification, ...current]);

                    // Show a toast or other notification if the modal is not open
                    if (!showNotifications) {
                        // You could add a toast notification library here
                        console.log('New escalation received while notifications are closed');
                    }
                }
                break;

            case 'UPDATE':
                // Update existing notification
                if (newRecord) {
                    setNotifications(current =>
                        current.map(notification =>
                            notification.originalData?.id === newRecord.id
                                ? {
                                    ...notification,
                                    title: `Escalation: ${newRecord.priority || 'New'} Priority`,
                                    message: newRecord.issue_summary || 'An issue has been escalated.',
                                    type: mapPriorityToType(newRecord.priority),
                                    originalData: newRecord,
                                    updated: true // Mark as updated to potentially highlight it
                                }
                                : notification
                        )
                    );
                }
                break;

            case 'DELETE':
                // Remove deleted notification
                if (oldRecord) {
                    setNotifications(current =>
                        current.filter(notification => notification.originalData?.id !== oldRecord.id)
                    );
                }
                break;

            default:
                console.log('Unhandled event type:', eventType);
        }
    };

    // Map priority levels to notification types
    const mapPriorityToType = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high':
                return 'alert';
            case 'medium':
                return 'opportunity';
            case 'low':
                return 'suggestion';
            default:
                return 'info';
        }
    };

    // Set up realtime subscription when component mounts
    useEffect(() => {
        fetchEscalations();
        subscribeToEscalations();

        // Cleanup subscription when component unmounts
        return () => {
            if (subscriptionRef.current) {
                supabase.removeChannel(subscriptionRef.current);
            }
        };
    }, []);

    // Refresh data when notifications modal is opened
    useEffect(() => {
        if (showNotifications) {
            fetchEscalations();
        }
    }, [showNotifications]);

    const unreadCount = notifications.filter(notification => !notification.read).length;

    const markAsRead = async (id) => {
        try {
            // Find the notification to get the original escalation ID
            const notification = notifications.find(n => n.id === id);
            if (!notification || !notification.originalData?.id) {
                // If no original data, just update UI state
                setNotifications(notifications.map(n =>
                    n.id === id ? { ...n, read: true } : n
                ));
                return;
            }

            // Get the escalation ID from the notification's original data
            const escalationId = notification.originalData.id;

            // Update the read status in the database
            const { error } = await supabase
                .from('escalations')
                .update({ read: true })
                .eq('id', escalationId);

            if (error) {
                console.error('Error updating read status:', error);
                // Continue with UI update even if database update fails
            }

            // Update the local state
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        } catch (err) {
            console.error('Error in markAsRead:', err);
            // Update local state regardless of error
            setNotifications(notifications.map(n =>
                n.id === id ? { ...n, read: true } : n
            ));
        }
    };

    const markAllAsRead = async () => {
        try {
            // Get all unread notification IDs that have database records
            const unreadEscalationIds = notifications
                .filter(n => !n.read && n.originalData?.id)
                .map(n => n.originalData.id);

            if (unreadEscalationIds.length > 0) {
                // Update all unread escalations to read=true in the database
                const { error } = await supabase
                    .from('escalations')
                    .update({ read: true })
                    .in('id', unreadEscalationIds);

                if (error) {
                    console.error('Error updating all read statuses:', error);
                    // Continue with UI update even if database update fails
                }
            }

            // Update all in the local state
            setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        } catch (err) {
            console.error('Error in markAllAsRead:', err);
            // Update local state regardless of error
            setNotifications(notifications.map(notification => ({ ...notification, read: true })));
        }
    };

    const deleteEscalation = async (notificationId, escalationId) => {
        if (!escalationId) {
            // Just remove from local state if no database ID
            deleteNotification(notificationId);
            return;
        }

        setIsLoading(true);
        try {
            // Get user ID from the session
            const { data: sessionData } = await supabase.auth.getSession();
            const userId = sessionData?.session?.user?.id;

            if (!userId) {
                throw new Error('User not authenticated');
            }

            // Delete from the database
            const { error } = await supabase
                .from('escalations')
                .delete()
                .eq('id', escalationId);

            if (error) {
                console.error('Error deleting escalation:', error);
                Alert.alert('Error', 'Failed to delete the escalation. Please try again.');
            } else {
                // Remove from local state if successful
                deleteNotification(notificationId);
                Alert.alert('Success', 'Escalation deleted successfully.');

                // Note: We don't need to manually update the UI here anymore
                // because the realtime subscription will handle it
            }
        } catch (err) {
            console.error('Error in deleteEscalation:', err);
            Alert.alert('Error', 'An unexpected error occurred while deleting the escalation.');
        } finally {
            setIsLoading(false);
        }
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
                    'Review Low Priority Issue?',
                    `Would you like to review this issue: ${notification.message}`,
                    [
                        { text: 'Not Now', style: 'cancel' },
                        { text: 'Review', onPress: () => Alert.alert('Success', 'Issue marked for review!') }
                    ]
                );
                break;
            case 'opportunity':
                Alert.alert(
                    'Handle Medium Priority Issue',
                    `Would you like to address this issue: ${notification.message}`,
                    [
                        { text: 'Dismiss', style: 'cancel' },
                        { text: 'Handle Now', onPress: () => Alert.alert('Success', 'You are now handling this issue!') }
                    ]
                );
                break;
            case 'alert':
                Alert.alert(
                    'Urgent: High Priority Issue',
                    `Immediate action recommended: ${notification.message}`,
                    [
                        { text: 'Dismiss', style: 'cancel' },
                        { text: 'Address Immediately', onPress: () => Alert.alert('Success', 'Urgent issue is being addressed!') }
                    ]
                );
                break;
            default:
                // Just mark as read for info
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
                            <Text style={styles.modalTitle}>Escalation Notifications</Text>
                            <View style={styles.modalActions}>
                                {notifications.length > 0 && (
                                    <TouchableOpacity
                                        style={styles.refreshButton}
                                        onPress={fetchEscalations}
                                    >
                                        <Ionicons name="refresh" size={20} color="#6366F1" />
                                    </TouchableOpacity>
                                )}
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
                            {isLoading ? (
                                <View style={styles.loadingContainer}>
                                    <ActivityIndicator size="large" color="#6366F1" />
                                    <Text style={styles.loadingText}>Loading escalations...</Text>
                                </View>
                            ) : error ? (
                                <View style={styles.errorContainer}>
                                    <Ionicons name="alert-circle" size={48} color="#EF4444" />
                                    <Text style={styles.errorText}>{error}</Text>
                                    <TouchableOpacity
                                        style={styles.retryButton}
                                        onPress={fetchEscalations}
                                    >
                                        <Text style={styles.retryButtonText}>Retry</Text>
                                    </TouchableOpacity>
                                </View>
                            ) : notifications.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Ionicons name="notifications-off" size={48} color="#DFE3FF" />
                                    <Text style={styles.emptyStateText}>No escalation notifications</Text>
                                </View>
                            ) : (
                                notifications.map(notification => (
                                    <TouchableOpacity
                                        key={notification.id}
                                        style={[
                                            styles.notificationItem,
                                            !notification.read && styles.unreadNotification,
                                            notification.isNew && styles.newNotification // Highlight new notifications
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
                                                <Text style={styles.notificationTitle}>
                                                    {notification.title}
                                                    {notification.isNew && (
                                                        <Text style={styles.newBadge}> New</Text>
                                                    )}
                                                </Text>
                                                <TouchableOpacity
                                                    onPress={() => {
                                                        Alert.alert(
                                                            'Delete Escalation',
                                                            'Are you sure you want to delete this escalation?',
                                                            [
                                                                { text: 'Cancel', style: 'cancel' },
                                                                {
                                                                    text: 'Delete',
                                                                    style: 'destructive',
                                                                    onPress: () => deleteEscalation(
                                                                        notification.id,
                                                                        notification.originalData?.id
                                                                    )
                                                                }
                                                            ]
                                                        );
                                                    }}
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
    refreshButton: {
        marginRight: 10,
        padding: 4,
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
    newNotification: {
        backgroundColor: '#EFF6FF', // Light blue background for new notifications
        borderLeftWidth: 3,
        borderLeftColor: '#3B82F6',
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
    newBadge: {
        color: '#3B82F6',
        fontWeight: 'bold',
        fontSize: 12,
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
    loadingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#888',
    },
    errorContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#EF4444',
    },
    retryButton: {
        marginTop: 16,
        padding: 10,
        backgroundColor: '#6366F1',
        borderRadius: 5,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
    },
});