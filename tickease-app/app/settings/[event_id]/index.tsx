import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Switch, // Import Switch
    Image,
    Platform,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView // Import for better input handling
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; // Import ImagePicker

// --- Define Types ---
interface EventSettingsData {
    id: string;
    name: string;
    tagline: string;
    description: string;
    bannerImage: string | null; // Allow null if no image picked
    date: string; // Consider using Date objects if doing date math
    time: string;
    location: string;
    address: string;
    isPublic: boolean;
    ticketingEnabled: boolean;
    // Add other editable settings
}

// --- Dummy Data ---
// Represents the data fetched for the event being edited
const dummyEventSettings: EventSettingsData = {
    id: 'hackfest-2025',
    name: 'SynthWave Hack Fest 2025',
    tagline: 'Innovate. Collaborate. Create.',
    description: 'Join the most innovative hackathon of the year. Network with industry professionals, learn new skills, and build amazing projects with like-minded individuals dedicated to pushing the boundaries of technology.',
    bannerImage: 'https://images.unsplash.com/photo-1519671482749-fd09be7acce1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    date: 'April 15-17, 2025',
    time: '9:00 AM PST onwards',
    location: 'CyberTech Convention Hub',
    address: '1 Infinite Loop, Cupertino, CA',
    isPublic: true,
    ticketingEnabled: true,
};

// --- Reusable Components ---
const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

const SettingsRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <View style={styles.settingsRow}>
        <Text style={styles.inputLabel}>{label}</Text>
        {children}
    </View>
);

