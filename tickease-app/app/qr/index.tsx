import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    Platform,
    ScrollView,
    ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCodeSVG from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';

// --- Component ---
const QRCodeDisplay = () => {
    const [eventId, setEventId] = useState<string | null>(null);
    // --- Configuration (Hardcoded for now) ---
    // Replace with dynamic ID later
    const baseUrl = 'https://tickease.vercel.app/'; // Use your actual local dev URL or deployment URL

    // Function to redirect to event landing page
    const navigateToHome = () => {
        router.push('/eventlanding');
    };

    // Function to retrieve event ID from AsyncStorage
    useEffect(() => {
        const fetchEventId = async () => {
            try {
                setLoading(true);
                const itemStr = await AsyncStorage.getItem('event_id');
                if (itemStr) {
                    const item = JSON.parse(itemStr);
                    const now = Date.now();

                    if (now > item.expiry) {
                        // Item has expired
                        await AsyncStorage.removeItem('event_id');
                        Alert.alert(
                            'Session Expired',
                            'Your event creation session has expired. Please start over.',
                            [{ text: 'OK', onPress: () => router.replace('/eventlanding') }]
                        );
                    } else {
                        setEventId(item.value);
                    }
                } else {
                    Alert.alert(
                        'No Event Found',
                        'Could not find the event you were creating. Please try again.',
                        [{ text: 'OK', onPress: () => router.replace('/eventlanding') }]
                    );
                }
            } catch (error) {
                console.error('Error retrieving event ID:', error);
                Alert.alert('Error', 'Failed to load event data. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchEventId();
    }, []);
    // --- State & Refs ---
    const [loading, setLoading] = useState(false);
    const qrCodeRef = useRef(null); // Ref for the QR code ViewShot wrapper
    const [mediaLibraryPermission, requestPermission] = MediaLibrary.usePermissions(); // Hook for permissions

    // --- Functions ---

    // Copy URL to Clipboard
    const copyToClipboard = async () => {
        await Clipboard.setStringAsync(`${baseUrl}/event/${eventId}`);
        Alert.alert("Copied!", "Event URL copied to clipboard.");
    };

    // Check/Request Media Library Permissions
    const ensurePermissions = async (): Promise<boolean> => {
        if (mediaLibraryPermission?.status === 'granted') {
            return true;
        }
        const permissionResponse = await requestPermission();
        if (permissionResponse.status !== 'granted') {
            Alert.alert(
                "Permission Required",
                "Storage permission is needed to save the QR code. Please grant permission in settings.",
                [{ text: "OK" }]
            );
            return false;
        }
        return true;
    };

    // Capture and Save QR Code
    const saveQrCode = async () => {
        const hasPermission = await ensurePermissions();
        if (!hasPermission || !qrCodeRef.current) return;

        try {
            const localUri = await captureRef(qrCodeRef, {
                // height: 440, // Optional: Specify dimensions if needed
                // width: 440,
                quality: 1, // High quality
                format: 'png', // Save as PNG
            });

            await MediaLibrary.saveToLibraryAsync(localUri);
            Alert.alert("Saved!", "QR code saved to your photos/gallery.");

        } catch (error) {
            console.error("Error saving QR code:", error);
            Alert.alert("Error", "Could not save QR code.");
        }
    };

    // Capture and Share QR Code
    const shareQrCode = async () => {
        // Sharing might implicitly need read permissions on some platforms after saving temporarily
        // It's good practice to check write permissions anyway if captureRef saves temporarily
        const hasPermission = await ensurePermissions();
        if (!hasPermission || !qrCodeRef.current) return;

        // Check if sharing is available
        if (!(await Sharing.isAvailableAsync())) {
            Alert.alert("Sharing Not Available", "Sharing is not available on this device.");
            return;
        }

        try {
            const localUri = await captureRef(qrCodeRef, {
                quality: 1,
                format: 'png',
            });

            await Sharing.shareAsync(localUri, {
                mimeType: 'image/png',
                dialogTitle: 'Share Event QR Code',
                UTI: 'public.png',
            });

        } catch (error: any) {
            // Check if the error is simply the user cancelling the share dialog
            if (error.message.includes('cancelled')) {
                console.log('Sharing cancelled by user.');
            } else {
                console.error("Error sharing QR code:", error);
                Alert.alert("Error", "Could not share QR code.");
            }
        }
    };


    // --- Render ---
    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header with Home button */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.homeButton}
                    onPress={navigateToHome}
                >
                    <Ionicons name="home-outline" size={24} color="#6366F1" />
                    <Text style={styles.homeButtonText}>Home</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.pageHeader}>Event Link & QR Code</Text>

            {/* QR Code Section */}
            <View style={styles.qrContainer}>
                <Text style={styles.sectionTitle}>Scan QR Code</Text>
                {/* View to capture - give it a background for saving */}
                <View ref={qrCodeRef} style={styles.qrCodeWrapper} collapsable={false}>
                    <QRCodeSVG
                        value={`${baseUrl}/event/${eventId}`}
                        size={250} // Adjust size as needed
                        color="#212529" // QR code color
                        backgroundColor="white" // Background for the QR itself (usually white)
                    // logo={require('./path/to/your/logo.png')} // Optional: Add a logo
                    // logoSize={30}
                    // logoBackgroundColor='transparent'
                    />
                </View>
                <Text style={styles.qrInstruction}>Scan this code with a camera app or QR reader to access the event link.</Text>
            </View>

            {/* URL Section */}
            <View style={styles.urlSection}>
                <Text style={styles.sectionTitle}>Event URL</Text>
                <View style={styles.inputRow}>
                    <TextInput
                        style={styles.textInput}
                        value={`${baseUrl}/event/${eventId}`}
                        editable={false} // Don't allow editing
                        selectTextOnFocus={true} // Make it easy to select all
                        placeholderTextColor="#ADB5BD"
                    />
                    <TouchableOpacity style={styles.copyButton} onPress={copyToClipboard}>
                        <Ionicons name="copy-outline" size={24} color="#6A5ACD" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Action Buttons Section */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity style={[styles.actionButton, styles.saveButton]} onPress={saveQrCode}>
                    <Ionicons name="download-outline" size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Save QR Code</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionButton, styles.shareButton]} onPress={shareQrCode}>
                    <Ionicons name="share-social-outline" size={20} color="#ffffff" />
                    <Text style={styles.actionButtonText}>Share QR Code</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>
    );
};

