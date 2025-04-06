import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
  TextInput, // Import TextInput
  Alert,      // Import Alert
  Keyboard,   // Import Keyboard
  ActivityIndicator, // Keep for potential future loading
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';

// --- Interfaces (Keep these defined) ---
interface Ticket {
    id: string;
    name: string | null;
    price: number;
    capacity: number;
    sold: number;
    status: 'On Sale' | 'Sold Out' | 'Not Started' | string;
    color?: string;
}

interface AddOn {
  id: string; // Use string consistently for IDs
  name: string | null;
  price: number;
  description: string | null;
}

// --- Initial Dummy Data (used to initialize state) ---
const initialDummyEventData = {
    id: 'hackfest-2025',
    name: 'SynthWave Hack Fest 2025',
    tickets: [
        { id: 'T1', name: 'Early Bird Pass', price: 49.99, capacity: 100, sold: 100, status: 'Sold Out', color: '#ef4444' },
        { id: 'T2', name: 'Standard Admission', price: 79.99, capacity: 200, sold: 78, status: 'On Sale', color: '#22c55e' },
        { id: 'T3', name: 'VIP Experience', price: 149.99, capacity: 50, sold: 10, status: 'On Sale', color: '#a855f7' }, // Added some sales
        { id: 'T4', name: 'Student Discount', price: 39.99, capacity: 50, sold: 5, status: 'On Sale', color: '#64748b' }, // Changed status
    ],
    addOns: [
        { id: 'A1', name: 'Workshop: AI in Creative Tech', price: 29.99, description: 'Hands-on session with industry experts.' },
        { id: 'A2', name: 'Exclusive Networking Dinner', price: 59.99, description: 'Connect with speakers & sponsors.' },
        { id: 'A3', name: 'Premium Swag Pack', price: 19.99, description: 'Includes T-shirt, stickers, and more.' },
    ]
};

// --- Reusable UI Components ---

const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

const AddButton = ({ label, onPress }: { label: string; onPress: () => void }) => (
    <TouchableOpacity style={styles.addButton} onPress={onPress} activeOpacity={0.8}>
        <Ionicons name="add-circle-outline" size={20} color="#6366F1" />
        <Text style={styles.addButtonLabel}>{label}</Text>
    </TouchableOpacity>
);

// --- Enhanced Card Components with Editing ---

