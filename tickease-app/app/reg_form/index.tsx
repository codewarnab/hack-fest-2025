import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const QuestionSelector = () => {
  // Initial state with first two options mandatory
  const [questionSets, setQuestionSets] = useState([
    { 
      id: 1, 
      title: 'Personal Information',
      summary: 'Basic contact information including your name, email address, and phone number to help us reach you.',
      selected: true, 
      mandatory: true,
      fields: ['Name', 'Email address', 'Phone number']
    },
    { 
      id: 2, 
      title: 'Location Details', 
      summary: 'Your complete address information including street address, city, state, postal code and country to identify your location.',
      selected: true, 
      mandatory: true,
      fields: ['Address', 'City', 'State', 'Postal code', 'Country'] 
    },
    { 
      id: 3, 
      title: 'Demographics', 
      summary: 'Optional personal demographic information including birth date, gender, occupation, organization, and your interests to help us customize our services.',
      selected: false, 
      mandatory: false,
      fields: ['Date of birth', 'Gender', 'Occupation', 'Company/Organization Name', 'Interests']
    },
    { 
      id: 4, 
      title: 'Special requirements or preferences', 
      summary: 'Information about any dietary restrictions, accessibility needs, or other special requirements to ensure we can accommodate your specific needs.',
      selected: false, 
      mandatory: false,
      fields: ['Dietary restrictions', 'Accessibility needs', 'Special requirements']
    },
    { 
      id: 5, 
      title: 'Final Information', 
      summary: 'Details about how you found us, marketing preferences, and consent to our terms and conditions to complete your profile.',
      selected: false, 
      mandatory: false,
      fields: ['Where did you hear about us?', 'Marketing emails consent', 'Agreement to terms and conditions']
    }
  ]);

  // Toggle selection of a question set
  const toggleQuestionSet = (id:any) => {
    setQuestionSets(questionSets.map(set => 
      set.id === id && !set.mandatory ? { ...set, selected: !set.selected } : set
    ));
  };

  // Handle dropdown toggle
  const [expandedSet, setExpandedSet] = useState(null);
  
  const toggleExpand = (id:any) => {
    setExpandedSet(expandedSet === id ? null : id);
  };

  // Fixed function to render text with highlighted important words
  const renderHighlightedText = (text:any) => {
    if (!text) return null;
    
    // Split by asterisks to find highlighted words (words inside *)
    const parts = text.split(/(\[^]+\*)/g);
    
    return (
      <>
        {parts.map((part: string, index: number) => {
          // Check if this part is surrounded by asterisks
          const isHighlighted: boolean = part.startsWith('') && part.endsWith('');
          
          // Remove the asterisks from highlighted parts
          const displayText: string = isHighlighted ? part.slice(1, -1) : part;
          
          return (
        <Text
          key={index}
          style={isHighlighted ? styles.highlightedText : null}
        >
          {displayText}
        </Text>
          );
        })}
      </>
    );
  };

  return (
    <ScrollView style={styles.scrollView}>
      <View style={styles.container}>
        <Text style={styles.pageTitle}>Select the questions you want to ask user</Text>
        
        {questionSets.map((set) => (
          <View 
            key={set.id} 
            style={[
              styles.questionSetContainer,
              !set.mandatory && styles.nonMandatoryContainer
            ]}
          >
            <View style={styles.questionSetHeader}>
              {/* Title area - clickable to expand/collapse */}
              <TouchableOpacity 
                style={styles.titleContainer}
                onPress={() => toggleExpand(set.id)}
                activeOpacity={0.7}
              >
                <Text 
                  style={[
                    styles.title,
                    !set.mandatory && styles.nonMandatoryTitle
                  ]}
                >
                  {`${set.id}. ${set.title}`}
                </Text>
              </TouchableOpacity>
              
              {/* Plus/Minus button */}
              <TouchableOpacity 
                style={[
                  styles.toggleButton, 
                  set.selected && styles.activeToggleButton,
                  set.mandatory && styles.disabledToggleButton
                ]}
                onPress={() => !set.mandatory && toggleQuestionSet(set.id)}
                disabled={set.mandatory}
                activeOpacity={set.mandatory ? 1 : 0.7}
              >
                <Text style={[
                  styles.toggleButtonText,
                  set.selected && styles.activeToggleButtonText
                ]}>
                  {set.selected ? '-' : '+'}
                </Text>
              </TouchableOpacity>
              
              {/* Arrow button */}
              <TouchableOpacity 
                style={styles.expandButton}
                onPress={() => toggleExpand(set.id)}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name={expandedSet === set.id ? "chevron-up" : "chevron-down"} 
                  size={24} 
                  color="#3b82f6" 
                />
              </TouchableOpacity>
            </View>
            
            {expandedSet === set.id && (
              <View style={styles.detailsContainer}>
                <Text style={styles.summary}>
                  {renderHighlightedText(set.summary)}
                </Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#f8fafc',
    marginTop: 40,
  },
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8fafc',
  },
  pageTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1e293b',
    textAlign: 'left',
  },
  questionSetContainer: {
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  nonMandatoryContainer: {
    borderColor: '#93c5fd',  // Light blue border
    shadowColor: '#3b82f6',  // Blue shadow
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  questionSetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  titleContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    color: '#334155',
  },
  nonMandatoryTitle: {
    color: '#2563eb',  // Slightly darker blue for non-mandatory titles
  },
  toggleButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    backgroundColor: '#fff',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  activeToggleButton: {
    backgroundColor: '#3b82f6',
  },
  disabledToggleButton: {
    opacity: 0.5,
    borderColor: '#94a3b8',
  },
  toggleButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    textAlign: 'center',
  },
  activeToggleButtonText: {
    color: '#fff',
  },
  expandButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  detailsContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    backgroundColor: '#f8fafc',
  },
  summary: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
  },
  highlightedText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default QuestionSelector;