import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router'; // Import router

// --- Type Definitions (Corrected and Consistent) ---
type AddOnOption = {
  id: string;
  label: string; // Use 'label' consistently
  price: number;
  description: string;
};

type TicketType = {
  id: string;
  label: string;      // Use 'label' consistently
  maxQuantity: number; // Use 'maxQuantity' consistently
  price: number;
  description: string;
  addonOptions: AddOnOption[]; // Use 'addonOptions' consistently
};

// --- Component ---
const TicketTypeForm = () => {
  // --- State ---
  // Initialize state using the correct property names from TicketType
  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([
    {
      id: Date.now().toString(), // Generate ID for the first item too
      label: '',          // Use 'label'
      maxQuantity: 0,   // Use 'maxQuantity'
      price: 0,
      description: '',
      addonOptions: []    // Use 'addonOptions'
    }
  ]);

  // --- Functions ---

  // Add a new ticket type using the correct properties
  const addNewTicketType = () => {
    const newTicket: TicketType = { // Ensure the new object conforms to TicketType
      id: Date.now().toString(),
      label: '',          // Use 'label'
      maxQuantity: 0,   // Use 'maxQuantity'
      price: 0,
      description: '',
      addonOptions: []    // Use 'addonOptions'
    };
    setTicketTypes([...ticketTypes, newTicket]);
  };

  // Remove a ticket type
  const removeTicketType = (id: string) => {
    if (ticketTypes.length <= 1) {
      Alert.alert("Cannot Remove", "You must have at least one ticket type.");
      return;
    }
    setTicketTypes(ticketTypes.filter(ticket => ticket.id !== id));
  };

  // Update a ticket type field (value can be string, number, or array for addonOptions)
  const updateTicketType = (id: string, field: keyof TicketType, value: string | number | AddOnOption[]) => {
    setTicketTypes(
      ticketTypes.map(ticket =>
        ticket.id === id ? { ...ticket, [field]: value } : ticket
      )
    );
  };

  // Add a new add-on option using the correct properties
  const addNewAddOn = (ticketId: string) => {
    const newAddOn: AddOnOption = { // Ensure the new object conforms to AddOnOption
      id: Date.now().toString(),
      label: '',          // Use 'label'
      price: 0,
      description: ''
    };

    setTicketTypes(
      ticketTypes.map(ticket =>
        ticket.id === ticketId
          // Use 'addonOptions' when updating the array
          ? { ...ticket, addonOptions: [...ticket.addonOptions, newAddOn] }
          : ticket
      )
    );
  };

  // Remove an add-on option
  const removeAddOn = (ticketId: string, addOnId: string) => {
    setTicketTypes(
      ticketTypes.map(ticket =>
        ticket.id === ticketId
          // Use 'addonOptions' when filtering the array
          ? { ...ticket, addonOptions: ticket.addonOptions.filter(addon => addon.id !== addOnId) }
          : ticket
      )
    );
  };

  // Update an add-on option field
  const updateAddOn = (ticketId: string, addOnId: string, field: keyof AddOnOption, value: string | number) => {
    setTicketTypes(
      ticketTypes.map(ticket =>
        ticket.id === ticketId
          ? {
              ...ticket,
              // Use 'addonOptions' when mapping through add-ons
              addonOptions: ticket.addonOptions.map(addon =>
                addon.id === addOnId ? { ...addon, [field]: value } : addon
              )
            }
          : ticket
      )
    );
  };

   // Navigate to the next screen
   const goToNextStep = () => {
       // Optional: Add validation here to ensure required fields are filled
       // before navigating.
       console.log("Navigating to /qr with data:", ticketTypes); // Log data before navigating
       // In a real app, you might save `ticketTypes` here (e.g., AsyncStorage, API call)
       // You could also pass data via router params if needed, e.g.:
       // router.push({ pathname: '/qr', params: { ticketData: JSON.stringify(ticketTypes) } });
       router.push('/qr');
   };


  // --- Sub-Components ---

  // Component for rendering Add-On forms
  // Use 'addonOptions' prop
  const AddOnForm = ({ ticketId, addonOptions }: { ticketId: string, addonOptions: AddOnOption[] }) => (
    <View style={styles.addOnsContainer}>
      <Text style={styles.addOnsTitle}>Add-On Options</Text>

      {/* Map over 'addonOptions' */}
      {addonOptions.map((addOn) => (
        <View key={addOn.id} style={styles.addOnFormSection}>
          <View style={styles.formHeader}>
            <Text style={styles.formSubtitle}>Add-On</Text>
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => removeAddOn(ticketId, addOn.id)}
            >
              <Ionicons name="close-circle" size={20} color="#FF6B6B" />
            </TouchableOpacity>
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Enter add-on name</Text>
            <TextInput
              style={styles.textInput}
              value={addOn.label} // Use 'label' from AddOnOption
              // Update the 'label' field
              onChangeText={(text) => updateAddOn(ticketId, addOn.id, 'label', text)}
              placeholder="e.g. VIP Access"
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Price</Text>
            <TextInput
              style={styles.textInput}
              value={addOn.price === 0 ? '' : addOn.price.toString()} // Handle 0 price display
              onChangeText={(text) => {
                // Ensure only numbers are parsed, default to 0
                const price = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
                updateAddOn(ticketId, addOn.id, 'price', price);
              }}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>Enter description</Text>
            <TextInput
              style={styles.textAreaInput}
              value={addOn.description} // Use 'description' from AddOnOption
              // Update the 'description' field
              onChangeText={(text) => updateAddOn(ticketId, addOn.id, 'description', text)}
              placeholder="e.g. Backstage access with meet and greet"
              multiline={true}
              numberOfLines={2}
              textAlignVertical="top"
            />
          </View>
        </View>
      ))}

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => addNewAddOn(ticketId)}
      >
        <Ionicons name="add-circle" size={20} color="#6A5ACD" />
        <Text style={styles.addButtonText}>Add Another Add-On</Text>
      </TouchableOpacity>
    </View>
  );

  // Component for rendering a single Ticket Type form
  const renderTicketForm = ({ item }: { item: TicketType }) => (
    <View style={styles.formSection}>
      {/* Header with Remove Button */}
      <View style={styles.formHeader}>
        <Text style={styles.formTitle}>Ticket Type</Text>
        {ticketTypes.length > 1 && ( // Only show remove if more than one ticket type exists
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeTicketType(item.id)}
          >
            <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
          </TouchableOpacity>
        )}
      </View>

      {/* Ticket Type Label Input */}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Ticket Label *</Text>
        <TextInput
          style={styles.textInput}
          value={item.label} // Use 'label' from TicketType
          // Update the 'label' field
          onChangeText={(text) => updateTicketType(item.id, 'label', text)}
          placeholder="e.g. General Admission, VIP"
        />
      </View>

      {/* Quantity and Price Row */}
      <View style={styles.rowContainer}>
        <View style={styles.halfInputContainer}>
          <Text style={styles.inputLabel}>Max Quantity *</Text>
          <TextInput
            style={styles.textInput}
            // Use 'maxQuantity' from TicketType
            value={item.maxQuantity === 0 ? '' : item.maxQuantity.toString()} // Handle 0 display
            onChangeText={(text) => {
              // Ensure only numbers are parsed, default to 0
              const quantity = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
              // Update the 'maxQuantity' field
              updateTicketType(item.id, 'maxQuantity', quantity);
            }}
            keyboardType="numeric"
            placeholder="100"
          />
        </View>

        <View style={styles.halfInputContainer}>
          <Text style={styles.inputLabel}>Price ($) *</Text>
          <TextInput
            style={styles.textInput}
            value={item.price === 0 ? '' : item.price.toString()} // Use 'price' from TicketType
            onChangeText={(text) => {
              // Ensure only numbers are parsed, default to 0
              const price = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0;
              // Update the 'price' field
              updateTicketType(item.id, 'price', price);
            }}
            keyboardType="numeric"
            placeholder="50"
          />
        </View>
      </View>

      {/* Description Input */}
      <View style={styles.inputRow}>
        <Text style={styles.inputLabel}>Description</Text>
        <TextInput
          style={styles.textAreaInput}
          value={item.description} // Use 'description' from TicketType
          // Update the 'description' field
          onChangeText={(text) => updateTicketType(item.id, 'description', text)}
          placeholder="e.g. Includes access to main event areas. Seating not guaranteed."
          multiline={true}
          numberOfLines={3}
          textAlignVertical="top"
        />
      </View>

      {/* Add-On Options Component */}
      {/* Pass 'addonOptions' prop */}
      <AddOnForm ticketId={item.id} addonOptions={item.addonOptions} />
    </View>
  );

  // --- Main Return ---
  return (
    <View style={styles.container}>
       {/* Use ScrollView instead of FlatList if performance is not critical
           and you need more flexibility with content around the list */}
       {/* <ScrollView
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled" // Good for forms
      >
        {ticketTypes.map(item => renderTicketForm({ item }))}
      </ScrollView> */}

       {/* FlatList is generally better for long lists */}
      <FlatList
        data={ticketTypes}
        renderItem={renderTicketForm}
        keyExtractor={(item) => item.id}
        style={styles.listContainer}
        contentContainerStyle={styles.listContentContainer}
        showsVerticalScrollIndicator={true}
        keyboardShouldPersistTaps="handled" // Good for forms
      />

      {/* Floating button to add new ticket types */}
      <TouchableOpacity
        style={styles.floatingAddButton}
        onPress={addNewTicketType}
      >
        <Ionicons name="add" size={24} color="#ffffff" />
        <Text style={styles.floatingAddButtonText}>Add Type</Text>
      </TouchableOpacity>

      {/* Action button container at the bottom */}
       <View style={styles.bottomActionContainer}>
           <TouchableOpacity
               style={styles.nextButton}
               onPress={goToNextStep}
           >
               <Text style={styles.nextButtonText}>Next</Text>
               <Ionicons name="arrow-forward" size={20} color="#ffffff" />
           </TouchableOpacity>
       </View>

    </View>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    // paddingTop: 10, // Reduced top padding
    backgroundColor: '#F8F9FA', // Lighter background
  },
  listContainer: {
    flex: 1,
    width: '100%',
    // paddingHorizontal: 0, // Let formSection handle horizontal padding
  },
  listContentContainer: {
     paddingTop: 16, // Add padding at the top of the list
     paddingHorizontal: 12, // Horizontal padding for list items
     paddingBottom: 100, // Ensure space for floating button and next button
  },
  formSection: {
    padding: 16,
    borderWidth: 1,
    borderColor: '#DEE2E6', // Lighter border
    borderRadius: 8,      // Slightly smaller radius
    backgroundColor: '#ffffff',
    // Removed position: 'relative' as it wasn't necessary here
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 }, // Subtle shadow
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,        // Subtle elevation
    marginBottom: 16,
  },
  formHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16, // More space after header
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  formTitle: {
    fontSize: 17, // Slightly smaller
    fontWeight: '600',
    color: '#212529', // Darker text
  },
  removeButton: {
    padding: 6, // Slightly larger tap area
    borderRadius: 15, // Make it circular
    backgroundColor: '#FFF0F0', // Light red background hint
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  halfInputContainer: {
    width: '48%', // Keep as is
  },
  inputRow: {
    marginBottom: 16, // More space between rows
  },
  inputLabel: {
    fontSize: 14,
    color: '#495057', // Medium gray
    marginBottom: 6,   // More space below label
    fontWeight: '500',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CED4DA', // Standard border color
    borderRadius: 6,      // Consistent radius
    paddingVertical: 10,  // Adjust padding
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF', // White background
    color: '#212529',
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 15,
    backgroundColor: '#FFFFFF',
    minHeight: 80, // Use minHeight
    textAlignVertical: 'top',
    color: '#212529',
  },
  floatingAddButton: {
    position: 'absolute',
    right: 20,
    bottom: 85, // Position above the bottom action container
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6A5ACD', // Keep color
    flexDirection: 'row', // Align icon and text
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15, // Add padding for text
    elevation: 5, // Slightly more pronounced elevation
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    zIndex: 100,
  },
   floatingAddButtonText: {
      color: '#ffffff',
      marginLeft: 8,
      fontWeight: '600',
      fontSize: 14,
   },
  // Renamed from actionsContainer
  bottomActionContainer: {
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 16,
    paddingBottom: 20, // Add safe area padding if needed
    backgroundColor: '#FFFFFF', // White background for the bar
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF', // Light border separator
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'flex-end', // Align button to the right
  },
  // Styles for the Next button
  nextButton: {
      backgroundColor: '#6A5ACD',
      paddingVertical: 12,
      paddingHorizontal: 25,
      borderRadius: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
  },
  nextButtonText: {
      color: '#ffffff',
      fontSize: 16,
      fontWeight: '600',
      marginRight: 8,
  },
  // Add-on specific styles
  addOnsContainer: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E9ECEF',
    paddingTop: 16,
  },
  addOnsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 12,
  },
  addOnFormSection: {
    backgroundColor: '#F8F9FA', // Light background for contrast
    borderRadius: 6,
    padding: 12,
    marginBottom: 12, // Space between add-ons
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  formSubtitle: {
    fontSize: 15,
    fontWeight: '600', // Make add-on subtitle slightly bolder
    color: '#495057',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    // justifyContent: 'center', // Removed to align left
    paddingVertical: 10,
    marginTop: 6,
    // backgroundColor: '#E9E7FD', // Light purple background
    borderRadius: 6,
    // paddingHorizontal: 12, // Padding if background is used
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6A5ACD',
    fontWeight: '600', // Bolder add button text
  }
});

export default TicketTypeForm;