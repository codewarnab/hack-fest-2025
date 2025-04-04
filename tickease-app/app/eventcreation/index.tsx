import React, { useState } from 'react';
import { 
    View, 
    Text, 
    TextInput, 
    TouchableOpacity, 
    StyleSheet,
    ScrollView
} from 'react-native';
 // Note: This is a placeholder. You'll need to import the actual map component you're using

export default function VenueSelection() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVenue, setSelectedVenue] = useState<{ name: string; address: string } | null>(null);
    const [botName, setBotName] = useState('');
    const [predefinedQuestions] = useState([
        'What are the opening hours?',
        'Is there parking available?',
        'How many people can the venue accommodate?'
    ]);

    // Function to handle venue selection
    const handleVenueSelect = (venue:any) => {
        setSelectedVenue(venue);
        // In a real app, you would likely fetch more details about the venue here
    };

    // Mock data for demonstration
    const mockVenue = {
        name: "Sample Venue",
        address: "123 Main Street, Anytown, ST 12345"
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search box for selecting places"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                />
            </View>

            <View style={styles.mapContainer}>
                {/* Placeholder for the map component */}
                <View style={styles.mapPlaceholder}>
                    <Text style={styles.mapText}>Map for selecting location in the map</Text>
                    <Text style={styles.mapText}>for venue</Text>
                </View>

                {/* Demo button to simulate selecting a venue */}
                <TouchableOpacity 
                    style={styles.demoButton}
                    onPress={() => handleVenueSelect(mockVenue)}
                >
                    <Text style={styles.demoButtonText}>Simulate Venue Selection</Text>
                </TouchableOpacity>
            </View>

            {/* Address display area */}
            <View style={styles.addressContainer}>
                {selectedVenue ? (
                    <Text style={styles.addressText}>{selectedVenue.address}</Text>
                ) : (
                    <Text style={styles.placeholderText}>Show the address after venue is selected</Text>
                )}
            </View>

            {/* Custom question component */}
            <View style={styles.questionContainer}>
                <Text style={styles.sectionTitle}>Custom Questions</Text>
                <Text style={styles.questionSubtitle}>custom question component to ask user few questions will be predefined</Text>
                
                {predefinedQuestions.map((question, index) => (
                    <TouchableOpacity key={index} style={styles.questionButton}>
                        <Text style={styles.questionButtonText}>{question}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Chat bot context area */}
            <View style={styles.contextContainer}>
                <Text style={styles.contextText}>context for chat bot</Text>
            </View>

            {/* Bot naming option */}
            <View style={styles.botNameContainer}>
                <Text style={styles.inputLabel}>Name your bot</Text>
                <TextInput
                    style={styles.botNameInput}
                    placeholder="an option for naming the bot"
                    value={botName}
                    onChangeText={setBotName}
                />
            </View>

            {/* Submit button at the bottom */}
            <TouchableOpacity style={styles.submitButton}>
                <Text style={styles.submitButtonText}>Continue</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EBF0FF',
        padding: 24,
    },
    searchContainer: {
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: 'white',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#DDD',
    },
    mapContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        overflow: 'hidden',
    },
    mapPlaceholder: {
        height: 200,
        backgroundColor: '#333',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    mapText: {
        color: 'white',
        fontSize: 16,
    },
    demoButton: {
        backgroundColor: '#6366F1',
        padding: 8,
        alignItems: 'center',
    },
    demoButtonText: {
        color: 'white',
        fontWeight: '500',
    },
    addressContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        minHeight: 60,
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    addressText: {
        fontSize: 16,
        color: '#333',
    },
    placeholderText: {
        fontSize: 16,
        color: '#888',
        fontStyle: 'italic',
    },
    questionContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    questionSubtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 16,
    },
    questionButton: {
        backgroundColor: '#F0F2FF',
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#E0E3FF',
    },
    questionButtonText: {
        fontSize: 16,
        color: '#6366F1',
    },
    contextContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minHeight: 80,
        justifyContent: 'center',
    },
    contextText: {
        fontSize: 16,
        color: '#888',
        fontStyle: 'italic',
    },
    botNameContainer: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#444',
        marginBottom: 8,
    },
    botNameInput: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        color: '#333',
    },
    submitButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    submitButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
});