const TicketTypeCard = ({ ticket, isEditing, editedPrice, onEditPress, onPriceChange, onSave, onCancel }: {
    ticket: Ticket;
    isEditing: boolean;
    editedPrice: string; // Pass edited price string
    onEditPress: (id: string, currentPrice: number) => void;
    onPriceChange: (text: string) => void;
    onSave: (id: string) => void;
    onCancel: () => void;
}) => {
    const remaining = ticket.capacity - ticket.sold;
    const progress = ticket.capacity > 0 ? Math.min((ticket.sold / ticket.capacity) * 100, 100) : 0;

    const getStatusStyle = () => {
        // Example implementation, replace with your logic
        return ticket.status === 'On Sale'
            ? { backgroundColor: '#22c55e' } // Green for "On Sale"
            : ticket.status === 'Sold Out'
            ? { backgroundColor: '#ef4444' } // Red for "Sold Out"
            : { backgroundColor: '#64748b' }; // Default style
    };
    const getStatusTextStyle = () => {
        return ticket.status === 'On Sale'
            ? { color: '#22c55e', fontWeight: 'bold' } // Green text for "On Sale"
            : ticket.status === 'Sold Out'
            ? { color: '#ef4444', fontWeight: 'bold' } // Red text for "Sold Out"
            : { color: '#64748b', fontWeight: 'bold' }; // Default style
    };

    return (
        <View style={styles.itemCard}>
            <View style={styles.itemHeader}>
                <View style={[styles.itemColorIndicator, { backgroundColor: ticket.color || '#D1D5DB' }]} />
                <Text style={styles.itemName}>{ticket.name || 'Unnamed Ticket'}</Text>
                <View style={[styles.statusBadgeSmall, getStatusStyle()]}>
                    <Text style={[styles.statusTextSmall, getStatusTextStyle()]}>{ticket.status}</Text>
                </View>
                {!isEditing && ( // Show Edit button only when not editing
                    <TouchableOpacity style={styles.editButton} onPress={() => onEditPress(ticket.id, ticket.price)}>
                        <Ionicons name="pencil-outline" size={18} color="#64748B" />
                    </TouchableOpacity>
                 )}
            </View>

            {isEditing ? (
                <View style={styles.editContainer}>
                     <TextInput
                        style={styles.priceInput}
                        value={editedPrice}
                        onChangeText={onPriceChange}
                        keyboardType="numeric"
                        placeholder="Enter Price"
                        autoFocus={true} // Focus the input when editing starts
                    />
                    <View style={styles.editActions}>
                        <TouchableOpacity style={[styles.editActionButton, styles.cancelButton]} onPress={onCancel}>
                             <Ionicons name="close-circle-outline" size={20} color="#DC2626"/>
                             {/* <Text style={[styles.editActionButtonText, styles.cancelButtonText]}>Cancel</Text> */}
                        </TouchableOpacity>
                         <TouchableOpacity style={[styles.editActionButton, styles.saveButton]} onPress={() => onSave(ticket.id)}>
                              <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A"/>
                             {/* <Text style={[styles.editActionButtonText, styles.saveButtonText]}>Save</Text> */}
                        </TouchableOpacity>
                    </View>
                </View>
            ) : (
                <>
                    <View style={styles.itemDetailsRow}>
                        <Text style={styles.itemPrice}>${ticket.price.toFixed(2)}</Text>
                        <Text style={styles.itemDetailText}>{`${ticket.sold} / ${ticket.capacity}`} <Text style={styles.lightText}>Sold</Text></Text>
                        <Text style={styles.itemDetailText}>{`${remaining}`} <Text style={styles.lightText}>Left</Text></Text>
                    </View>
                    <View style={styles.itemProgressBarBackground}>
                        <View style={[styles.itemProgressBarForeground, { width: `${progress}%`, backgroundColor: ticket.color || '#6366F1' }]} />
                    </View>
                </>
            )}
        </View>
    );
};

const AddOnCard = ({ addOn, isEditing, editedPrice, onEditPress, onPriceChange, onSave, onCancel }: {
    addOn: AddOn;
    isEditing: boolean;
    editedPrice: string;
    onEditPress: (id: string, currentPrice: number) => void;
    onPriceChange: (text: string) => void;
    onSave: (id: string) => void;
    onCancel: () => void;
}) => {
    return (
        <View style={styles.itemCard}>
             <View style={styles.itemHeader}>
                 <Ionicons name="extension-puzzle-outline" size={18} color="#4B5563" style={styles.addOnIcon}/>
                 <Text style={styles.itemName}>{addOn.name || 'Unnamed Add-on'}</Text>
                 {!isEditing && (
                    <TouchableOpacity style={styles.editButton} onPress={() => onEditPress(addOn.id, addOn.price)}>
                        <Ionicons name="pencil-outline" size={18} color="#64748B" />
                    </TouchableOpacity>
                 )}
             </View>
              <Text style={styles.addOnDescription}>{addOn.description || 'No description.'}</Text>
              {isEditing ? (
                 <View style={styles.editContainer}>
                     <TextInput
                        style={styles.priceInput}
                        value={editedPrice}
                        onChangeText={onPriceChange}
                        keyboardType="numeric"
                        placeholder="Enter Price"
                        autoFocus={true}
                    />
                    <View style={styles.editActions}>
                         <TouchableOpacity style={[styles.editActionButton, styles.cancelButton]} onPress={onCancel}>
                            <Ionicons name="close-circle-outline" size={20} color="#DC2626"/>
                        </TouchableOpacity>
                         <TouchableOpacity style={[styles.editActionButton, styles.saveButton]} onPress={() => onSave(addOn.id)}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#16A34A"/>
                        </TouchableOpacity>
                    </View>
                 </View>
              ) : (
                  <View style={styles.itemDetailsRow}>
                     <Text style={styles.itemPrice}>${addOn.price.toFixed(2)}</Text>
                     {/* Add other details like 'Sold' if tracked */}
                 </View>
              )}
        </View>
    );
};

