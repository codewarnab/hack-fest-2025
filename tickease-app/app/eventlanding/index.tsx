import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

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

    const EventItem = ({ event  } : any ) => (
        <TouchableOpacity 
            style={styles.eventCard}
            onPress={() => router.push(`/account`)}
        >
            <Text style={styles.eventTitle}>{event.title || 'Untitled Event'}</Text>
            <Text style={styles.eventDate}>{event.date || 'No date specified'}</Text>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
                <Text style={styles.headerTitle}>My Events</Text>
                <TouchableOpacity 
                    style={styles.refreshButton}
                    onPress={fetchEvents}
                >
                    <Ionicons name="refresh-outline" size={22} color="#fff" />
                    <Text style={styles.refreshText}>Refresh</Text>
                </TouchableOpacity>
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
        marginBottom: 24,
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
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 14,
        paddingVertical: 10,
        borderRadius: 25,
    },
    refreshText: {
        marginLeft: 6,
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
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    eventTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },
    eventDate: {
        fontSize: 16,
        color: '#666',
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