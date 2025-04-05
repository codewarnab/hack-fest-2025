import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import NotificationComponent from '../../notif';

export default function MyEvents() {
    const insets = useSafeAreaInsets();
    const [events, setEvents] = useState<{ id: string; title: string; date: string }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        try {
            setLoading(true);
            
            // Example query - you'll need to adjust this based on your Supabase schema
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .order('created_at', { ascending: false });
                
            if (error) {
                console.error('Error fetching events:', error);
            } else {
                setEvents(data || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    }

    const navigateToCreateEvent = () => {
        router.push('/landing_form');
    };

    const EventItem = ({ event }: any) => (
        <TouchableOpacity 
            style={styles.eventCard}
            onPress={() => router.push(`/overview/${event.id}`)}
        >
            <View style={styles.eventCardHeader}>
                {event.date ? (
                    <View style={styles.eventDateBadge}>
                        <Text style={styles.eventDateDay}>
                            {new Date(event.date).getDate()}
                        </Text>
                        <Text style={styles.eventDateMonth}>
                            {new Date(event.date).toLocaleString('default', { month: 'short' })}
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
                            {event.date 
                                ? new Date(event.date).toLocaleDateString() 
                                : 'Date to be announced'}
                        </Text>
                    </View>
                    <View style={styles.eventMetaRow}>
                        <Ionicons name="time-outline" size={14} color="#6366F1" />
                        <Text style={styles.eventMeta}>
                            {event.time || 'Time to be announced'}
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

    return (
        <ScrollView style={styles.container}>
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
                        <Text style={styles.noEventsText}>
                            {loading ? 'Loading events...' : 'No events found. Create one!'}
                        </Text>
                    </View>
                )}
            </View>

            <View style={styles.fabContainer}>
                <View style={styles.fabTooltipContainer}>
                    <Text style={styles.fabTooltipText}>Tap to Create a new Event</Text>
                </View>
                <TouchableOpacity 
                    style={styles.fab}
                    onPress={navigateToCreateEvent}
                >
                    <Text style={styles.fabIcon}>+</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FF',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#6366F1',
        paddingBottom: 24,
        paddingHorizontal: 20,
        marginBottom: 10,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 5,
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FFF',
    },
    notificationButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 40,  // Add vertical padding
        borderRadius: 25,
        alignSelf: 'center',  // Center align the button vertically
    },
    notificationBadge: {
        backgroundColor: 'red',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginLeft: 6,
    },
    notificationBadgeText: {
        color: '#FFF',
        fontWeight: '600',
    },
    eventsContainer: {
        flex: 1,
        paddingHorizontal: 20,
        marginBottom: 80, // Space for the FAB
    },
    eventCard: {
        backgroundColor: 'white',
        borderRadius: 16,
        marginBottom: 16,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.8)',
    },
    eventCardHeader: {
        flexDirection: 'row',
        padding: 16,
    },
    eventDateBadge: {
        width: 60,
        height: 60,
        backgroundColor: '#F5F7FF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(226, 232, 240, 0.5)',
    },
    eventDateDay: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#6366F1',
    },
    eventDateMonth: {
        fontSize: 14,
        color: '#64748b',
        textTransform: 'uppercase',
    },
    eventDetails: {
        flex: 1,
        justifyContent: 'center',
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1e293b',
        marginBottom: 6,
    },
    eventMetaRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    eventMeta: {
        fontSize: 14,
        color: '#64748b',
        marginLeft: 4,
    },
    eventCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        backgroundColor: '#FAFBFF',
    },
    eventStatus: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    eventStatusUpcoming: {
        backgroundColor: 'rgba(99, 102, 241, 0.15)',
    },
    eventStatusCompleted: {
        backgroundColor: 'rgba(34, 197, 94, 0.15)',
    },
    eventStatusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6366F1',
    },
    eventAction: {
        width: 32,
        height: 32,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
    noEventsContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 40,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    noEventsText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    fabContainer: {
        position: 'absolute',
        right: 25,
        bottom: -300, // Position above the navbar
        alignItems: 'center',
        zIndex: 999, // Ensure it stays above other elements
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
        color: '#333',
    },
    fab: {
        width: 64,
        height: 64, // Slightly larger for easier tapping
        borderRadius: 32,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)', // Subtle border for depth
    },
    fabIcon: {
        fontSize: 32,
        color: 'white',
        fontWeight: 'bold',
        marginTop: -2, // Center the + symbol visually
    },
});