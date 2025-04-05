import { View, Text, StyleSheet } from 'react-native';
import React from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';

const EventOverview = () => {
    const router = useRouter();
    const { event_id } = useLocalSearchParams(); // Get event_id from the route

    return (
        <View style={styles.container}>
            <Text style={styles.text}>Event ID: {event_id}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#000', // Optional: Set background color to make white text visible
    },
    text: {
        color: '#fff', // White color
        fontSize: 18, // Optional: Adjust font size
    },
});

export default EventOverview;