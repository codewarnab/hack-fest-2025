import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Alert
} from 'react-native';
import { router } from 'expo-router';

export default function CreateEvent() {
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [bannerSelected, setBannerSelected] = useState(false);
  
  // Ticket data
  const [totalTickets, setTotalTickets] = useState('');
  const [vipTickets, setVipTickets] = useState('');
  const [generalTickets, setGeneralTickets] = useState('');
  const [vipPrice, setVipPrice] = useState('');
  const [generalPrice, setGeneralPrice] = useState('');
  
  const [loading, setLoading] = useState(false);

  const pickImage = () => {
    // Simplified image selection to avoid ImagePicker dependency issues
    setBannerSelected(true);
    Alert.alert('Image Selection', 'Banner would be selected here');
  };

  const handleSubmit = () => {
    // Validate inputs
    if (!eventTitle.trim()) {
      Alert.alert('Missing Information', 'Please enter an event title');
      return;
    }
    
    if (!eventDescription.trim()) {
      Alert.alert('Missing Information', 'Please enter an event description');
      return;
    }
    
   
    
  
    
    setLoading(true);
    
    // Here you would normally submit the data to your backend
    setTimeout(() => {
      setLoading(false);
        router.push('/landing_form2'); // Navigate to the next step
    }, 1500);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Create New Event</Text>
        <Text style={styles.headerSubtitle}>Fill in the details to create your event</Text>
      </View>
      
      <View style={styles.formContainer}>
        <TouchableOpacity 
          style={styles.bannerContainer} 
          onPress={pickImage}
        >
          {bannerSelected ? (
            <View style={styles.selectedBannerPlaceholder}>
              <Text style={styles.bannerPlaceholderText}>Banner Selected</Text>
            </View>
          ) : (
            <View style={styles.addBannerContent}>
              <Text style={styles.addBannerIcon}>+</Text>
              <Text style={styles.addBannerText}>ADD THUMBNAIL</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <Text style={styles.inputLabel}>Event Title</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            onChangeText={setEventTitle}
            value={eventTitle}
            placeholder="Enter Event Title"
          />
        </View>
        
        <Text style={styles.inputLabel}>Event Description</Text>
        <View style={[styles.inputContainer, styles.textAreaContainer]}>
          <TextInput
            style={[styles.input, styles.textArea]}
            onChangeText={setEventDescription}
            value={eventDescription}
            placeholder="Enter Event Description"
            multiline
            numberOfLines={4}
          />
        </View>
        
      
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.cancelButton]}
          onPress={() => {
            try {
              router.back();
            } catch (error) {
              console.error('Navigation error:', error);
              Alert.alert('Navigation Error', 'Could not go back');
            }
          }}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.saveButton, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.saveButtonText}>
            {loading ? 'saving...' : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EBF0FF',
    padding: 24,
  },
  headerContainer: {
    marginTop: 48,
    marginBottom: 32,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 18,
    color: '#666',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 16,
  },
  bannerContainer: {
    height: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DDD',
    marginBottom: 20,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBannerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBannerIcon: {
    fontSize: 40,
    color: '#6366F1',
  },
  addBannerText: {
    marginTop: 8,
    color: '#6366F1',
    fontWeight: '500',
  },
  selectedBannerPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e0e0ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerPlaceholderText: {
    fontSize: 18,
    color: '#6366F1',
    fontWeight: '500',
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#444',
    marginBottom: 8,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  textAreaContainer: {
    minHeight: 100,
  },
  textArea: {
    textAlignVertical: 'top',
  },
  ticketContainer: {
    padding: 16,
  },
  ticketInfoHeader: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6366F1',
    marginBottom: 12,
  },
  ticketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ticketLabel: {
    fontSize: 14,
    color: '#666',
    flex: 2,
  },
  ticketInput: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#6366F1',
    marginLeft: 8,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.7,
  },
});