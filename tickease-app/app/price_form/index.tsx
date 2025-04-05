import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Platform,
  Keyboard,
  SafeAreaView,
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createTickets } from '@/utils/functions';

// --- Type Definitions (Fixed Fields) ---
type AddOnOption = {
  id: string;
  label: string;
  price: number;
  description: string;
};

type PromoCode = {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
};

type TicketType = {
  id: string;
  label: string;
  maxQuantity: number;
  price: number;
  description: string;
  addonOptions: AddOnOption[];
  promoCodes: PromoCode[]; // Added promo codes
};

// --- Component ---
const TicketTypeForm = () => {
  // --- Refs for input focus ---
  const inputRefs = useRef<{ [key: string]: React.RefObject<TextInput> }>({});
  const flatListRef = useRef<FlatList>(null);

  // --- State ---
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: `ticket_${Date.now()}`,
      label: '',
      maxQuantity: 0,
      price: 0,
      description: '',
      addonOptions: [],
      promoCodes: [] // Initialized promo codes
    }
  ]);

  // New state variables for AsyncStorage and loading
  const [eventId, setEventId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  // Track currently focused input
  const [activeInputId, setActiveInputId] = useState<string | null>(null);

  // --- Helper function to create/get ref for an input ---
  const getInputRef = (id: string) => {
    if (!inputRefs.current[id]) {
      inputRefs.current[id] = React.createRef<TextInput>();
    }
    return inputRefs.current[id];
  };

  // --- Functions ---

  // Add a new ticket type
  const addNewTicketType = () => {
    const newTicket: TicketType = {
      id: `ticket_${Date.now()}`,
      label: '',
      maxQuantity: 0,
      price: 0,
      description: '',
      addonOptions: [],
      promoCodes: [] // Initialize for new ticket
    };
    setTicketTypes([...ticketTypes, newTicket]);

    // Scroll to the new ticket after it's added
    setTimeout(() => {
      if (flatListRef.current) {
        flatListRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  // Remove a ticket type
  const removeTicketType = (id: string) => {
    if (ticketTypes.length <= 1) {
      Alert.alert(
        "Cannot Remove",
        "You must have at least one ticket type.",
        [
          { text: "OK", style: "cancel" }
        ],
        { cancelable: true }
      );
      return;
    }

    // Remove associated refs
    const updatedRefs = { ...inputRefs.current };
    Object.keys(updatedRefs).forEach(key => {
      if (key.includes(id)) {
        delete updatedRefs[key];
      }
    });
    inputRefs.current = updatedRefs;

    setTicketTypes(ticketTypes.filter(ticket => ticket.id !== id));
  };

  // Update a ticket type's fixed field
  const updateTicketType = (id: string, field: keyof Omit<TicketType, 'addonOptions' | 'promoCodes' | 'id'>, value: string | number) => {
    setTicketTypes(
      ticketTypes.map(ticket =>
        ticket.id === id ? { ...ticket, [field]: value } : ticket
      )
    );
  };

  // Add a new add-on option
  const addNewAddOn = (ticketId: string) => {
    const newAddOn: AddOnOption = {
      id: `addon_${Date.now()}`,
      label: '',
      price: 0,
      description: ''
    };
    setTicketTypes(
      ticketTypes.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, addonOptions: [...ticket.addonOptions, newAddOn] }
          : ticket
      )
    );
  };

  // Remove an add-on option
  const removeAddOn = (ticketId: string, addOnId: string) => {
    // Remove associated refs
    const updatedRefs = { ...inputRefs.current };
    Object.keys(updatedRefs).forEach(key => {
      if (key.includes(addOnId)) {
        delete updatedRefs[key];
      }
    });
    inputRefs.current = updatedRefs;

    setTicketTypes(
      ticketTypes.map(ticket =>
        ticket.id === ticketId
          ? { ...ticket, addonOptions: ticket.addonOptions.filter(addon => addon.id !== addOnId) }
          : ticket
      )
    );
  };

  // Update an add-on option's fixed field
  const updateAddOn = (ticketId: string, addOnId: string, field: keyof Omit<AddOnOption, 'id'>, value: string | number) => {
    setTicketTypes(
      ticketTypes.map(ticket =>
        ticket.id === ticketId
          ? {
            ...ticket,
            addonOptions: ticket.addonOptions.map(addon =>
              addon.id === addOnId ? { ...addon, [field]: value } : addon
            )
          }
          : ticket
      )
    );
  };


  // Updated function to save ticket data to the database
  const goToNextStep = async () => {
    // Validate input
    const isValid = ticketTypes.every(ticket => ticket.label.trim() !== '' && ticket.maxQuantity > 0 && ticket.price >= 0);
    if (!isValid) {
      Alert.alert("Missing Information", "Please ensure all ticket types have a label, maximum quantity, and price specified.");
      return;
    }

    if (!eventId) {
      Alert.alert('Error', 'No event ID found. Please try creating the event again.');
      return;
    }

    try {
      setSubmitting(true);
      Keyboard.dismiss();

      console.log("Saving tickets for event ID:", eventId);
      console.log(JSON.stringify(ticketTypes, null, 2));

      // Call the function to create tickets in the database
      const result = await createTickets(eventId, ticketTypes);

      if (result === "success") {
        Alert.alert(
          'Success',
          'Event created successfully!',
          [{ text: 'OK', onPress: () => router.push('/qr') }]
        );
      } else {
        Alert.alert('Error', 'Failed to create tickets. Please try again.');
      }
    } catch (error) {
      console.error('Error saving tickets:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // --- Custom StableTextInput component with stable refs ---
  const StableTextInput = useCallback(({
    id,
    value,
    onChangeText,
    style,
    ...props
  }: {
    id: string,
    value: string,
    onChangeText: (text: string) => void,
    style: any,
    [key: string]: any
  }) => {
    const inputRef = getInputRef(id);

    // Handle focus management
    React.useEffect(() => {
      if (activeInputId === id && inputRef.current) {
        inputRef.current.focus();
      }
    }, [id, activeInputId]);

    return (
      <TextInput
        ref={inputRef}
        style={style}
        value={value}
        onChangeText={onChangeText}
        onFocus={() => setActiveInputId(id)}
        {...props}
      />
    );
  }, [activeInputId]);

  // --- Sub-Components (modified to use StableTextInput) ---

  // Add-On Form Component
  const AddOnForm = useCallback(({
    ticketId,
    addonOptions
  }: {
    ticketId: string,
    addonOptions: AddOnOption[]
  }) => (
    <View style={styles.addOnsContainer}>
      <Text style={styles.addOnsTitle}>Add-On Options</Text>
      {addonOptions.length === 0 && <Text style={styles.noItemsText}>No add-ons defined.</Text>}
      {addonOptions.map((addOn) => (
        <View key={addOn.id} style={styles.addOnFormSection}>
          <View style={styles.formHeader}>
            <Text style={styles.formSubtitle}>Add-On</Text>
            <TouchableOpacity style={styles.removeButton} onPress={() => removeAddOn(ticketId, addOn.id)}>
              <Ionicons name="close-circle-outline" size={22} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Add-on name *</Text>
            <StableTextInput
              id={`${ticketId}_${addOn.id}_label`}
              style={styles.textInput}
              value={addOn.label}
              onChangeText={(text) => updateAddOn(ticketId, addOn.id, 'label', text)}
              placeholder="e.g. VIP Parking"
              placeholderTextColor="#ADB5BD"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Price ($)</Text>
            <StableTextInput
              id={`${ticketId}_${addOn.id}_price`}
              style={styles.textInput}
              value={addOn.price === 0 ? '' : addOn.price.toString()}
              onChangeText={(text) => updateAddOn(ticketId, addOn.id, 'price', parseInt(text.replace(/[^0-9]/g, ''), 10) || 0)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#ADB5BD"
            />
          </View>
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Description</Text>
            <StableTextInput
              id={`${ticketId}_${addOn.id}_desc`}
              style={styles.textAreaInput}
              value={addOn.description}
              onChangeText={(text) => updateAddOn(ticketId, addOn.id, 'description', text)}
              placeholder="e.g. Includes preferred parking spot"
              placeholderTextColor="#ADB5BD"
              multiline={true}
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
        </View>
      ))}
      <TouchableOpacity style={styles.addButton} onPress={() => addNewAddOn(ticketId)}>
        <Ionicons name="add-circle-outline" size={22} color="#6A5ACD" />
        <Text style={styles.addButtonText}>Add Add-On</Text>
      </TouchableOpacity>
    </View>
  ), [StableTextInput]);



  // --- Main Ticket Form Renderer ---
  const renderTicketForm = useCallback(({ item }: { item: TicketType }) => (
    <View style={styles.formSection}>
      {/* Header */}
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Ticket Type {ticketTypes.findIndex(t => t.id === item.id) + 1}</Text>
        {ticketTypes.length > 1 && (
          <TouchableOpacity style={styles.removeButton} onPress={() => removeTicketType(item.id)}>
            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>
      {/* Label */}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Ticket Label *</Text>
        <StableTextInput
          id={`${item.id}_label`}
          style={styles.textInput}
          value={item.label}
          onChangeText={(text) => updateTicketType(item.id, 'label', text)}
          placeholder="e.g. General Admission, VIP"
          placeholderTextColor="#ADB5BD"
        />
      </View>
      {/* Quantity & Price */}
      <View style={styles.rowContainer}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.inputLabel}>Max Quantity *</Text>
          <StableTextInput
            id={`${item.id}_maxQty`}
            style={styles.textInput}
            value={item.maxQuantity === 0 ? '' : item.maxQuantity.toString()}
            onChangeText={(text) => updateTicketType(item.id, 'maxQuantity', parseInt(text.replace(/[^0-9]/g, ''), 10) || 0)}
            keyboardType="numeric"
            placeholder="100"
            placeholderTextColor="#ADB5BD"
          />
        </View>
        <View style={styles.halfInputContainer}>
          <Text style={styles.inputLabel}>Price ($) *</Text>
          <StableTextInput
            id={`${item.id}_price`}
            style={styles.textInput}
            value={item.price === 0 ? '' : item.price.toString()}
            onChangeText={(text) => updateTicketType(item.id, 'price', parseInt(text.replace(/[^0-9]/g, ''), 10) || 0)}
            keyboardType="numeric"
            placeholder="50"
            placeholderTextColor="#ADB5BD"
          />
        </View>
      </View>
      {/* Description */}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Description</Text>
        <StableTextInput
          id={`${item.id}_desc`}
          style={styles.textAreaInput}
          value={item.description}
          onChangeText={(text) => updateTicketType(item.id, 'description', text)}
          placeholder="e.g. Includes access to main event areas."
          placeholderTextColor="#ADB5BD"
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>
      {/* Add-Ons */}
      <AddOnForm ticketId={item.id} addonOptions={item.addonOptions} />
      {/* Promo Codes */}

    </View>
  ), [ticketTypes, activeInputId, StableTextInput, AddOnForm]);

  // --- Main Return ---
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={ticketTypes}
        renderItem={renderTicketForm}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={<Text style={styles.pageHeader}>Create Ticket Types</Text>}
        ListFooterComponent={<View style={{ height: 20 }} />}
        removeClippedSubviews={false}
        extraData={activeInputId} // Re-render when the active input changes
      />
      <TouchableOpacity style={styles.floatingAddButton} onPress={addNewTicketType}>
        <Ionicons name="add-outline" size={24} color="#ffffff" />
        <Text style={styles.floatingAddButtonText}>Add Ticket Type</Text>
      </TouchableOpacity>
      <View style={styles.bottomActionContainer}>
        <TouchableOpacity style={styles.nextButton} onPress={goToNextStep}>
          <Text style={styles.nextButtonText}>Create Event</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Styles ---
const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  pageHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#343A40',
    marginBottom: 16,
    marginTop: 12,
    paddingHorizontal: 16,
    width: '100%',
    textAlign: 'left',
  },
  listContainer: {
    flex: 1,
    width: '100%',
  },
  listContentContainer: {
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 140, // Increased space for buttons
  },
  formSection: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    shadowColor: '#ADB5BD',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    marginBottom: 16,
    width: '100%',
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
    width: '100%',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
  },
  formSubtitle: { // Used inside AddOn/Promo forms
    fontSize: 15,
    fontWeight: '600',
    color: '#495057',
  },
  removeButton: {
    padding: 8,
    borderRadius: 20,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfInputContainer: {
    width: '48%',
    marginBottom: 16, // Ensure consistent spacing
  },
  inputRow: {
    marginBottom: 16,
    width: '100%',
  },
  inputLabel: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingVertical: Platform.OS === 'ios' ? 12 : 10,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    color: '#212529',
    minHeight: 46,
    width: '100%',
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    minHeight: 80,
    textAlignVertical: 'top',
    color: '#212529',
    width: '100%',
  },
  floatingAddButton: {
    position: 'absolute',
    right: 20,
    bottom: Platform.OS === 'ios' ? 100 : 85,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#6A5ACD',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    zIndex: 10,
  },
  floatingAddButtonText: {
    color: '#ffffff',
    marginLeft: 8,
    fontWeight: 'bold',
    fontSize: 15,
  },
  bottomActionContainer: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 5,
  },
  nextButton: {
    backgroundColor: '#6A5ACD',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    width: '100%', // Make button full width
  },
  nextButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // --- Add-on Styles ---
  addOnsContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 16,
    width: '100%',
  },
  addOnsTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 16,
  },
  addOnFormSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    width: '100%',
  },
  addButton: { // Shared by Add-on and Promo Code
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
    paddingHorizontal: 5,
  },
  addButtonText: { // Shared by Add-on and Promo Code
    marginLeft: 8,
    fontSize: 14,
    color: '#6A5ACD',
    fontWeight: 'bold',
  },
  // --- Promo Code Styles ---
  promoCodesContainer: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 16,
    width: '100%',
  },
  promoCodesTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 16,
  },
  promoCodeFormSection: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    width: '100%',
  },
  promoCodeInput: {
    // textTransform: 'uppercase', // Cannot apply directly via style
  },
  discountTypeSelector: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    overflow: 'hidden',
    minHeight: 46, // Match input height
    width: '100%',
  },
  discountTypeButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  discountTypeButtonActive: {
    backgroundColor: '#E9E7FD', // Light purple background
  },
  discountTypeButtonText: {
    fontSize: 13,
    color: '#495057',
    fontWeight: '500',
    textAlign: 'center',
  },
  discountTypeButtonTextActive: {
    color: '#6A5ACD', // Purple text
    fontWeight: 'bold',
  },
  noItemsText: { // Generic style for "No add-ons" or "No promo codes"
    fontStyle: 'italic',
    color: '#6c757d',
    marginBottom: 12,
    textAlign: 'center',
  },
});

export default TicketTypeForm;