// --- AI Suggestion Component ---
const SuggestionCard = ({ iconName, text, color = "#8B5CF6"}: {
     iconName: keyof typeof Ionicons.glyphMap;
     text: string;
     color?: string;
}) => (
    <View style={styles.suggestionCard}>
         <Ionicons name={iconName} size={24} color={color} style={styles.suggestionIcon} />
         <Text style={styles.suggestionText}>{text}</Text>
    </View>
);


// --- Main Component ---

const ManageTicketsPage = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ event_id?: string }>();
  const eventId = params.event_id || initialDummyEventData.id;
  const insets = useSafeAreaInsets();

  // --- State for Data and Editing ---
  const [tickets, setTickets] = useState<Ticket[]>(initialDummyEventData.tickets);
  const [addOns, setAddOns] = useState<AddOn[]>(initialDummyEventData.addOns);
  const [editingItemId, setEditingItemId] = useState<string | null>(null); // ID of item being edited
  const [editedPrice, setEditedPrice] = useState<string>(''); // Current value in TextInput

  // --- Edit Handlers ---
  const handleEditPress = (id: string, currentPrice: number) => {
      setEditingItemId(id);
      setEditedPrice(currentPrice.toFixed(2)); // Set initial edit value
       Keyboard.dismiss(); // Dismiss keyboard if open from previous edit
  };

  const handleCancelEdit = () => {
      setEditingItemId(null);
      setEditedPrice('');
       Keyboard.dismiss();
  };

  const handleSavePrice = (id: string, itemType: 'ticket' | 'addon') => {
      const newPrice = parseFloat(editedPrice);
      if (isNaN(newPrice) || newPrice < 0) {
          Alert.alert("Invalid Price", "Please enter a valid positive number for the price.");
          return;
      }

      if (itemType === 'ticket') {
          setTickets(currentTickets =>
              currentTickets.map(ticket =>
                  ticket.id === id ? { ...ticket, price: newPrice } : ticket
              )
          );
      } else {
           setAddOns(currentAddOns =>
              currentAddOns.map(addOn =>
                  addOn.id === id ? { ...addOn, price: newPrice } : addOn
              )
          );
      }

      console.log(`Saved new price for ${itemType} ${id}: $${newPrice.toFixed(2)}`);
      handleCancelEdit(); // Exit edit mode
  };

   const handlePriceInputChange = (text: string) => {
       // Allow only numbers and one decimal point
       const numericValue = text.replace(/[^0-9.]/g, '');
       const parts = numericValue.split('.');
       if (parts.length > 2) { // Prevent multiple decimal points
            return;
       }
       if (parts[1] && parts[1].length > 2) { // Limit to 2 decimal places
            return;
       }
       setEditedPrice(numericValue);
   };


  // --- Add Handlers (Placeholders) ---
  const handleAddNewTicket = () => { Alert.alert("Add Ticket", "Implement add ticket logic."); };
  const handleAddNewAddOn = () => { Alert.alert("Add Add-on", "Implement add add-on logic."); };

  return (
    <>
      <Stack.Screen options={{ title: "Manage Tickets & Add-ons" }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={[styles.scrollContentContainer, { paddingBottom: insets.bottom + 20 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled" // Dismiss keyboard when tapping outside input
      >
        {/* Ticket Types Section */}
        <View style={styles.section}>
          <SectionHeader title="Ticket Types" />
          {tickets.length > 0 ? (
            tickets.map((ticket) => (
              <TicketTypeCard
                key={ticket.id}
                ticket={ticket}
                isEditing={editingItemId === ticket.id}
                editedPrice={editedPrice}
                onEditPress={handleEditPress}
                onPriceChange={handlePriceInputChange}
                onSave={(id) => handleSavePrice(id, 'ticket')}
                onCancel={handleCancelEdit}
              />
            ))
          ) : (
            <Text style={styles.noItemsText}>No tickets available.</Text>
          )}
          <AddButton label="Add New Ticket Type" onPress={handleAddNewTicket} />
        </View>

        {/* Add-ons Section */}
        <View style={styles.section}>
          <SectionHeader title="Add-ons" />
           {addOns.length > 0 ? (
            addOns.map((addOn) => (
              <AddOnCard
                 key={addOn.id}
                 addOn={addOn}
                 isEditing={editingItemId === addOn.id}
                 editedPrice={editedPrice}
                 onEditPress={handleEditPress}
                 onPriceChange={handlePriceInputChange}
                 onSave={(id) => handleSavePrice(id, 'addon')}
                 onCancel={handleCancelEdit}
               />
            ))
          ) : (
            <Text style={styles.noItemsText}>No add-ons available.</Text>
          )}
          <AddButton label="Add New Add-on" onPress={handleAddNewAddOn} />
        </View>

        {/* AI Suggestions Section */}
        <View style={styles.section}>
             <SectionHeader title="Smart Suggestions" />
             <SuggestionCard
                iconName="trending-up-outline"
                text="Consider adding a 'Very Early Bird' ticket for the first 50 signups to boost initial sales."
                color="#10b981" // Emerald
             />
             <SuggestionCard
                 iconName="cash-outline"
                 text="The 'VIP Experience' is currently unsold. Try bundling it with the 'Networking Dinner' add-on."
                 color="#f59e0b" // Amber
             />
              <SuggestionCard
                 iconName="time-outline"
                 text="Offer a small discount on 'Standard Admission' for a limited time next week to drive urgency."
                 color="#3b82f6" // Blue
             />
        </View>

      </ScrollView>
    </>
  );
};

// --- Styles --- (Includes new styles for editing and suggestions)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContentContainer: {
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  noItemsText: { /* ... */ },
  itemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: Platform.OS === 'android' ? 0 : 1,
    borderColor: '#F3F4F6',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemColorIndicator: {
    width: 8,
    height: 24,
    borderRadius: 4,
    marginRight: 10,
  },
  addOnIcon: { marginRight: 10 },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
    marginRight: 8,
  },
  editButton: { padding: 6, }, // Added padding for easier tap
  statusBadgeSmall: { /* ... */ },
  statusTextSmall: { /* ... */ },
  statusOnSale: { /* ... */ },
  statusSoldOut: { /* ... */ },
  statusNotStarted: { /* ... */ },
  statusTextOnSale: { /* ... */ },
  statusTextSoldOut: { /* ... */ },
  statusTextNotStarted: { /* ... */ },
  itemDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  itemDetailText: { /* ... */ },
  lightText: { /* ... */ },
  itemProgressBarBackground: { /* ... */ },
  itemProgressBarForeground: { /* ... */ },
  addOnDescription: { /* ... */ },
  addButton: { /* ... */ },
  addButtonLabel: { /* ... */ },

  // --- Editing Styles ---
  editContainer: {
      marginTop: 8,
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
  },
  priceInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: '#D1D5DB', // Gray-300
      borderRadius: 8,
      paddingVertical: 8,
      paddingHorizontal: 12,
      fontSize: 15,
      marginRight: 10,
      backgroundColor: '#F9FAFB', // Light bg for input
  },
  editActions: {
      flexDirection: 'row',
  },
  editActionButton: {
      padding: 8,
      borderRadius: 20, // Circular icon buttons
      marginLeft: 8,
  },
  saveButton: {
      backgroundColor: '#ECFDF5', // Light Green
  },
  cancelButton: {
       backgroundColor: '#FEF2F2', // Light Red
  },
//   editActionButtonText: {
//       fontSize: 14,
//       fontWeight: '600',
//   },
//   saveButtonText: { color: '#047857' /* Green-700 */ },
//   cancelButtonText: { color: '#B91C1C' /* Red-700 */ },

   // --- Suggestion Styles ---
    suggestionCard: {
        flexDirection: 'row',
        alignItems: 'flex-start', // Align icon top
        backgroundColor: '#F3E8FF', // Light Purple Background
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
        borderLeftColor: '#8B5CF6', // Purple-500
    },
    suggestionIcon: {
        marginRight: 12,
        marginTop: 2, // Align icon slightly better with text line
    },
    suggestionText: {
        flex: 1, // Allow text to wrap
        fontSize: 14,
        color: '#5B21B6', // Darker Purple
        lineHeight: 20,
    },

});

export default ManageTicketsPage;