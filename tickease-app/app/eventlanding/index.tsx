import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NotificationComponent from '../notif';
import { fetchUserEvents } from '@/utils/functions'; // Import the utility function

export default function MyEvents() {
    const insets = useSafeAreaInsets();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false); // State for pull-to-refresh

    useEffect(() => {
        loadEvents();
    }, []);

    // Function to validate if an event has all required fields
    const isValidEvent = (event) => {
        const requiredFields = [
            'title',
            'description',
            'venue',
            'image',
            'category',
            'eventDate', // Using eventDate instead of date
            'eventTime', // Using eventTime instead of time
            'form_schema'
        ];

        return requiredFields.every(field =>
            event[field] !== undefined &&
            event[field] !== null &&
            event[field] !== ''
        );
    };

    // Updated function to load events using the utility function
    async function loadEvents() {
        try {
            setLoading(true);
            const { events, error } = await fetchUserEvents();

            if (error) {
                console.error('Error fetching events:', error);
                // TODO: Add user-facing error handling (e.g., Toast)
            } else {
                setEvents(events);
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

    const EventItem = ({ event }) => (
        <TouchableOpacity
            style={styles.eventCard}
            onPress={() => router.push(`/account`)}
        >
            <View style={styles.eventCardHeader}>
                {event.eventDate ? (
                    <View style={styles.eventDateBadge}>
                        <Text style={styles.eventDateDay}>
                            {new Date(event.eventDate).getDate()}
                        </Text>
                        <Text style={styles.eventDateMonth}>
                            {new Date(event.eventDate).toLocaleString('default', { month: 'short' })}
                        </Text>
                    </View>
                ) : (
                    <View style={styles.eventDateBadge}>
                        <Ionicons name="calendar" size={28} color="#6366F1" />
                    </View>
                )}
                <View style={styles.eventDetails}>
                    <Text style={styles.eventTitle} numberOfLines={1} ellipsizeMode="tail">
                        {event.title || 'Untitled Event'}
                    </Text>
                    <View style={styles.eventMetaRow}>
                        <Ionicons name="calendar-outline" size={14} color="#6366F1" />
                        <Text style={styles.eventMeta} numberOfLines={1}>
                            {event.eventDate
                                ? new Date(event.eventDate).toLocaleDateString()
                                : 'Date to be announced'}
                        </Text>
                    </View>
                    <View style={styles.eventMetaRow}>
                        <Ionicons name="time-outline" size={14} color="#6366F1" />
                        <Text style={styles.eventMeta}>
                            {event.eventTime || 'Time to be announced'}
                        </Text>
                    </View>
                </View>
            </View>
            <View style={styles.eventCardFooter}>
                <View style={[styles.eventStatus,
                event.status === 'completed'
                    ? styles.eventStatusCompleted
                    : styles.eventStatusUpcoming
                ]}>
                    <Text style={styles.eventStatusText}>
                        {event.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </Text>
                </View>
                <TouchableOpacity style={styles.eventAction}>
                    <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    // --- Main Component Render ---
    return (
        <View style={styles.mainContainer}>
            <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                    <Text style={styles.headerTitle}>My Events</Text>
                    <NotificationComponent />
                </View>

                <View style={styles.eventsContainer}>
                    {events.length > 0 ? (
                        events.map((event) => (
                            <EventItem key={event.id} event={event} />
                        ))
                    ) : (
                        <View style={styles.noEventsContainer}>
                            {loading ? (
                                <Text style={styles.noEventsText}>Loading events...</Text>
                            ) : (
                                <>
                                    <Image
                                        source={require('@/assets/images/noeventfound.svg')}
                                        style={styles.noEventsImage}
                                        contentFit="contain"
                                    />
                                    <Text style={styles.noEventsText}>
                                        No events found. Create one with all required fields!
                                    </Text>
                                </>
                            )}
                        </View>
                    )}
                </View>
                {/* Add extra padding at the bottom to ensure content isn't hidden behind FAB */}
                <View style={{ height: 100 }} />
            </ScrollView>

            {/* Responsive FAB with tooltip */}
            <View style={styles.fabWrapper}>
                <View style={styles.fabTooltipContainer}>
                    <Text style={styles.fabTooltipText}>Tap to Create a new Event</Text>
                </View>
                <TouchableOpacity
                    style={styles.fab}
                    onPress={navigateToCreateEvent}
                    activeOpacity={0.7}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

// --- Styles ---
const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        position: 'relative',
    },
    container: {
        flex: 1,
        backgroundColor: '#F5F7FF',
    },
    scrollContent: {
        flexGrow: 1,
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
        paddingHorizontal: 20,
        paddingBottom: 20,
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
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginTop: 40,
    },
    noEventsText: {
        fontSize: 17, // Slightly larger
        color: '#475569',
        textAlign: 'center',
    },
    fabWrapper: {
        position: 'absolute',
        alignItems: 'center',
        right: '1%', // Use percentage instead of fixed pixels for responsive positioning
        bottom: '12%', // Use percentage for responsive positioning
        zIndex: 999,
    },
    fabTooltipContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderRadius: 12,
        padding: 10,
        marginBottom: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        maxWidth: 160,
    },
    fabTooltipText: {
        fontSize: 13,
        textAlign: 'center',
        marginTop: 8,
        lineHeight: 20, // Improved readability
    },
    // --- FAB Styling ---
    fab: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    fabIcon: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
        marginTop: -2,
    },
    noEventsImage: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
});