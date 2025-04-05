import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    ScrollView,
    Alert,
    ActivityIndicator,
    Platform,
    UIManager,
    LayoutAnimation, // Import LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// Assuming getEscalationsForUser returns a specific type, define it or import it
// Example: import { Escalation, getEscalationsForUser } from '@/utils/suamn';
import { supabase } from '@/utils/supabase'; // Ensure this path is correct
import { Session } from '@supabase/supabase-js';

// Define the structure of an escalation record from your DB/util function
interface Escalation {
    id: number; // Assuming ID is a number
    priority: 'High' | 'Medium' | 'Low' | string | null; // Be specific or use string if values vary
    issue_summary: string | null;
    Created_at: string | null; // ISO date string
    // Add other relevant fields from your 'escalations' table
}

// Define the structure for notifications displayed in the component
type NotificationType = 'alert' | 'opportunity' | 'suggestion' | 'info';

interface NotificationItem {
    id: number; // Use the escalation ID directly
    title: string;
    message: string;
    time: string;
    type: NotificationType;
    read: boolean;
    originalData: Escalation; // Keep the original data
}

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// --- Helper Functions (Moved outside component for clarity) ---

const mapPriorityToType = (priority: string | null | undefined): NotificationType => {
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

const getIconName = (type: NotificationType): keyof typeof Ionicons.glyphMap => {
    switch(type) {
        case 'suggestion': return 'bulb';
        case 'info': return 'information-circle';
        case 'opportunity': return 'star';
        case 'alert': return 'warning';
        default: return 'notifications';
    }
};

const getIconColor = (type: NotificationType): string => {
    switch(type) {
        case 'suggestion': return '#6366F1'; // Indigo-500
        case 'info': return '#3B82F6';       // Blue-500
        case 'opportunity': return '#F59E0B'; // Amber-500
        case 'alert': return '#EF4444';       // Red-500
        default: return '#6366F1';          // Default to Indigo
    }
};

// --- Component ---

export default function NotificationComponent() {
    const [showNotifications, setShowNotifications] = useState<boolean>(false);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [session, setSession] = useState<Session | null>(null);

    // Fetch session on mount
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
        });

        const { data: authListener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setSession(session);
            }
        );

        return () => {
            authListener?.subscription.unsubscribe();
        };
    }, []);

    // Fetch escalations function using useCallback
    const fetchEscalations = useCallback(async () => {
        if (!session?.user?.id) {
            setError('User not authenticated');
            setNotifications([]); // Clear notifications if user logs out
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Assuming getEscalationsForUser is typed correctly or returns 'any'/'unknown'
            // You might need to explicitly type the result if the util isn't typed
            // const escalationsData: Escalation[] | null = await getEscalationsForUser(session.user.id);

            // --- Or fetch directly if getEscalationsForUser isn't defined ---
             const { data: escalationsData, error: fetchError } = await supabase
                 .from('escalations') // Replace with your actual table name
                 .select('*')
                 // .eq('assigned_user_id', session.user.id) // Add filter if escalations are assigned
                 .order('Created_at', { ascending: false }); // Example order

             if (fetchError) {
                 throw fetchError;
             }
            // --- End direct fetch ---


            if (escalationsData && Array.isArray(escalationsData)) {
                const notificationsData: NotificationItem[] = escalationsData
                    // Ensure items have an ID before mapping
                    .filter((esc): esc is Escalation => esc != null && typeof esc.id === 'number')
                    .map((escalation) => ({
                        id: escalation.id, // Use the database ID
                        title: `Escalation: ${escalation.priority || 'Info'} Priority`,
                        message: escalation.issue_summary || 'No summary provided.',
                        time: escalation.Created_at ? new Date(escalation.Created_at).toLocaleString() : 'Recently',
                        type: mapPriorityToType(escalation.priority),
                        read: false, // Initialize as unread (you might want to fetch read status too)
                        originalData: escalation
                    }));

                // Animate layout changes when notifications are set
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setNotifications(notificationsData);
            } else {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setNotifications([]);
            }
        } catch (err: any) { // Catch specific Supabase errors if possible
            console.error('Error fetching escalations:', err);
            setError(err.message || 'Failed to load notifications');
             LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setNotifications([]); // Clear on error
        } finally {
            setIsLoading(false);
        }
    }, [session]); // Depend on session

    // Fetch escalations when the component mounts (if user is logged in) and when notifications are opened
    useEffect(() => {
        if (showNotifications && session) {
            fetchEscalations();
        }
        // Optionally clear notifications when modal closes and user logs out
        if (!showNotifications || !session) {
             LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
             setNotifications([]);
             setError(null); // Clear error when closing
        }
    }, [showNotifications, session, fetchEscalations]);


    // Memoize unread count calculation
    const unreadCount = useMemo(() => {
        return notifications.filter(notification => !notification.read).length;
    }, [notifications]);

    const markAsRead = useCallback((id: number) => {
         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate the read state change (subtle)
        setNotifications(prevNotifications =>
            prevNotifications.map(notification =>
                notification.id === id ? { ...notification, read: true } : notification
            )
        );
        // TODO: Persist read status to backend if needed
    }, []);

    const markAllAsRead = useCallback(() => {
         LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setNotifications(prevNotifications =>
            prevNotifications.map(notification => ({ ...notification, read: true }))
        );
        // TODO: Persist read status to backend if needed
    }, []);

    // Combined delete function
    const confirmAndDeleteEscalation = useCallback((notification: NotificationItem) => {
        Alert.alert(
            'Delete Escalation',
            `Are you sure you want to delete the escalation: "${notification.title}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        if (!session?.user?.id) {
                            Alert.alert('Error', 'You must be logged in to delete.');
                            return;
                        }
                        if (typeof notification.originalData?.id !== 'number') {
                             console.warn("Attempting to delete notification without a valid originalData.id", notification);
                             // Just remove locally if no DB id
                             LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                             setNotifications(prev => prev.filter(n => n.id !== notification.id));
                             return;
                        }

                        setIsLoading(true); // Show loading indicator during delete
                        try {
                            const { error: deleteError } = await supabase
                                .from('escalations')
                                .delete()
                                .eq('id', notification.originalData.id); // Use the actual escalation ID

                            if (deleteError) {
                                throw deleteError;
                            }

                            // Remove from local state *after* successful DB delete
                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); // Animate removal
                            setNotifications(prev => prev.filter(n => n.id !== notification.id));
                            // Alert.alert('Success', 'Escalation deleted.'); // Optional success message

                        } catch (err: any) {
                            console.error('Error deleting escalation:', err);
                            Alert.alert('Error', err.message || 'Failed to delete the escalation.');
                        } finally {
                             setIsLoading(false);
                        }
                    }
                }
            ]
        );
    }, [session]); // Depend on session

    // Handle tapping on a notification
    const handleNotificationAction = useCallback((notification: NotificationItem) => {
        if (!notification.read) {
            markAsRead(notification.id);
        }

        // Example actions - customize as needed
        let alertTitle = '';
        let alertMessage = `Details: ${notification.message}`;
        let actions: Array<{text: string, style?: 'cancel' | 'default' | 'destructive', onPress?: () => void}> = [
             { text: 'Dismiss', style: 'cancel' },
        ];

        switch(notification.type) {
            case 'suggestion':
                 alertTitle = 'Review Low Priority Issue?';
                 actions.push({ text: 'Review Later', onPress: () => console.log('Marked for review:', notification.id) });
                 break;
            case 'opportunity':
                 alertTitle = 'Handle Medium Priority Issue';
                 actions.push({ text: 'Handle Now', onPress: () => console.log('Handling issue:', notification.id) });
                 break;
            case 'alert':
                 alertTitle = 'Urgent: High Priority Issue';
                 alertMessage = `Immediate action recommended for: ${notification.message}`;
                 actions.push({ text: 'Address Immediately', style: 'destructive', onPress: () => console.log('Addressing urgent issue:', notification.id) });
                 break;
            default: // 'info'
                 alertTitle = 'Information';
                 // No specific action needed other than marking as read
                 return; // Exit early if no alert needed for 'info' type
        }

        Alert.alert(alertTitle, alertMessage, actions);
    }, [markAsRead]);


    // --- Render Logic ---

    const renderContent = () => {
        if (isLoading && notifications.length === 0) { // Show loader only if list is empty initially
            return (
                <View style={styles.centeredMessageContainer}>
                    <ActivityIndicator size="large" color="#6366F1" />
                    <Text style={styles.messageText}>Loading escalations...</Text>
                </View>
            );
        }

        if (error) {
            return (
                <View style={styles.centeredMessageContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
                    <Text style={[styles.messageText, styles.errorText]}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchEscalations}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        if (notifications.length === 0) {
            return (
                <View style={styles.centeredMessageContainer}>
                    <Ionicons name="notifications-off-outline" size={48} color="#A0AEC0" />
                    <Text style={styles.messageText}>No escalation notifications</Text>
                </View>
            );
        }

        return notifications.map(notification => (
            <TouchableOpacity
                key={notification.id}
                style={[
                    styles.notificationItem,
                    !notification.read && styles.unreadNotification
                ]}
                onPress={() => handleNotificationAction(notification)}
                activeOpacity={0.7} // Add feedback on press
            >
                <View style={[styles.notificationIconContainer, { backgroundColor: `${getIconColor(notification.type)}20` }]}>
                    <Ionicons
                        name={getIconName(notification.type)}
                        size={22} // Slightly smaller icon
                        color={getIconColor(notification.type)}
                    />
                </View>
                <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                        <Text style={styles.notificationTitle} numberOfLines={1}>{notification.title}</Text>
                         {/* Make delete button less prominent or move to swipe action */}
                         <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation(); // Prevent triggering handleNotificationAction
                                confirmAndDeleteEscalation(notification);
                            }}
                            style={styles.deleteButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} // Easier to tap
                        >
                            <Ionicons name="close-circle" size={18} color="#A0AEC0" />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.notificationMessage} numberOfLines={2}>{notification.message}</Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
            </TouchableOpacity>
        ));
    };


    return (
        <View style={styles.container}>
            {/* Notification Bell Icon */}
            <TouchableOpacity
                style={styles.notificationIcon}
                onPress={() => setShowNotifications(true)}
                activeOpacity={0.8}
            >
                <Ionicons name="notifications-outline" size={24} color="#6366F1" />
                {unreadCount > 0 && (
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                )}
            </TouchableOpacity>

            {/* Notifications Modal */}
            <Modal
                visible={showNotifications}
                transparent={true}
                animationType="slide" // "slide" or "fade"
                onRequestClose={() => setShowNotifications(false)}
            >
                {/* Use TouchableOpacity for dismissable overlay */}
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setShowNotifications(false)} // Dismiss when tapping outside modal content
                >
                    {/* Prevent touches inside the modal content from closing it */}
                    <TouchableOpacity style={styles.modalContent} activeOpacity={1} onPress={() => {}}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Escalation Notifications</Text>
                            <View style={styles.modalActions}>
                                {unreadCount > 0 && (
                                    <TouchableOpacity
                                        style={styles.markAllReadButton}
                                        onPress={markAllAsRead}
                                        disabled={isLoading} // Disable while loading/deleting
                                    >
                                        <Text style={styles.markAllReadText}>Mark all read</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity
                                    onPress={() => setShowNotifications(false)}
                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                >
                                    <Ionicons name="close" size={26} color="#4A5568" />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Show activity indicator overlay during delete */}
                         {isLoading && notifications.length > 0 && (
                            <View style={styles.activityOverlay}>
                                <ActivityIndicator size="small" color="#FFFFFF"/>
                            </View>
                         )}

                        <ScrollView
                            style={styles.notificationsList}
                            contentContainerStyle={styles.scrollContentContainer} // Needed for empty/error states
                            showsVerticalScrollIndicator={false} // Hide scrollbar if desired
                        >
                            {renderContent()}
                        </ScrollView>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// --- Styles (Adjusted slightly for better visuals) ---

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 30, // Adjust for status bar
        right: 15,
        zIndex: 1000,
    },
    notificationIcon: {
        width: 44, // Slightly larger touch area
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        // Softer shadow
        shadowColor: '#4A5568',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 4,
    },
    badge: {
        position: 'absolute',
        top: 2,
        right: 2,
        minWidth: 18, // Make slightly wider for 9+
        height: 18,
        borderRadius: 9,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4, // Add padding for numbers
    },
    badgeText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontWeight: 'bold',
        lineHeight: 14, // Adjust line height
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Darker overlay
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#F7FAFC', // Off-white background
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        height: '75%', // Adjust height as needed
        maxHeight: 650,
        overflow: 'hidden', // Clip content within rounded corners
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E2E8F0', // Lighter border
        backgroundColor: '#FFFFFF', // White header
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '600', // Semibold
        color: '#2D3748', // Darker gray
    },
    modalActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    markAllReadButton: {
        marginRight: 12,
        paddingVertical: 4, // Add padding
    },
    markAllReadText: {
        color: '#6366F1',
        fontWeight: '500',
        fontSize: 14,
    },
    activityOverlay: { // Style for loading indicator during delete
        position: 'absolute',
        top: 50, // Below header
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, // Ensure it's above the list
    },
    notificationsList: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 20, // Add padding at the bottom
        flexGrow: 1, // Ensure container grows to allow centering empty state
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 12, // Adjust padding
        borderBottomWidth: 1,
        borderBottomColor: '#EDF2F7', // Lighter border
        backgroundColor: '#FFFFFF', // White item background
        alignItems: 'center', // Align items vertically
    },
    unreadNotification: {
        backgroundColor: '#EBF4FF', // Lighter blue for unread
    },
    notificationIconContainer: {
        width: 36, // Adjust size
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        // Removed fixed background color, handled dynamically
    },
    notificationContent: {
        flex: 1,
    },
    notificationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start', // Align title and close button top
        marginBottom: 2,
    },
    notificationTitle: {
        fontSize: 15, // Adjust size
        fontWeight: '600',
        color: '#2D3748',
        flex: 1, // Allow title to take space
        marginRight: 8, // Space before close button
    },
    deleteButton: {
       // Using close-circle now, padding might not be needed
       // padding: 4,
    },
    notificationMessage: {
        fontSize: 13, // Adjust size
        color: '#4A5568', // Medium gray
        marginBottom: 6,
        lineHeight: 18, // Improve readability
    },
    notificationTime: {
        fontSize: 11, // Adjust size
        color: '#A0AEC0', // Lighter gray
    },
    // Centered container for Loading, Error, Empty states
    centeredMessageContainer: {
        flex: 1, // Take up available space in ScrollView
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        minHeight: 300, // Ensure it has some height
    },
    messageText: {
        marginTop: 16,
        fontSize: 16,
        color: '#718096', // Medium gray
        textAlign: 'center',
    },
    errorText: {
        color: '#C53030', // Darker red for error
    },
    retryButton: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: '#6366F1',
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '500',
    },
});