// --- Main Component ---
const EventSettingsPage = () => {
    const router = useRouter();
    const params = useLocalSearchParams<{ event_id?: string }>();
    const eventId = params.event_id || dummyEventSettings.id; // Use dummy ID if none passed
    const insets = useSafeAreaInsets();

    const [formData, setFormData] = useState<EventSettingsData>(dummyEventSettings); // Initialize with dummy/fetched data
    const [isLoading, setIsLoading] = useState(false); // For initial data loading simulation
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageUri, setImageUri] = useState<string | null>(dummyEventSettings.bannerImage); // State for picked image URI

    // Simulate fetching initial data (replace with actual fetch if needed)
    useEffect(() => {
        setIsLoading(true);
        // In a real app:
        // const fetchSettings = async () => {
        //   const data = await getEventSettingsById(eventId);
        //   if (data) {
        //       setFormData(data);
        //       setImageUri(data.bannerImage);
        //   } else { setError('Failed to load settings.'); }
        //   setIsLoading(false);
        // }
        // fetchSettings();
        const timer = setTimeout(() => {
            setFormData(dummyEventSettings);
            setImageUri(dummyEventSettings.bannerImage);
            setIsLoading(false);
        }, 500); // Short delay to show loading indicator
        return () => clearTimeout(timer);
    }, [eventId]);

    const handleInputChange = (field: keyof EventSettingsData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSwitchChange = (field: keyof EventSettingsData, value: boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const pickImage = async () => {
        // Request permission (needed for iOS Camera Roll)
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to change the banner.');
            return;
        }

        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, // Allow cropping/editing
            aspect: [16, 9], // Enforce banner aspect ratio
            quality: 0.8, // Compress image slightly
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
            // Update form data immediately or handle during save
            setFormData(prev => ({ ...prev, bannerImage: result.assets[0].uri }));
        }
    };


    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        console.log("Saving data:", formData); // Log data to be saved
        // --- Replace with your actual Supabase update logic ---
        // try {
        //   const { data, error: updateError } = await supabase
        //     .from('events')
        //     .update({
        //       name: formData.name,
        //       description: formData.description,
        //       tagline: formData.tagline,
        //       // ... other fields ...
        //       is_public: formData.isPublic, // Map state to DB column names
        //       ticketing_enabled: formData.ticketingEnabled,
        //       banner_image_url: imageUri // Assuming you upload image and get URL first
        //     })
        //     .eq('id', eventId)
        //     .select(); // Optional: select to get updated data back

        //   if (updateError) throw updateError;

        //   Alert.alert("Success", "Event settings updated!");
        //   // Optionally navigate back or update local state further
        //   // router.back();

        // } catch (err: any) {
        //   console.error("Error saving event settings:", err);
        //   setError("Failed to save settings. Please try again.");
        //   Alert.alert("Error", "Could not save settings.");
        // } finally {
        //   setIsSaving(false);
        // }
        // --- End Supabase logic ---

        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSaving(false);
        Alert.alert("Settings Saved", "(Simulation successful)");
        // router.back(); // Optionally go back after save
    };

    const confirmAction = (title: string, message: string, onConfirm: () => void) => {
        Alert.alert(
            title,
            message,
            [
                { text: "Cancel", style: "cancel" },
                { text: "Confirm", style: "destructive", onPress: onConfirm }
            ]
        );
    };

    const handleCancelEvent = () => {
        confirmAction(
            "Cancel Event?",
            "This action cannot be undone. Are you sure you want to cancel this event?",
            () => {
                console.log("Event Cancelled (Simulation)");
                Alert.alert("Event Cancelled", "(Simulation)");
                // Add actual cancel logic here
            }
        );
    };

    const handleDeleteEvent = () => {
         confirmAction(
            "Delete Event Permanently?",
            "This will permanently delete the event and all associated data. This cannot be undone.",
            () => {
                console.log("Event Deleted (Simulation)");
                 Alert.alert("Event Deleted", "(Simulation)");
                // Add actual delete logic here
                // router.replace('/events'); // Navigate away after delete
            }
        );
    };


    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading Settings...</Text>
            </View>
        );
    }

    return (
        <>
            <Stack.Screen options={{ title: 'Event Settings', headerBackVisible: false }} />
            {/* Use KeyboardAvoidingView for better form experience */}
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.keyboardAvoidingContainer}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // Adjust offset if needed
            >
                <ScrollView
                    style={styles.container}
                    contentContainerStyle={styles.scrollContentContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                     {/* Banner Preview and Change Button */}
                    <View style={styles.bannerSection}>
                        <Image
                            source={{ uri: imageUri || 'https://via.placeholder.com/400x150.png?text=No+Banner' }}
                            style={styles.bannerPreview}
                            resizeMode="cover"
                        />
                        <TouchableOpacity style={styles.changeBannerButton} onPress={pickImage} activeOpacity={0.7}>
                             <Ionicons name="camera-outline" size={18} color="#FFFFFF" style={{marginRight: 8}} />
                            <Text style={styles.changeBannerText}>Change Banner</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Basic Information Card */}
                    <View style={styles.card}>
                        <SectionHeader title="Basic Information" />
                        <SettingsRow label="Event Name">
                            <TextInput
                                style={styles.textInput}
                                value={formData.name}
                                onChangeText={(value) => handleInputChange('name', value)}
                                placeholder="Enter event name"
                                placeholderTextColor="#9CA3AF"
                            />
                        </SettingsRow>
                         <SettingsRow label="Tagline (Optional)">
                            <TextInput
                                style={styles.textInput}
                                value={formData.tagline}
                                onChangeText={(value) => handleInputChange('tagline', value)}
                                placeholder="A catchy phrase for your event"
                                placeholderTextColor="#9CA3AF"
                            />
                        </SettingsRow>
                        <SettingsRow label="Description">
                            <TextInput
                                style={[styles.textInput, styles.textArea]}
                                value={formData.description}
                                onChangeText={(value) => handleInputChange('description', value)}
                                placeholder="Detailed event description"
                                multiline={true}
                                numberOfLines={4}
                                placeholderTextColor="#9CA3AF"
                            />
                        </SettingsRow>
                    </View>

                    {/* Date, Time & Location Card */}
                     <View style={styles.card}>
                        <SectionHeader title="Date, Time & Location" />
                         <SettingsRow label="Date">
                            {/* Placeholder: Replace with a proper DateTimePicker component */}
                            <TouchableOpacity style={styles.changeableTextContainer} onPress={() => Alert.alert("Date Picker", "Implement date picker here")}>
                                <Text style={styles.changeableText}>{formData.date}</Text>
                                <Ionicons name="chevron-down-outline" size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                        </SettingsRow>
                         <SettingsRow label="Time">
                            {/* Placeholder: Replace with a proper DateTimePicker component */}
                            <TouchableOpacity style={styles.changeableTextContainer} onPress={() => Alert.alert("Time Picker", "Implement time picker here")}>
                                <Text style={styles.changeableText}>{formData.time}</Text>
                                 <Ionicons name="chevron-down-outline" size={16} color="#9CA3AF" />
                            </TouchableOpacity>
                        </SettingsRow>
                         <SettingsRow label="Venue / Location Name">
                            <TextInput
                                style={styles.textInput}
                                value={formData.location}
                                onChangeText={(value) => handleInputChange('location', value)}
                                placeholder="e.g., CyberTech Convention Hub"
                                placeholderTextColor="#9CA3AF"
                            />
                        </SettingsRow>
                         <SettingsRow label="Full Address">
                            <TextInput
                                style={[styles.textInput, styles.textAreaShort]} // Slightly shorter text area
                                value={formData.address}
                                onChangeText={(value) => handleInputChange('address', value)}
                                placeholder="e.g., 1 Infinite Loop, Cupertino, CA"
                                multiline={true}
                                numberOfLines={2}
                                placeholderTextColor="#9CA3AF"
                            />
                        </SettingsRow>
                    </View>

                    {/* Visibility & Ticketing Card */}
                    <View style={styles.card}>
                        <SectionHeader title="Visibility & Ticketing" />
                        <View style={styles.switchRow}>
                            <Text style={styles.switchLabel}>Make Event Public</Text>
                            <Switch
                                trackColor={{ false: "#E5E7EB", true: "#818CF8" }} // Gray / Indigo-400
                                thumbColor={formData.isPublic ? "#6366F1" : "#f4f3f4"}
                                ios_backgroundColor="#E5E7EB"
                                onValueChange={(value) => handleSwitchChange('isPublic', value)}
                                value={formData.isPublic}
                            />
                        </View>
                        <Text style={styles.switchHelpText}>Public events are discoverable by anyone.</Text>

                         <View style={[styles.switchRow, { marginTop: 16 }]}>
                            <Text style={styles.switchLabel}>Enable Ticketing</Text>
                            <Switch
                                trackColor={{ false: "#E5E7EB", true: "#818CF8" }}
                                thumbColor={formData.ticketingEnabled ? "#6366F1" : "#f4f3f4"}
                                ios_backgroundColor="#E5E7EB"
                                onValueChange={(value) => handleSwitchChange('ticketingEnabled', value)}
                                value={formData.ticketingEnabled}
                            />
                        </View>
                         <Text style={styles.switchHelpText}>Allow users to register/purchase tickets.</Text>
                         {formData.ticketingEnabled && (
                              <TouchableOpacity style={styles.linkButton} onPress={() => router.push(`/manage-tickets/${eventId}`)}>
                                 <Text style={styles.linkButtonText}>Manage Ticket Types & Add-ons</Text>
                                  <Ionicons name="arrow-forward" size={16} color="#6366F1" />
                             </TouchableOpacity>
                         )}
                    </View>

                    {/* Danger Zone Card */}
                     <View style={[styles.card, styles.dangerZoneCard]}>
                        <SectionHeader title="Danger Zone" />
                         <TouchableOpacity style={styles.dangerButton} onPress={handleCancelEvent} activeOpacity={0.7}>
                            <Ionicons name="close-circle-outline" size={20} color="#EF4444" />
                            <Text style={styles.dangerButtonText}>Cancel Event</Text>
                         </TouchableOpacity>
                          <TouchableOpacity style={[styles.dangerButton, { marginTop: 10 }]} onPress={handleDeleteEvent} activeOpacity={0.7}>
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                            <Text style={styles.dangerButtonText}>Delete Event Permanently</Text>
                         </TouchableOpacity>
                    </View>


                    {/* Save Button */}
                    <TouchableOpacity
                        style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                        onPress={handleSave}
                        disabled={isSaving}
                        activeOpacity={0.8}
                    >
                        {isSaving ? (
                            <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                             <>
                                <Ionicons name="save-outline" size={20} color="#FFFFFF" style={{ marginRight: 10 }}/>
                                <Text style={styles.saveButtonText}>Save Changes</Text>
                            </>
                        )}
                    </TouchableOpacity>

                     {error && <Text style={styles.errorTextBottom}>{error}</Text>}

                </ScrollView>
             </KeyboardAvoidingView>
        </>
    );
};

