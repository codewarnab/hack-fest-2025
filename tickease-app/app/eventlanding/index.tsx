import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';

export default function MyEvents() {
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
        router.push('/landing_form'); // ✅ forces the literal string

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
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.headerTitle}>My Events</Text>
            </View>

            <ScrollView style={styles.eventsContainer}>
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
            </ScrollView>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EBF0FF',
        padding: 24,
    },
    headerContainer: {
        marginTop: 48,
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    eventsContainer: {
        flex: 1,
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
        right: 30,
        bottom: 40,
        alignItems: 'center',
    },
    fabTooltipContainer: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 10,
        marginBottom: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    fabTooltipText: {
        fontSize: 14,
        color: '#333',
    },
    fab: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#6366F1',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 6,
        elevation: 5,
    },
    fabIcon: {
        fontSize: 30,
        color: 'white',
        fontWeight: 'bold',
    },
});