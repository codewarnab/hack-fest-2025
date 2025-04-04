// Account.tsx
import { useState, useEffect } from 'react';
import { View, Alert, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal, ActivityIndicator } from 'react-native';
import { Input } from '@rneui/themed';
import { useSession } from '@/context/SessionProvider';
import { supabase } from '@/utils/supabase';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { toByteArray } from 'base64-js';

function decode(base64String: string): Uint8Array {
    return toByteArray(base64String);
}



export default function Account() {
    const session = useSession();
    const [loading, setLoading] = useState(true);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [name, setName] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [website, setWebsite] = useState('');
    const [discovery, setDiscovery] = useState('');
    const [bio, setBio] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [showUploadModal, setShowUploadModal] = useState(false);

    useEffect(() => {
        if (session) {
            getProfile();
        } else {
            router.replace('/onboarding/welcome');
        }
    }, [session]);

    async function getProfile() {
        try {
            setLoading(true);
            if (!session?.user) return;

            const { data, error } = await supabase
                .from('users')
                .select(`name, organization_name, contact_phone, website, discovery, bio, avatar_url`)
                .eq('id', session.user.id)
                .single();

            if (error && error.code !== '406') throw error;

            if (data) {
                setName(data.name || '');
                setOrganizationName(data.organization_name || '');
                setContactPhone(data.contact_phone || '');
                setWebsite(data.website || '');
                setDiscovery(data.discovery || '');
                setBio(data.bio || '');
                setAvatarUrl(data.avatar_url || '');
            }
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error fetching profile', error.message);
            }
        } finally {
            setLoading(false);
        }
    }

    async function updateProfile() {
        try {
            setLoading(true);
            if (!session?.user) throw new Error('No user on the session!');

            const updates = {
                id: session.user.id,
                name,
                organization_name: organizationName,
                contact_phone: contactPhone,
                website,
                discovery,
                bio,
                avatar_url: avatarUrl,
                updated_at: new Date(),
            };

            const { error } = await supabase.from('users').upsert(updates);

            if (error) {
                throw error;
            }

            Alert.alert('Success', 'Your profile has been updated!');
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

    async function uploadFromCamera() {
        try {
            const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Camera access is needed to take photos');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                await uploadImage(result.assets[0].uri, result.assets[0].base64);
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while using the camera');
        } finally {
            setShowUploadModal(false);
        }
    }

    async function uploadFromGallery() {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permissionResult.granted) {
                Alert.alert('Permission Required', 'Gallery access is needed to select photos');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
                base64: true,
            });

            if (!result.canceled && result.assets && result.assets[0]) {
                await uploadImage(result.assets[0].uri, result.assets[0].base64);
            }
        } catch (error) {
            Alert.alert('Error', 'An error occurred while selecting from gallery');
        } finally {
            setShowUploadModal(false);
        }
    }

    async function uploadImage(uri:any, base64Data:any) {
        try {
            setUploadLoading(true);
            if (!session?.user) throw new Error('No user on the session!');

            // Create a unique file path for the image
            const fileExt = uri.split('.').pop();
            const fileName = `${session.user.id}_${Date.now()}.${fileExt}`;
            const filePath = `avatars/${fileName}`;

            let fileData;
            if (base64Data) {
                fileData = decode(base64Data);
            } else {
                // If base64 is not available, read the file
                const fileInfo = await FileSystem.getInfoAsync(uri);
                if (!fileInfo.exists) {
                    throw new Error('File does not exist');
                }
                const fileContent = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
                fileData = decode(fileContent);
            }

            // Upload the image to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('profiles')
                .upload(filePath, fileData, {
                    contentType: `image/${fileExt}`,
                    upsert: true,
                });

            if (uploadError) throw uploadError;

            // Get the public URL for the image
            const { data } = supabase.storage.from('profiles').getPublicUrl(filePath);
            const newAvatarUrl = data.publicUrl;

            // Update the avatar URL in state and database
            setAvatarUrl(newAvatarUrl);
            await updateAvatarInDatabase(newAvatarUrl);

            Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
            if (error instanceof Error) {
                Alert.alert('Error uploading image', error.message);
            } else {
                Alert.alert('Error', 'An unknown error occurred when uploading');
            }
        } finally {
            setUploadLoading(false);
        }
    }

    async function updateAvatarInDatabase(url:any) {
        try {
            if (!session?.user) throw new Error('No user on the session!');

            const { error } = await supabase
                .from('users')
                .update({ avatar_url: url })
                .eq('id', session.user.id);

            if (error) throw error;
        } catch (error) {
            throw error;
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

            <View style={styles.profileImageContainer}>
                {uploadLoading ? (
                    <View style={styles.profileImagePlaceholder}>
                        <ActivityIndicator color="#6366F1" size="large" />
                    </View>
                ) : avatarUrl ? (
                    <Image source={{ uri: avatarUrl }} style={styles.profileImage} />
                ) : (
                    <View style={styles.profileImagePlaceholder}>
                        <Text style={styles.profileImagePlaceholderText}>
                            {name?.charAt(0) || session.user.email?.charAt(0) || '?'}
                        </Text>
                    </View>
                )}
                <TouchableOpacity
                    style={styles.uploadButton}
                    onPress={() => setShowUploadModal(true)}
                    disabled={uploadLoading}
                >
                    <Text style={styles.uploadButtonText}>
                        {uploadLoading ? 'Uploading...' : 'Upload Photo'}
                    </Text>
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
                    onChangeText={setName}
                    placeholder="Your full name"
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    rightIcon={<Ionicons name="person" size={20} color="#6366F1" />}
                />
                <Input
                    label="Organization Name"
                    value={organizationName}
                    onChangeText={setOrganizationName}
                    placeholder="Your organization's name"
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    rightIcon={<Ionicons name="business" size={20} color="#6366F1" />}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Contact Details</Text>
                <Input
                    label="Phone Number"
                    value={contactPhone}
                    onChangeText={setContactPhone}
                    placeholder="Your contact phone"
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    keyboardType="phone-pad"
                    rightIcon={<Ionicons name="call" size={20} color="#6366F1" />}
                />
                <Input
                    label="Website"
                    value={website}
                    onChangeText={setWebsite}
                    placeholder="Your website URL"
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    keyboardType="url"
                    rightIcon={<Ionicons name="globe" size={20} color="#6366F1" />}
                />
            </View>

            <View style={styles.card}>
                <Text style={styles.sectionTitle}>Additional Information</Text>
                <Input
                    label="How did you find us?"
                    value={discovery}
                    onChangeText={setDiscovery}
                    placeholder="Social media, friend, search, etc."
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.input}
                    rightIcon={<Ionicons name="search" size={20} color="#6366F1" />}
                />
                <Input
                    label="About Your Organization"
                    value={bio}
                    onChangeText={setBio}
                    placeholder="Tell us about your organization and events"
                    multiline
                    numberOfLines={4}
                    labelStyle={styles.inputLabel}
                    inputContainerStyle={styles.textAreaContainer}
                    inputStyle={[styles.input, styles.textArea]}
                />
            </View>

            <TouchableOpacity
                style={[styles.updateButton, loading && styles.buttonDisabled]}
                onPress={updateProfile}
                disabled={loading}
            >
                <Text style={styles.updateButtonText}>
                    {loading ? 'Updating...' : 'Update Profile'}
                </Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>© {new Date().getFullYear()} Event Organizer Portal</Text>
            </View>

            {/* Photo Upload Modal */}
            <Modal
                visible={showUploadModal}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setShowUploadModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Change Profile Picture</Text>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={uploadFromCamera}
                        >
                            <Ionicons name="camera" size={24} color="#6366F1" />
                            <Text style={styles.modalButtonText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={uploadFromGallery}
                        >
                            <Ionicons name="images" size={24} color="#6366F1" />
                            <Text style={styles.modalButtonText}>Choose from Gallery</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.modalButton, styles.cancelButton]}
                            onPress={() => setShowUploadModal(false)}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    profileImageContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    profileImage: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 8,
    },
    profileImagePlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#DFE3FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    profileImagePlaceholderText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#6366F1',
    },
    uploadButton: {
        padding: 8,
        backgroundColor: '#DFE3FF',
        borderRadius: 20,
    },
    uploadButtonText: {
        color: '#6366F1',
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
        color: '#888',
        backgroundColor: '#F5F7FF',
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
    footer: {
        alignItems: 'center',
        paddingVertical: 16,
        marginBottom: 20,
    },
    footerText: {
        color: '#888',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: 'white',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#F5F7FF',
        borderRadius: 10,
        marginBottom: 12,
    },
    modalButtonText: {
        fontSize: 16,
        color: '#333',
        marginLeft: 12,
    },
    cancelButton: {
        backgroundColor: '#FFF',
        borderWidth: 1,
        borderColor: '#DFE3FF',
        justifyContent: 'center',
    },
    cancelButtonText: {
        color: '#6366F1',
        fontWeight: '500',
        textAlign: 'center',
    },
});