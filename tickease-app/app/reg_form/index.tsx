import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

// --- Demo Data (as provided) ---
const initialQuestionSets = [
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
  ];


const QuestionSelector = () => {
  // Use the initial demo data
  const [questionSets, setQuestionSets] = useState(initialQuestionSets);
  const [expandedSet, setExpandedSet] = useState(null); // Track which set is expanded

  // Toggle selection of an optional question set
  const toggleQuestionSet = (id:any) => {
    setQuestionSets(currentSets =>
      currentSets.map(set =>
        set.id === id && !set.mandatory ? { ...set, selected: !set.selected } : set
      )
    );
  };

  // Handle dropdown toggle
  const toggleExpand = (id:any) => {
    setExpandedSet(currentExpandedId => (currentExpandedId === id ? null : id));
  };

  // --- NEW: Function to render summary with highlighted fields ---
  interface RenderSummaryProps {
    summary: string;
    fields: string[];
  }

  const renderSummaryWithHighlights = ({ summary, fields }: RenderSummaryProps) => {
    if (!summary || !fields || fields.length === 0) {
      return <Text style={styles.summary}>{summary}</Text>;
    }

    // Create a regex that matches any of the field names (case-insensitive)
    // Escape special regex characters in field names if necessary (basic example assumes simple names)
    const escapedFields = fields.map((f: string) => f.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const regex = new RegExp(`(${escapedFields.join('|')})`, 'gi');

    // Split the summary by the regex. Capturing group keeps delimiters in the result.
    const parts = summary.split(regex);

    return (
      <Text style={styles.summary}>
        {parts
          .map((part: string, index: number) => {
            // Check if this part is one of the fields (case-insensitive)
            const isHighlight = fields.some((field: string) => field.toLowerCase() === part?.toLowerCase());
            if (isHighlight) {
              return (
                <Text key={`${part}-${index}`} style={styles.highlightedText}>
                  {part}
                </Text>
              );
            } else {
              return part; // Render normal text part
            }
          })
          .filter(Boolean)} {/* Filter out potential empty strings from split */}
      </Text>
    );
  };

  // --- NEW: Handler for the Next button ---
  const handleNext = () => {
    const selectedSets = questionSets
      .filter(set => set.selected)
      .map(set => ({ id: set.id, title: set.title, fields: set.fields })); // Extract desired info

    console.log("Selected Question Sets:", JSON.stringify(selectedSets, null, 2));
    // Add navigation logic or further actions here
    router.push('/price_form'); // Example navigation to the next page
  };


  return (
    <View style={styles.outerContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Select the questions you want to ask</Text>

        {questionSets.map((set) => (
          <View key={set.id} style={styles.questionSetContainer}>
            {/* --- Header Section --- */}
            <View style={styles.questionSetHeader}>
              {/* Toggle Button (+/-) */}
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  set.selected && styles.activeToggleButton,
                  set.mandatory && styles.disabledToggleButton // Style for mandatory
                ]}
                onPress={() => toggleQuestionSet(set.id)}
                disabled={set.mandatory} // Disable button if mandatory
                activeOpacity={set.mandatory ? 1 : 0.7} // Reduce opacity feedback if disabled
              >
                <Ionicons
                  name={set.selected ? "remove-outline" : "add-outline"} // Use icons
                  size={20} // Slightly smaller icon
                  color={set.selected ? '#fff' : '#3b82f6'}
                />
              </TouchableOpacity>

              {/* Title Area (Clickable to expand) */}
              <TouchableOpacity
                style={styles.titleContainer}
                onPress={() => toggleExpand(set.id)}
                activeOpacity={0.8}
              >
                <Text style={styles.title}>{set.title}</Text>
              </TouchableOpacity>

              {/* Expand/Collapse Arrow Button */}
              <TouchableOpacity
                style={styles.expandButton}
                onPress={() => toggleExpand(set.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={expandedSet === set.id ? "chevron-up-outline" : "chevron-down-outline"}
                  size={24}
                  color="#3b82f6"
                />
              </TouchableOpacity>
            </View>

            {/* --- Expanded Details Section --- */}
            {expandedSet === set.id && (
              <View style={styles.detailsContainer}>
                {/* Render summary with highlights */}
                {renderSummaryWithHighlights({ summary: set.summary, fields: set.fields })}
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* --- Next Button --- */}
      <View style={styles.footer}>
         <TouchableOpacity
            style={styles.nextButton}
            onPress={handleNext}
            activeOpacity={0.8}
          >
            <Text style={styles.nextButtonText}>Next</Text>
            <Ionicons name="arrow-forward-outline" size={20} color="#fff" style={styles.nextButtonIcon}/>
         </TouchableOpacity>
      </View>
    </View>
  );
};

// --- Styles --- (Refined for better alignment and appearance)
const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f8fafc', // Light gray background
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 100, // Extra padding at bottom so content doesn't hide behind footer
  },
  pageTitle: {
    fontSize: 22, // Slightly larger title
    fontWeight: 'bold', // Bolder
    marginBottom: 24, // More space below title
    color: '#1e293b', // Dark slate color
    textAlign: 'left',
  },
  questionSetContainer: {
    marginBottom: 16, // Consistent spacing between items
    borderRadius: 12, // Slightly more rounded corners
    backgroundColor: '#fff', // White background for cards
    borderWidth: 1,
    borderColor: '#e2e8f0', // Light border color
    // Subtle shadow for depth
    shadowColor: '#94a3b8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden', // Ensures border radius is applied correctly
  },
  questionSetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 16,
  },
  toggleButton: {
    width: 36, // Slightly smaller button
    height: 36,
    borderRadius: 18, // Keep it circular
    borderWidth: 2,
    borderColor: '#3b82f6', // Blue border
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12, // Space between button and title
    backgroundColor: '#fff',
  },
  activeToggleButton: {
    backgroundColor: '#3b82f6', // Blue background when active
    borderColor: '#3b82f6',
  },
  disabledToggleButton: {
    backgroundColor: '#e2e8f0', // Gray background when mandatory/disabled
    borderColor: '#cbd5e1', // Lighter gray border
    opacity: 0.8, // Indicate disabled state
  },
  // Removed toggleButtonText styles as icons are now used

  titleContainer: {
    flex: 1, // Takes up remaining space
    justifyContent: 'center', // Center title vertically if needed
  },
  title: {
    fontSize: 16, // Good title size
    fontWeight: '600', // Semi-bold
    color: '#334155', // Darker text color
  },
  expandButton: {
    padding: 8, // Make the touch area slightly larger
    marginLeft: 8, // Space between title and arrow
  },
  detailsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16, // Padding below the summary
    paddingTop: 8, // Reduced padding top as it follows header
    backgroundColor: '#f8fafc', // Slightly different background for details
    borderTopWidth: 1, // Separator line
    borderTopColor: '#f1f5f9', // Light separator color
  },
  // Description style removed as it wasn't in the data/requirements
  summary: {
    fontSize: 14,
    color: '#475569', // Standard text color
    lineHeight: 21, // Improve readability
  },
  highlightedText: {
    fontWeight: 'bold', // Make highlighted fields bold
    color: '#2563eb', // Slightly darker blue for highlight
    backgroundColor: '#dbeafe', // Very light blue background for subtle emphasis
    paddingHorizontal: 2, // Add slight horizontal padding
    borderRadius: 3, // Slightly rounded highlight background
  },
  footer: {
    padding: 16,
    paddingBottom: Platform.OS === 'ios' ? 32 : 16, // Extra padding for iOS home indicator
    backgroundColor: '#f8fafc', // Match background
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0', // Separator line
  },
  nextButton: {
    backgroundColor: '#3b82f6', // Consistent blue color
    paddingVertical: 14, // Comfortable height
    borderRadius: 10, // Rounded corners
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row', // Align text and icon
     // Shadow for the button
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  nextButtonText: {
    color: '#fff', // White text
    fontSize: 16,
    fontWeight: 'bold', // Bold text
  },
   nextButtonIcon: {
     marginLeft: 8, // Space icon from text
   },
});

export default QuestionSelector;