// --- Styles (Consistent Theme) ---
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA', // Match background
    },
    scrollContentContainer: {
        padding: 20,
        paddingBottom: 40, // Extra space at bottom
        alignItems: 'center', // Center content horizontally
    },
    header: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginBottom: 20,
    },
    homeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: '#E5E7EB',
        borderRadius: 8,
    },
    homeButtonText: {
        marginLeft: 5,
        color: '#6366F1',
        fontSize: 16,
        fontWeight: '600',
    },
    pageHeader: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#343A40',
        marginBottom: 24,
        textAlign: 'center',
    },
    qrContainer: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: '#FFFFFF', // Card background
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#DEE2E6',
        shadowColor: '#ADB5BD',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        width: '100%', // Take full width of padding container
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#495057',
        marginBottom: 15,
    },
    qrCodeWrapper: {
        padding: 15, // Padding around QR code for saving with border
        backgroundColor: 'white', // Background for the saved image
        borderRadius: 8, // Optional: rounded corners for saved image background
        marginBottom: 15,
        // This view is captured, so style it as you want the saved image
    },
    qrInstruction: {
        fontSize: 13,
        color: '#6C757D',
        textAlign: 'center',
        marginTop: 10,
        lineHeight: 18,
    },
    urlSection: {
        width: '100%',
        marginBottom: 30,
        alignItems: 'center',
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%', // Ensure row takes full width
        position: 'relative', // Needed for absolute positioning of copy button if desired
    },
    textInput: {
        flex: 1, // Take available space
        borderWidth: 1,
        borderColor: '#CED4DA',
        borderRadius: 8,
        paddingVertical: Platform.OS === 'ios' ? 12 : 10,
        paddingHorizontal: 12,
        fontSize: 14, // Slightly smaller font for URL
        backgroundColor: '#FFFFFF',
        color: '#212529',
        minHeight: 46,
        paddingRight: 50, // Make space for the copy button
    },
    copyButton: {
        position: 'absolute', // Position inside the TextInput area
        right: 5, // Adjust position as needed
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        paddingHorizontal: 10,
        // backgroundColor: '#F8F9FA', // Optional subtle background
        // borderTopRightRadius: 8, // Match input border radius
        // borderBottomRightRadius: 8,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Space out buttons
        width: '100%', // Use full width
        marginTop: 10,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 10,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        minWidth: '45%', // Ensure buttons have reasonable width
    },
    saveButton: {
        backgroundColor: '#6A5ACD', // Purple
    },
    shareButton: {
        backgroundColor: '#3b82f6', // Blue
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 15,
        fontWeight: 'bold',
        marginLeft: 10,
    },
});

export default QRCodeDisplay;