import { useState, useEffect } from 'react';
import { View, Alert, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Input } from '@rneui/themed';
import { useSession } from '@/context/SessionProvider';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import updateProfile, { UserProfile } from '@/utils/functions';

export default function Account() {
    const session = useSession();
    const [loading, setLoading] = useState(true);
    const [name, setName] = useState('');
    const [organizion_name, setOrganizationName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [discovery, setDiscovery] = useState('');
    const [bio, setBio] = useState('');
    const [isUpdated, setIsUpdated] = useState(false);
    const [isProfileComplete, setIsProfileComplete] = useState(false);

    useEffect(() => {
        if (session) {
            getProfile();
        } else {
            console.log('No session found, redirecting to onboarding...');
            router.replace('/onboarding/welcome');
        }
    }, [session]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('users')
                .select(`name, organizion_name , contact_phone,  discovery, bio`)
                .eq('id', session.user.id)
                .single();
            console.log('Profile data:', data, error);

            if (error && error.code !== '406') throw error;

            if (data) {
                setName(data.name || '');
                setOrganizationName(data.organizion_name || '');
                setContactPhone(data.contact_phone || '');
                setDiscovery(data.discovery || '');
                setBio(data.bio || '');

                // Check if all required fields are filled after fetching data
                const requiredFields = [
                    data.name || '',
                    data.organizion_name || '',
                    data.contact_phone || ''
                ];
                const allFieldsFilled = requiredFields.every(field => field && field.trim() !== '');

                setIsProfileComplete(allFieldsFilled);

                // If profile is complete, set isUpdated to true to disable fields
                if (allFieldsFilled) {
                    setIsUpdated(true);
                }
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error fetching profile', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleUpdateProfile() {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user on the session!');

            const profileData: UserProfile = {
                name,
                organizion_name,
                contact_phone: contactPhone,
                bio,
                discovery: discovery,
                // Add email if you want to update it (though typically this might be restricted)
            };
            console.log('Profile data to update:', profileData);
            const result = await updateProfile(session.user.id, profileData);
            // console.log('Update result:', result);
            if (result === null) {
                throw new Error('Failed to update profile');
            }

            // Refresh the profile data
            await getProfile();
            Alert.alert('Success', 'Your profile has been updated!');

            // Set the state to indicate profile has been updated
            setIsUpdated(true);
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error updating profile', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function signOut() {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            router.replace('/onboarding/welcome');
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error signing out', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    if (!session) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>No session found. Redirecting to sign-in...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Organizer Profile</Text>
                <TouchableOpacity onPress={signOut} style={styles.signOutButton}>
                    <Ionicons name="log-out-outline" size={22} color="#fff" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Basic Information</Text>
                <Input
                    label="Email"
                    value={session?.user?.email}
                    disabled
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    rightIcon={<Ionicons name="mail" size={20} color="#6366F1" />}
                    disabledInputStyle={styles.disabledInput}
                />
                <Input
                    label="Name"
                    value={name}
                    onChangeText={isUpdated ? undefined : setName}
                    placeholder="Your full name"
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    rightIcon={<Ionicons name="person" size={20} color="#6366F1" />}
                    disabled={isUpdated}
                    disabledInputStyle={styles.disabledInput}
                />
                <Input
                    label="Organization Name"
                    value={organizion_name}
                    onChangeText={isUpdated ? undefined : setOrganizationName}
                    placeholder="Your organization's name"
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    rightIcon={<Ionicons name="business" size={20} color="#6366F1" />}
                    disabled={isUpdated}
                    disabledInputStyle={styles.disabledInput}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Contact Details</Text>
                <Input
                    label="Phone Number"
                    value={contactPhone}
                    onChangeText={isUpdated ? undefined : setContactPhone}
                    placeholder="Your contact phone"
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    keyboardType="phone-pad"
                    rightIcon={<Ionicons name="call" size={20} color="#6366F1" />}
                    disabled={isUpdated}
                    disabledInputStyle={styles.disabledInput}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <Input
                    label="How did you find us?"
                    value={discovery}
                    onChangeText={isUpdated ? undefined : setDiscovery}
                    placeholder="Social media, friend, search, etc."
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    rightIcon={<Ionicons name="search" size={20} color="#6366F1" />}
                    disabled={isUpdated}
                    disabledInputStyle={styles.disabledInput}
                />
                <Input
                    label="About Your Organization"
                    value={bio}
                    onChangeText={isUpdated ? undefined : setBio}
                    placeholder="Tell us about your organization and events"
                    multiline
                    numberOfLines={4}
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.textAreaContainer}
                    inputStyle={[styles.input, styles.textArea]}
                    disabled={isUpdated}
                    disabledInputStyle={styles.disabledInput}
                />
            </View>

            {!isUpdated && (
                <TouchableOpacity
                    style={[
                        styles.updateButton,
                        loading && styles.buttonDisabled
                    ]}
                    onPress={handleUpdateProfile}
                    disabled={loading}
                >
                    <Text style={styles.updateButtonText}>
                        {loading ? 'Updating...' : 'Update Profile'}
                    </Text>
                </TouchableOpacity>
            )}

            {isUpdated && (
                <View style={styles.updatedMessage}>
                    <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                    <Text style={styles.updatedMessageText}>Profile complete!</Text>
                </View>
            )}

            <View style={styles.footer}>
                <Text style={styles.footerText}>© {new Date().getFullYear()} Event Organizer Portal</Text>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F7FF',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#6366F1',
        paddingVertical: 20,
        paddingHorizontal: 16,
        marginBottom: 20,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFF',
    },
    signOutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    signOutText: {
        marginLeft: 4,
        color: '#FFF',
        fontWeight: '500',
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    inputLabel: {
        color: '#666',
        fontSize: 14,
    },
    inputContainer: {
        borderBottomColor: '#DFE3FF',
        borderBottomWidth: 2,
    },
    input: {
        color: '#333',
        fontSize: 16,
    },
    disabledInput: {
        color: '#333', // Changed from '#888' to a darker color
        backgroundColor: '#F5F7FF',
        fontWeight: 'bold', // Added bold text
    },
    textAreaContainer: {
        borderBottomColor: '#DFE3FF',
        borderBottomWidth: 2,
        height: 100,
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    updateButton: {
        backgroundColor: '#6366F1',
        paddingVertical: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 30,
        alignItems: 'center',
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
    updateButtonText: {
        color: '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    updatedMessage: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#E8F5E9',
        paddingVertical: 16,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 30,
    },
    updatedMessageText: {
        color: '#4CAF50',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 20,
    },
    footerText: {
        color: '#888',
    },
});