import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Switch,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Pressable, // Keep Pressable if needed elsewhere, but not for date inputs
  FlatList,
} from 'react-native';
import { router } from 'expo-router';
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'; // For icons
// REMOVE: import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image'; // Use Expo Image
import { initializeEvent, uploadImageToSupabase } from '@/utils/functions'; // Import functions
import { supabase } from '@/utils/supabase'; // Import supabase client

// --- Constants ---
const PREDEFINED_CATEGORIES = [
  'Technology', 'Music', 'Art', 'Business', 'Food & Drink', 'Health', 'Sports', 'Other'
];

// --- Helper Function for URL Validation ---
const isValidUrl = (url: string) => {
  if (!url) return true; // Allow empty fields
  try {
    const pattern = new RegExp('^(https?:\\/\\/)' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locator
    return !!pattern.test(url);
  } catch (e) {
    return false;
  }
};

export default function CreateEvent() {
  // --- State Management ---
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(PREDEFINED_CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTagInput, setCurrentTagInput] = useState('');
  const [maxAttendees, setMaxAttendees] = useState('');

  // --- NEW: Date & Time State as Strings ---
  const [eventDateString, setEventDateString] = useState('');
  const [eventTimeString, setEventTimeString] = useState('');
  const [offerEndDateString, setOfferEndDateString] = useState('');
  const [offerEndTimeString, setOfferEndTimeString] = useState('');

  // Social Links State
  const [facebookUrl, setFacebookUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedInUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');

  // Banner State
  const [selectedImageUri, setSelectedImageUri] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [loading, setLoading] = useState(false);

  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [isSearchingLocations, setIsSearchingLocations] = useState(false);
  // --- Permissions ---
  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  // --- Handlers ---

  // Image Picker Handler
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 1,
      base64: true, // Make sure to get base64 data
    });

    if (!result.canceled) {
      setSelectedImageUri(result.assets[0].uri);
      // Upload the image immediately after selection
      handleUploadImage(result.assets[0]);
    } else {
      Alert.alert('Image Selection', 'You did not select any image.');
    }
  };

  const handleUploadImage = async (imageAsset) => {
    try {
      setLoading(true);
      setUploadProgress(0);

      const result = await uploadImageToSupabase(imageAsset);

      if (result.success) {
        setImageUrl(result.publicUrl);
        setUploadProgress(100);
        Alert.alert('Success', 'Image uploaded successfully!');
      } else {
        Alert.alert('Upload Failed', result.error || 'Failed to upload image to storage.');
      }
    } catch (error) {
      console.error('Error in image upload handler:', error);
      Alert.alert('Upload Failed', error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Tag Input Handlers
  const handleAddTag = () => {
    const newTag = currentTagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
    }
    setCurrentTagInput('');
  };

  interface TagHandlerProps {
    tagToRemove: string;
  }

  const handleRemoveTag = (tagToRemove: TagHandlerProps['tagToRemove']) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleLocationInputChange = async (text) => {
    setLocation(text);
    console.log('Location input:', text);

    if (text.length > 2) {
      setIsSearchingLocations(true);
      try {
        const query = text;
        const components = "country:IN";
        const types = "route";
        const language = "en";
        const api_key = "AIzaSyCzDpgy-dgQ9aXHcV9iOxZMLPkaioxn46g";
        const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(query)}&key=${api_key}&components=${components}&types=${types}&language=${language}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.predictions) {
          // Limit to 3 suggestions as requested
          const limitedSuggestions = data.predictions.slice(0, 3);
          console.log('Location suggestions:', limitedSuggestions);
          setLocationSuggestions(limitedSuggestions);
        }
      } catch (error) {
        console.error('Error fetching location suggestions:', error);
      } finally {
        setIsSearchingLocations(false);
      }
    } else {
      // Clear suggestions if input is too short
      setLocationSuggestions([]);
    }
  };


  const handleLocationSelect = (selectedLocation) => {
    setLocation(selectedLocation.description);
    // Clear suggestions after selection
    setLocationSuggestions([]);
  };


  // Submit Handler
  const handleSubmit = useCallback(async () => {
    // --- Validation ---
    if (!title.trim()) return Alert.alert('Missing Info', 'Event title is required.');
    if (!description.trim()) return Alert.alert('Missing Info', 'Event description is required.');
    if (!location.trim()) return Alert.alert('Missing Info', 'Event location is required.');
    if (!selectedCategory || selectedCategory === 'Select a Category...') return Alert.alert('Missing Info', 'Please select an event category.');
    if (!selectedImageUri) return Alert.alert('Missing Info', 'Event banner image is required.');

    // --- NEW: Date/Time String Validation ---
    if (!eventDateString.trim()) return Alert.alert('Missing Info', 'Event Date is required.');
    if (!eventTimeString.trim()) return Alert.alert('Missing Info', 'Event Time is required.');
    // Optional: Add more specific format validation (e.g., regex) here if needed

    if (maxAttendees.trim() && isNaN(Number(maxAttendees))) return Alert.alert('Invalid Info', 'Max attendees must be a number.');

    // Basic URL Validation
    if (!isValidUrl(facebookUrl)) return Alert.alert('Invalid URL', 'Please enter a valid Facebook URL (starting with http/https).');
    if (!isValidUrl(twitterUrl)) return Alert.alert('Invalid URL', 'Please enter a valid Twitter/X URL.');
    if (!isValidUrl(instagramUrl)) return Alert.alert('Invalid URL', 'Please enter a valid Instagram URL.');
    if (!isValidUrl(linkedinUrl)) return Alert.alert('Invalid URL', 'Please enter a valid LinkedIn URL.');
    if (!isValidUrl(websiteUrl)) return Alert.alert('Invalid URL', 'Please enter a valid Website URL.');

    setLoading(true);

    try {
      // Get the current user session
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !sessionData?.session?.user) {
        setLoading(false);
        return Alert.alert('Authentication Error', 'Please sign in to create an event');
      }

      const userId = sessionData.session.user.id;

      // Prepare social links object with only non-empty values
      const socialLinks = {
        ...(facebookUrl.trim() && { facebook: facebookUrl.trim() }),
        ...(twitterUrl.trim() && { twitter: twitterUrl.trim() }),
        ...(instagramUrl.trim() && { instagram: instagramUrl.trim() }),
        ...(linkedinUrl.trim() && { linkedin: linkedinUrl.trim() }),
        ...(websiteUrl.trim() && { website: websiteUrl.trim() })
      };

      const eventData = {
        title: title.trim(),
        description: description.trim(),
        location: location.trim(),
        category: selectedCategory,
        tags,
        eventDate: eventDateString.trim(),
        eventTime: eventTimeString.trim(),
        offerEndDate: offerEndDateString.trim() || null,
        offerEndTime: offerEndTimeString.trim() || null,
        maxAttendees: maxAttendees.trim() ? Number(maxAttendees.trim()) : null,
        socialLinks,
        bannerImage: selectedImageUri,
        imageUrl
      };
      console.log('Event Data:', eventData); // Debugging log

      // Call the initializeEvent function from functions.ts
      const result = await initializeEvent(
        userId,
        title.trim(),
        description.trim(),
        eventDateString.trim(),
        eventTimeString.trim(),
        location.trim(),
        selectedCategory,
        tags,
        socialLinks,
        imageUrl // Use the public URL from Supabase instead of selectedImageUri
      );

      setLoading(false);

      if (result === "success") {
        Alert.alert(
          'Success',
          'Event created successfully! Now let\'s set up registration questions.',
          [{ text: 'OK', onPress: () => router.push('/reg_form') }]
        );
      } else {
        Alert.alert('Error', 'Failed to create event. Please try again.');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    }
  }, [
    title, description, location, selectedCategory, tags, maxAttendees,
    eventDateString, eventTimeString, offerEndDateString, offerEndTimeString,
    selectedImageUri,
    facebookUrl, twitterUrl, instagramUrl, linkedinUrl, websiteUrl, router
  ]);


  // Cancel Handler
  const handleCancel = () => {
    try {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (error) {
      console.error('Navigation error on cancel:', error);
      Alert.alert('Navigation Error', 'Could not go back');
    }
  };

  // --- Render ---
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* --- Header --- */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Create New Event</Text>
          <Text style={styles.headerSubtitle}>Provide details for your awesome event</Text>
        </View>

        {/* --- Form Section 1: Core Details --- */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Event Details</Text>

          {/* Banner */}
          <Text style={styles.inputLabel}>Event Banner *</Text>
          <TouchableOpacity
            style={styles.bannerContainer}
            onPress={pickImage}
            activeOpacity={0.7}
          >
            {/* ... Banner Image/Placeholder ... */}
            {selectedImageUri ? (
              <Image
                source={{ uri: selectedImageUri }}
                style={styles.bannerImage}
                contentFit="cover"
                transition={300}
              />
            ) : (
              <View style={styles.addBannerContent}>
                <MaterialIcons name="add-photo-alternate" size={40} color="#6366F1" />
                <Text style={styles.addBannerText}>TAP TO ADD BANNER</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Title */}
          <Text style={styles.inputLabel}>Event Title *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setTitle}
              value={title}
              placeholder="e.g., Innovation Summit 2025"
              placeholderTextColor="#9CA3AF"
            />
          </View>

          {/* Description */}
          <Text style={styles.inputLabel}>Event Description *</Text>
          <View style={[styles.inputContainer, styles.textAreaContainer]}>
            <TextInput
              style={[styles.input, styles.textArea]}
              onChangeText={setDescription}
              value={description}
              placeholder="Tell attendees about your event..."
              placeholderTextColor="#9CA3AF"
              multiline
            />
          </View>

          {/* Category Picker */}
          <Text style={styles.inputLabel}>Category *</Text>
          <View style={styles.pickerContainer}>
            {/* ... Picker Code ... */}
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue, itemIndex) => setSelectedCategory(itemValue)}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              dropdownIconColor="#6366F1"
            >
              {PREDEFINED_CATEGORIES.map((category, index) => (
                <Picker.Item key={index} label={category} value={category} />
              ))}
            </Picker>
          </View>

          {/* Tag Input */}
          <Text style={styles.inputLabel}>Tags (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={currentTagInput}
              onChangeText={setCurrentTagInput}
              placeholder="Type a tag and press enter..."
              placeholderTextColor="#9CA3AF"
              onSubmitEditing={handleAddTag}
              blurOnSubmit={false}
            />
          </View>
          <View style={styles.tagsContainer}>
            {/* ... Tags display ... */}
            {tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
                <TouchableOpacity onPress={() => handleRemoveTag(tag)} style={styles.removeTagButton}>
                  <MaterialIcons name="close" size={14} color="#4F46E5" />
                </TouchableOpacity>
              </View>
            ))}
          </View>

          {/* Featured Switch */}
        </View>

        {/* --- Form Section 2: Date, Time, Location --- */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>When & Where</Text>

          {/* --- NEW: Event Date Input --- */}
          <Text style={styles.inputLabel}>Event Date * (MM-DD-YYYY)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={eventDateString}
              onChangeText={setEventDateString}
              placeholder="MM-DD-YYYY"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric" // Helps on mobile, not full validation
              maxLength={10}
            />
            <MaterialIcons name="calendar-today" size={20} color="#6B7280" style={styles.pickerIcon} />
          </View>

          {/* --- NEW: Event Time Input --- */}
          <Text style={styles.inputLabel}>Event Time * (HH:MM AM/PM)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={eventTimeString}
              onChangeText={setEventTimeString}
              placeholder="e.g., 07:00 PM"
              placeholderTextColor="#9CA3AF"
              maxLength={8} // HH:MM AM
              autoCapitalize="characters" // Helps with AM/PM but user can still type lowercase
            />
            <MaterialIcons name="access-time" size={20} color="#6B7280" style={styles.pickerIcon} />
          </View>

          {/* Location */}
          <Text style={styles.inputLabel}>Location *</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={handleLocationInputChange}
              value={location}
              placeholder="e.g., Grand Hall, City Center"
              placeholderTextColor="#9CA3AF"
            />
            {isSearchingLocations && (
              <ActivityIndicator size="small" color="#6366F1" style={styles.locationLoader} />
            )}
          </View>

          {/* Location Suggestions */}
          {locationSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={locationSuggestions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => handleLocationSelect(item)}
                  >
                    <Text style={styles.suggestionText}>{item.description}</Text>
                  </TouchableOpacity>
                )}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>

        {/* --- Form Section 3: Offer Deadline --- */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Special Offer (Optional)</Text>
          <Text style={[styles.headerSubtitle, { marginBottom: 16 }]}>Set a deadline for early bird pricing or other promotions.</Text>

          {/* --- NEW: Offer End Date Input --- */}
          <Text style={styles.inputLabel}>Offer Ends On (MM/DD/YYYY)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={offerEndDateString}
              onChangeText={setOfferEndDateString}
              placeholder="MM/DD/YYYY"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              maxLength={10}
            />
            <MaterialIcons name="calendar-today" size={20} color="#6B7280" style={styles.pickerIcon} />
          </View>

          {/* --- NEW: Offer End Time Input --- */}
          <Text style={styles.inputLabel}>Offer Ends At (HH:MM AM/PM)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={offerEndTimeString}
              onChangeText={setOfferEndTimeString}
              placeholder="e.g., 11:59 PM"
              placeholderTextColor="#9CA3AF"
              maxLength={8}
              autoCapitalize="characters"
            />
            <MaterialIcons name="access-time" size={20} color="#6B7280" style={styles.pickerIcon} />
          </View>

          {/* Max Attendees */}
          <Text style={styles.inputLabel}>Max Attendees (Optional)</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              onChangeText={setMaxAttendees}
              value={maxAttendees}
              placeholder="Limit number of attendees"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* --- Form Section 4: Social Links --- */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>Online Presence (Optional)</Text>
          {/* ... Social Inputs ... */}
          <Text style={styles.inputLabel}>Facebook URL</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} onChangeText={setFacebookUrl} value={facebookUrl} placeholder="https://facebook.com/YourPage" placeholderTextColor="#9CA3AF" keyboardType="url" autoCapitalize="none" />
          </View>
          <Text style={styles.inputLabel}>Twitter/X URL</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} onChangeText={setTwitterUrl} value={twitterUrl} placeholder="https://x.com/YourProfile" placeholderTextColor="#9CA3AF" keyboardType="url" autoCapitalize="none" />
          </View>
          <Text style={styles.inputLabel}>Instagram URL</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} onChangeText={setInstagramUrl} value={instagramUrl} placeholder="https://instagram.com/YourProfile" placeholderTextColor="#9CA3AF" keyboardType="url" autoCapitalize="none" />
          </View>
          <Text style={styles.inputLabel}>LinkedIn URL</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} onChangeText={setLinkedInUrl} value={linkedinUrl} placeholder="https://linkedin.com/company/YourPage" placeholderTextColor="#9CA3AF" keyboardType="url" autoCapitalize="none" />
          </View>
          <Text style={styles.inputLabel}>Event Website URL</Text>
          <View style={styles.inputContainer}>
            <TextInput style={styles.input} onChangeText={setWebsiteUrl} value={websiteUrl} placeholder="https://YourEventWebsite.com" placeholderTextColor="#9CA3AF" keyboardType="url" autoCapitalize="none" />
          </View>
        </View>

        {/* --- Action Buttons --- */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={handleCancel}
            activeOpacity={0.8}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>Next</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* REMOVE: DateTimePicker Modal */}
        {/* {showPicker && ( ... )} */}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// --- Styles --- (Keep the styles as they were, they should adapt fine)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FE',
  },
  scrollContentContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 80, // More bottom padding for scroll
  },
  headerContainer: {
    marginTop: Platform.OS === 'ios' ? 40 : 20,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 28, // Increased size slightly
    fontWeight: 'bold',
    color: '#111827', // Darker
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  suggestionsContainer: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 10,
    marginTop: -16,
    marginBottom: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 1000,
  },
  formSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#9CA3AF', // Adjusted shadow color
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20, // Slightly larger section title
    fontWeight: '600',
    color: '#4F46E5', // Indigo for titles
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  inputLabel: {
    fontSize: 15, // Slightly larger labels
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputLabelSwitch: { // Specific style for switch label alignment
    fontSize: 15,
    fontWeight: '500',
    color: '#374151',
  },
  inputContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10, // More rounded inputs
    paddingHorizontal: 14, // More padding
    marginBottom: 18, // Increased margin
    minHeight: 50, // Standard height
    flexDirection: 'row', // For icon alignment
    alignItems: 'center', // Center items vertically
  },
  input: {
    flex: 1, // Input takes remaining space
    fontSize: 16,
    color: '#111827',
    paddingVertical: 10, // Ensure consistent padding inside input
  },
  textAreaContainer: {
    minHeight: 120,
    paddingVertical: 12,
    alignItems: 'flex-start', // Align text to top
  },
  textArea: {
    height: 100, // Fixed height
    textAlignVertical: 'top',
    paddingVertical: 0, // Reset padding for multiline
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 10,
    marginBottom: 18,
    minHeight: 50,
    justifyContent: 'center',
  },
  picker: {
    height: Platform.OS === 'ios' ? 120 : 50,
    width: '100%',
    color: '#111827',
    backgroundColor: Platform.OS === 'android' ? '#F9FAFB' : undefined,
  },
  pickerItem: {
    // height: 120, // Example, might need adjustment
    // fontSize: 18,
  },
  dateText: { // This style is no longer needed for date/time display
    // flex: 1,
    // fontSize: 16,
    // color: '#111827',
  },
  pickerIcon: { // Keep this style for the icons next to the text inputs
    marginLeft: 8,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 18,
    paddingVertical: 8,
  },
  bannerContainer: {
    height: 180,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#9CA3AF',
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  addBannerContent: {
    alignItems: 'center',
    opacity: 0.8,
  },
  addBannerText: {
    marginTop: 10,
    color: '#6366F1',
    fontWeight: '500',
    fontSize: 14,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  tag: {
    flexDirection: 'row',
    backgroundColor: '#E0E7FF',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginRight: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  tagText: {
    color: '#4F46E5',
    fontSize: 13,
    marginRight: 5,
  },
  removeTagButton: {
    marginLeft: 4,
    padding: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    marginBottom: Platform.OS === 'ios' ? 30 : 50,
    gap: 16,
  },
  button: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#6366F1',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  suggestionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionText: {
    fontSize: 14,
    color: '#111827',
  },
  locationLoader: {
    marginLeft: 8,
  },
});