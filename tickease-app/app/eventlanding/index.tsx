import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    RefreshControl, // Import RefreshControl
    Platform,
} from 'react-native';
import { supabase } from '../../utils/supabase'; // Ensure path is correct
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NotificationComponent from '../notif/index'; // Ensure path is correct

// Define a type for your event data for better type safety
interface EventType {
    id: string;
    title: string | null;
    date: string | null;
    time?: string | null;
    status?: 'upcoming' | 'completed' | string | null;
    created_at?: string;
    // Add any other relevant fields from your 'events' table
}

export default function MyEvents() {
    const insets = useSafeAreaInsets();
    const [events, setEvents] = useState<EventType[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async (isRefreshing = false) => {
        if (!isRefreshing) {
             setLoading(true);
        }
        try {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching events:', error);
                // TODO: Add user-facing error handling (e.g., Toast)
            } else {
                setEvents(data || []);
            }
        } catch (error) {
            console.error('Unexpected error fetching events:', error);
             // TODO: Add user-facing error handling
        } finally {
             if (!isRefreshing) {
                 setLoading(false);
             }
             setRefreshing(false); // Ensure refreshing indicator stops
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        fetchEvents(true); // Pass true to indicate it's a refresh call
    };


    const navigateToCreateEvent = () => {
        router.push('/landing_form');
    };

    // --- EventItem Component ---
    const EventItem = React.memo(({ event }: { event: EventType }) => { // Memoize for performance
        const handlePress = () => {
            router.push(`/overview/${event.id}`);
        };

        const eventDate = event.date ? new Date(event.date) : null;

        return (
            <TouchableOpacity
                style={styles.eventCard}
                onPress={handlePress}
                activeOpacity={0.8} // Slightly more feedback
            >
                 {/* Card content remains largely the same as before */}
                <View style={styles.eventCardHeader}>
                    {eventDate ? (
                        <View style={styles.eventDateBadge}>
                            <Text style={styles.eventDateDay}>
                                {eventDate.getDate()}
                            </Text>
                            <Text style={styles.eventDateMonth}>
                                {eventDate.toLocaleString('default', { month: 'short' })}
                            </Text>
                        </View>
                    ) : (
                        <View style={styles.eventDateBadge}>
                            <Ionicons name="calendar-clear-outline" size={28} color="#6366F1" />
                        </View>
                    )}
                    <View style={styles.eventDetails}>
                        <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">
                            {event.title || 'Untitled Event'}
                        </Text>
                        <View style={styles.eventMetaRow}>
                            <Ionicons name="calendar-outline" size={14} color="#64748b" />
                            <Text style={styles.eventMeta} numberOfLines={1}>
                                {eventDate
                                    ? eventDate.toLocaleDateString()
                                    : 'Date TBA'}
                            </Text>
                        </View>
                        {event.time && (
                            <View style={styles.eventMetaRow}>
                                <Ionicons name="time-outline" size={14} color="#64748b" />
                                <Text style={styles.eventMeta}>
                                    {event.time}
                                </Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={styles.eventCardFooter}>
                    <View style={[styles.eventStatus,
                        event.status === 'completed'
                            ? styles.eventStatusCompleted
                            : styles.eventStatusUpcoming
                    ]}>
                         <Text style={[
                            styles.eventStatusText,
                             event.status === 'completed'
                                ? styles.eventStatusTextCompleted
                                : styles.eventStatusTextUpcoming
                        ]}>
                            {event.status ? event.status.charAt(0).toUpperCase() + event.status.slice(1) : 'Upcoming'}
                        </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
                </View>
            </TouchableOpacity>
        );
    });


    // --- Main Component Render ---
    return (
        <View style={styles.fullScreenContainer}>
            {/* Add button positioned at the top above all components */}
            <TouchableOpacity
                style={[styles.fab, { top: insets.top + 20, right: 20 }]} // Position at top right
                onPress={navigateToCreateEvent}
                activeOpacity={0.8}
            >
                <Ionicons name="add" size={30} color="white" />
            </TouchableOpacity>

            {/* Header is now outside the ScrollView */}
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={styles.headerTitle}>My Events</Text>
                <NotificationComponent />
            </View>

            {/* ScrollView only contains the event list */}
            <ScrollView
                style={styles.scrollViewStyle}
                contentContainerStyle={styles.scrollContentContainer}
                showsVerticalScrollIndicator={false}
                // Add pull-to-refresh functionality
                 refreshControl={
                     <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
                 }
                 keyboardShouldPersistTaps="handled" // Good practice for ScrollViews
            >
                <View style={styles.eventsContainer}>
                    {loading && !refreshing ? ( // Show loading only on initial load
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#6366F1" />
                            <Text style={styles.loadingText}>Loading events...</Text>
                        </View>
                    ) : events.length > 0 ? (
                        events.map((event) => (
                            <EventItem key={event.id} event={event} />
                        ))
                    ) : (
                        <View style={styles.noEventsContainer}>
                            <Ionicons name="calendar-outline" size={52} color="#cbd5e1" style={styles.noEventsIcon} />
                            <Text style={styles.noEventsText}>
                                No events found
                            </Text>
                            <Text style={styles.noEventsSubText}>Tap the '+' button above to create your first event!</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: '#F8FAFC', // Background for the whole screen
    },
    scrollViewStyle: {
        flex: 1, // Takes remaining space below header
    },
    scrollContentContainer: {
       paddingBottom: 40, // Space at the bottom
       paddingTop: 10, // Space below the header before list starts
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#6366F1',
        paddingBottom: 16, // Adjusted padding
        paddingHorizontal: 20,
        // No margin bottom needed as it's fixed
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#4f46e5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6, // Increased elevation for prominence
        zIndex: 10, // Ensure header is above scroll content if needed
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    eventsContainer: {
        flex: 1,
        paddingHorizontal: 16,
        // paddingTop: 20, // Moved padding to scrollContentContainer
    },
    eventCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#94a3b8',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 3, // Subtle elevation
        overflow: Platform.OS === 'android' ? 'hidden' : 'visible', // Elevation fix and allow shadow on iOS
    },
    eventCardHeader: {
        flexDirection: 'row',
        padding: 16,
        alignItems: 'center',
    },
    eventDateBadge: {
        width: 56,
        height: 56,
        backgroundColor: '#EEF2FF',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    eventDateDay: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#4338CA',
    },
    eventDateMonth: {
        fontSize: 12,
        color: '#64748B',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    eventDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 4,
    },
    eventMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4, // Consistent spacing
    },
    eventMeta: {
        fontSize: 13,
        color: '#64748B',
        marginLeft: 6,
    },
    eventCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        backgroundColor: '#FDFEFF', // Slightly different footer bg
    },
    eventStatus: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventStatusUpcoming: {
        backgroundColor: '#DBEAFE', // Lighter blue background
    },
    eventStatusCompleted: {
        backgroundColor: '#DCFCE7', // Lighter green background
    },
    eventStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
     eventStatusTextUpcoming: {
         color: '#3B82F6', // Blue text
    },
    eventStatusTextCompleted: {
         color: '#16A34A', // Green text
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80, // More vertical padding
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#64748b',
    },
     noEventsContainer: {
        marginTop: 60, // More margin top
        alignItems: 'center',
        justifyContent: 'center',
        padding: 30,
    },
     noEventsIcon: {
         marginBottom: 10, // Space below icon
     },
    noEventsText: {
        fontSize: 17, // Slightly larger
        color: '#475569',
        textAlign: 'center',
        marginTop: 16,
        fontWeight: '600', // Bolder
    },
     noEventsSubText: {
        fontSize: 14,
        color: '#64748b',
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20, // Improved readability
    },
    // --- FAB Styling ---
    fab: {
        position: 'absolute', // Position absolutely relative to fullScreenContainer
        // top: // Set dynamically using insets
        // right: 20, // Set dynamically
        width: 56, // Standard FAB size
        height: 56,
        borderRadius: 28, // Make it circular
        backgroundColor: '#4F46E5',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8,
        zIndex: 999, // Ensure it's above everything else
    },
    // Removed fabContainer and tooltip styles as FAB is now directly positioned
});