// --- Styles --- (Enhanced for Settings Page)
const styles = StyleSheet.create({
     keyboardAvoidingContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB', // Match background
    },
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollContentContainer: {
        paddingBottom: 100, // Extra space for save button area
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#6B7280',
    },
    card: { // Base card style
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 20,
        padding: 20,
        shadowColor: '#9CA3AF',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
        elevation: 2,
        borderWidth: Platform.OS === 'android' ? 0 : 1,
        borderColor: '#F3F4F6',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 16,
    },
    bannerSection: {
        marginBottom: 20,
        position: 'relative', // For positioning button
    },
    bannerPreview: {
        width: '100%',
        height: 150, // Standard banner height for preview
        backgroundColor: '#E5E7EB', // Placeholder color
        borderRadius: 0, // No rounding for banner typically
    },
    changeBannerButton: {
        position: 'absolute',
        bottom: 12,
        right: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.6)', // Dark semi-transparent
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
    },
    changeBannerText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '500',
    },
    settingsRow: {
        marginBottom: 16,
    },
    inputLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: '#374151', // Gray-700
        marginBottom: 6,
    },
    textInput: {
        backgroundColor: '#F9FAFB', // Input background
        borderColor: '#D1D5DB', // Gray-300 border
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        fontSize: 15,
        color: '#111827', // Input text color
    },
    textArea: {
        minHeight: 100, // Taller for description
        textAlignVertical: 'top', // Start text from top on Android
    },
    textAreaShort: {
         minHeight: 60,
         textAlignVertical: 'top',
    },
    switchRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8, // Add padding for better spacing
    },
    switchLabel: {
        fontSize: 15,
        color: '#1F2937', // Gray-800
        flex: 1, // Allow label to take space
        marginRight: 10,
    },
     switchHelpText: {
        fontSize: 12,
        color: '#6B7280', // Gray-500
        marginTop: -4, // Bring closer to switch
        marginBottom: 8,
    },
    changeableTextContainer: { // For simulating date/time pickers
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#F9FAFB',
        borderColor: '#D1D5DB',
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
    },
     changeableText: {
        fontSize: 15,
        color: '#111827',
    },
    linkButton: {
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        backgroundColor: '#EEF2FF', // Light indigo bg
        borderRadius: 8,
    },
    linkButtonText: {
        color: '#6366F1',
        fontWeight: '600',
        fontSize: 14,
        marginRight: 6,
    },
    dangerZoneCard: {
        borderColor: '#FEE2E2', // Light red border
        backgroundColor: '#FFF7F7', // Very light red background
         borderWidth: 1,
    },
    dangerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        borderWidth: 1.5,
        borderColor: '#FCA5A5', // Lighter red border for button
    },
     dangerButtonText: {
        color: '#EF4444', // Red text
        marginLeft: 10,
        fontSize: 15,
        fontWeight: '500',
    },
    saveButton: {
        backgroundColor: '#4F46E5', // Primary button color
        borderRadius: 12,
        paddingVertical: 16,
        marginHorizontal: 16, // Match card margin
        marginTop: 10, // Space above save button
        marginBottom: 20, // Space below save button
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        shadowColor: '#4338CA',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
    },
    saveButtonDisabled: {
        backgroundColor: '#A5B4FC', // Lighter indigo when disabled
    },
    saveButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
     errorTextBottom: {
        marginHorizontal: 16,
        marginBottom: 20,
        color: '#DC2626',
        textAlign: 'center',
        fontSize: 14,
    },
});

export default EventSettingsPage;