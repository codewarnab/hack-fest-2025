import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { getTotalTicketBought } from '@/utils/getevent';
import { getTotalRevenue } from '@/utils/getevent';
// --- Dummy Data ---
// Enhanced dummy data for a richer overview
const dummyEventData = {
  id: 'hackfest-2025',
  name: 'SynthWave Hack Fest 2025', // More engaging name
  tagline: 'Innovate. Collaborate. Create.', // Added tagline
  bannerImage: 'https://images.unsplash.com/photo-1519671482749-fd09be7acce1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Changed image
  date: 'April 15-17, 2025',
  time: '9:00 AM PST onwards',
  location: 'CyberTech Convention Hub',
  address: '1 Infinite Loop, Cupertino, CA',
  organizer: 'QuantumLeap Events',
  status: 'Upcoming',
  // Use eventId from URL params
  totalCapacity: 350,
  attendeesRegistered: 178, // Match sold tickets for now
  checkIns: 0, // Event hasn't started
  ticketsBreakdown: [
    { type: 'Early Bird', sold: 100, capacity: 100, color: '#3b82f6' }, // Blue
    { type: 'Regular', sold: 78, capacity: 200, color: '#10b981' },   // Emerald
    { type: 'VIP', sold: 0, capacity: 50, color: '#a855f7' },      // Purple
  ],
  recentActivity: [ // Example recent activities
    { type: 'Ticket Sale', user: 'Alex Johnson', time: '5m ago', details: 'Regular Ticket x1' },
    { type: 'Check-in Update', user: 'System', time: '1h ago', details: 'Check-in system activated' },
    { type: 'Ticket Sale', user: 'Maria Garcia', time: '3h ago', details: 'Early Bird Ticket x2' },
  ],
  website: 'https://hackfest2025.example.com' // Added website link
};

// --- Reusable UI Components ---

// Insight Block: Small, focused piece of data
const InsightBlock = ({ iconName, value, label, iconColor = '#64748B' }: {
  iconName: keyof typeof Ionicons.glyphMap;
  value: string | number;
  label: string;
  iconColor?: string;
}) => (
  <View style={styles.insightBlock}>
    <Ionicons name={iconName} size={20} color={iconColor} style={styles.insightIcon} />
    <View>
      <Text style={styles.insightValue}>{value}</Text>
      <Text style={styles.insightLabel}>{label}</Text>
    </View>
  </View>
);

// Section Header with optional "View Details" link
const SectionHeader = ({ title, linkHref, linkText = 'View Details' }: {
  title: string;
  linkHref?: string;
  linkText?: string;
}) => {
  const router = useRouter();
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {linkHref && (
        <TouchableOpacity onPress={() => router.push(linkHref as `/overview/${string}`)} activeOpacity={0.7}>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>{linkText}</Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#6366F1" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Ticket Breakdown Mini Bar Chart Component
const TicketTypeBreakdownChart = ({ data }: { data: typeof dummyEventData.ticketsBreakdown }) => {
  const maxValue = Math.max(...data.map(item => item.sold), 1); // Avoid division by zero

  return (
    <View style={styles.chartContainer}>
      {data.map((item) => (
        <View key={item.type} style={styles.barWrapper}>
          <View style={styles.barLabelContainer}>
             <View style={[styles.barColorIndicator, {backgroundColor: item.color || '#ccc'}]} />
             <Text style={styles.barLabel}>{item.type}</Text>
          </View>
          <View style={styles.barBackground}>
            <View style={[
              styles.barForeground,
              { width: `${(item.sold / maxValue) * 100}%`, backgroundColor: item.color || '#6366F1' }
            ]}/>
          </View>
          <Text style={styles.barValue}>{item.sold} sold</Text>
        </View>
      ))}
    </View>
  );
};

// --- Main Component ---

const EventOverviewPage = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ event_id?: string }>();
  const eventId = params.event_id || dummyEventData.id;
  const [totalTicketsSold, setTotalTicketsSold] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const eventData = dummyEventData; // Use dummy data
  
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const tickets = await getTotalTicketBought(eventId);
        setTotalTicketsSold(tickets || 0);
      } catch (error) {
        console.error("Error fetching tickets:", error);
        setTotalTicketsSold(0);
      }
    };
    
    const fetchRevenue = async () => {
      try {
        const revenue = await getTotalRevenue(eventId);
        setTotalRevenue(revenue || 0);
      } catch (error) {
        console.error("Error fetching revenue:", error);
        setTotalRevenue(0);
      }
    };
    
    fetchTickets();
    fetchRevenue();
  }, [eventId]);
  const eventName = eventData.name || 'Event Overview';

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const calculateCheckinProgress = (): number => {
         if (!eventData.attendeesRegistered || eventData.attendeesRegistered === 0) return 0;
         return Math.min((eventData.checkIns / eventData.attendeesRegistered) * 100, 100);
     }
     const checkinProgress = calculateCheckinProgress();
  
  const calculateTicketProgress = (): number => {
         if (!eventData.totalCapacity || eventData.totalCapacity === 0) return 0;
         // Ensure totalTicketsSold is a number
         const ticketsSold = Number(totalTicketsSold) || 0;
         return Math.min((ticketsSold / eventData.totalCapacity) * 100, 100);
     }


  return (
    <>
      {/* Header Configuration */}
      <Stack.Screen options={{
        title: '', // Hide default title, we'll show it below banner
        headerTransparent: true, // Make header transparent
        headerTintColor: '#FFFFFF', // Color for back button
        headerBackVisible: false,
      }}/>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: eventData.bannerImage }}
            style={[styles.bannerImage, { width }]}
            resizeMode="cover"
          />
          <View style={styles.bannerOverlay} />
          {/* Back Button (positioned absolutely) */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 5 }]} // Position lower
            onPress={() => router.back()}
            activeOpacity={0.8}
          >
             {/* Changed icon and background */}
            <View style={styles.backButtonCircle}>
                 <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>

          {/* Event Title & Basic Info Card */}
          <View style={[styles.card, styles.titleCard]}>
             <Text style={styles.eventName}>{eventName}</Text>
             {eventData.tagline && <Text style={styles.eventTagline}>{eventData.tagline}</Text>}
             <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color="#64748B" />
                <Text style={styles.infoText}>{eventData.date}</Text>
             </View>
              <View style={styles.infoRow}>
                <Ionicons name="time-outline" size={16} color="#64748B" />
                <Text style={styles.infoText}>{eventData.time}</Text>
             </View>
             <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color="#64748B" />
                <Text style={styles.infoText}>{eventData.location}</Text>
             </View>
             <View style={[styles.statusBadge, eventData.status === 'Completed' ? styles.statusCompleted : styles.statusUpcoming]}>
              <View style={[styles.statusDot, eventData.status === 'Completed' ? styles.dotCompleted : styles.dotUpcoming]}/>
              <Text style={[styles.statusText, eventData.status === 'Completed' ? styles.textCompleted : styles.textUpcoming]}>
                {eventData.status}
              </Text>
            </View>
          </View>

          {/* At a Glance Section */}
          <View style={[styles.card, styles.quickGlanceCard]}>
              <SectionHeader title="At a Glance" />
              <View style={styles.insightsGrid}>
                <InsightBlock iconName="ticket-outline" value={totalTicketsSold} label="Tickets Sold" iconColor="#3b82f6"/>
                 <InsightBlock iconName="people-outline" value={eventData.attendeesRegistered} label="Registered" iconColor="#a855f7"/>
                <InsightBlock iconName="cash-outline" value={formatCurrency(totalRevenue)} label="Est. Revenue" iconColor="#10b981"/>
                 <InsightBlock iconName="log-in-outline" value={`${eventData.checkIns} / ${eventData.attendeesRegistered}`} label="Checked In" iconColor="#f59e0b"/>
              </View>
           </View>

          {/* Ticketing Section */}
          <View style={styles.card}>
            <SectionHeader title="Ticketing" linkHref={`/manage-tickets/${eventId}`} />
            <Text style={styles.sectionSubtitle}>Sales breakdown by ticket type.</Text>
            <TicketTypeBreakdownChart data={eventData.ticketsBreakdown} />
             {/* Progress Bar */}
             <View style={styles.progressContainer}>
                 <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Overall Capacity</Text>
                    <Text style={styles.progressPercentage}>{`${totalTicketsSold}/${eventData.totalCapacity}`}</Text>
                 </View>
                 <View style={styles.progressBarBackground}>
                    <View style={[styles.progressBarForeground, { width: `${calculateTicketProgress()}%` }]} />
                 </View>
            </View>
          </View>

           {/* Attendee Section */}
          <View style={styles.card}>
             <SectionHeader title="Attendees" linkHref={`/attendees/${eventId}`} />
              <Text style={styles.sectionSubtitle}>Registration and check-in status.</Text>
               <View style={styles.attendeeStatsRow}>
                  <View style={styles.attendeeStatItem}>
                      <Text style={styles.attendeeStatValue}>{eventData.attendeesRegistered}</Text>
                      <Text style={styles.attendeeStatLabel}>Registered</Text>
                  </View>
                  <View style={styles.attendeeStatItem}>
                       <Text style={styles.attendeeStatValue}>{eventData.checkIns}</Text>
                      <Text style={styles.attendeeStatLabel}>Checked-In</Text>
                  </View>
                  <View style={styles.attendeeStatItem}>
                       <Text style={styles.attendeeStatValue}>{checkinProgress.toFixed(0)}%</Text>
                      <Text style={styles.attendeeStatLabel}>Check-in Rate</Text>
                  </View>
              </View>
              {/* Could add a small list of recent registrations here */}
           </View>

          {/* Management Tools Section */}
            <View style={styles.actionsSection}>
            
             <SectionHeader title="Management Tools" />
             <TouchableOpacity
              style={styles.actionCard}
              onPress={() => router.push(`/analytics/${eventId}`)} // Navigate to detailed analytics page
             >
               <View style={[styles.actionIconContainer, { backgroundColor: '#ef4444' }]}>
               <Ionicons name="analytics-sharp" size={20} color="#FFFFFF" />
               </View>
               <Text style={styles.actionLabel}>Detailed Analytics</Text>
               <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" style={styles.actionChevron} />
             </TouchableOpacity>
        
             <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#ab62ff' }]} // Purple-500
              onPress={() => router.push(`/promote/${eventId}`)}
             >
              <Ionicons name="megaphone-outline" size={20} color="#FFFFFF" style={styles.actionIconContainer} />
              <Text style={styles.actionLabel}>Promotion & Sharing</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" style={styles.actionChevron} />
             </TouchableOpacity>
             <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: '#684adf' }]} // Slate-500
              onPress={() => router.push(`/settings/${eventId}`)}
             >
              <Ionicons name="settings-outline" size={20} color="#FFFFFF" style={styles.actionIconContainer} />
              <Text style={styles.actionLabel}>Event Settings</Text>
              <Ionicons name="chevron-forward-outline" size={20} color="#9CA3AF" style={styles.actionChevron} />
             </TouchableOpacity>
            </View>

          {/* QR Code Section */}
          <View style={[styles.card, styles.qrSection]}>
            <SectionHeader title="Quick Share Link" />
            <View style={styles.qrContainer}>
              <QRCode
                value={eventData.website || `https://yourapp.com/event/${eventData.id}`} // Link to event website or public page
                size={width * 0.35} // Adjusted size
                color="#111827" // Almost black
                backgroundColor="#FFFFFF"
                logo={require('../../../assets/images/icon.png')} // Make sure this path is correct
                logoSize={25}
                logoBackgroundColor='transparent'
                logoMargin={4} // Margin around logo
              />
            </View>
            <Text style={styles.qrHelp}>Share this code or the event link</Text>
             <TouchableOpacity style={styles.copyLinkButton} onPress={() => {/* Add copy logic */ Alert.alert("Link Copied!")}}>
                <Ionicons name="copy-outline" size={16} color="#6366F1" />
                <Text style={styles.copyLinkText}>Copy Link</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </>
  );
};

// --- Styles --- (Enhanced for a cooler, more insightful UI)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Slightly off-white bg
  },
  scrollContentContainer: {
    paddingBottom: 80, // More space at bottom
  },
  bannerContainer: {
    position: 'relative',
    backgroundColor: '#D1D5DB', // Placeholder bg
  },
  bannerImage: {
    height: 220, // Taller banner
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
     // Gradient for better text visibility near top
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Darker overlay
  },
  backButton: {
    position: 'absolute',
    left: 12, // Closer to edge
    // top: set dynamically
    zIndex: 10,
  },
   backButtonCircle: { // Styling for the back button background
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white circle
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
       // Subtle shadow for depth
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2.00,
      elevation: 2,
   },
  contentArea: {
    marginTop: -60, // Overlap more
    paddingHorizontal: 16,
    borderTopLeftRadius: 30, // More pronounced curve
    borderTopRightRadius: 30,
    backgroundColor: '#F9FAFB', // Match container bg
    paddingTop: 24, // Padding inside the curved area
  },
  card: { // Base card style
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 20, // Consistent spacing between cards
    padding: 20,
    shadowColor: '#9CA3AF', // Softer grey shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: Platform.OS === 'android' ? 0 : 1, // Border only for iOS shadow rendering
    borderColor: '#F3F4F6', // Very light border for iOS
  },
  titleCard: {
     // Specific styles if needed, combined with base card style
  },
   eventName: {
    fontSize: 26,
    fontWeight: 'bold', // Bolder title
    color: '#111827', // Very dark gray/black
    marginBottom: 4,
  },
   eventTagline: {
       fontSize: 14,
       color: '#6B7280', // Medium Gray
       marginBottom: 16,
   },
   infoRow: {
       flexDirection: 'row',
       alignItems: 'center',
       marginBottom: 8,
   },
   infoText: {
       fontSize: 14,
       color: '#4B5563', // Darker Gray
       marginLeft: 8,
   },
  statusBadge: {
    position: 'absolute', // Position over the card content
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },
  statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
  },
  statusUpcoming: { backgroundColor: '#DBEAFE', }, // Blue-100
  statusCompleted: { backgroundColor: '#DCFCE7', }, // Green-100
  dotUpcoming: { backgroundColor: '#3B82F6' }, // Blue-500
  dotCompleted: { backgroundColor: '#22C55E' }, // Green-500
  statusText: { fontSize: 12, fontWeight: '600',},
  textUpcoming: { color: '#2563EB' }, // Blue-600
  textCompleted: { color: '#16A34A' }, // Green-600

  sectionHeaderContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16, // Space below header
      paddingBottom: 10,
      borderBottomWidth: 1,
      borderBottomColor: '#F3F4F6', // Light separator line
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    // Removed redundant styling now in SectionHeader container
  },
  sectionSubtitle: {
     fontSize: 14,
     color: '#6B7280',
     marginBottom: 16,
     marginTop: -8, // Closer to title
  },
  viewDetailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 4,
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: '600',
    marginRight: 4,
  },
   quickGlanceCard: {
      // Specific styles if needed
   },
   insightsGrid: {
       flexDirection: 'row',
       flexWrap: 'wrap',
       justifyContent: 'space-between',
       marginHorizontal: -5, // Counteract block margin
   },
   insightBlock: {
       flexDirection: 'row',
       alignItems: 'center',
       width: '48%', // Two blocks per row
       marginBottom: 15,
       marginHorizontal: '1%',
   },
   insightIcon: {
       marginRight: 10,
       opacity: 0.8,
   },
   insightValue: {
       fontSize: 18,
       fontWeight: 'bold',
       color: '#111827',
   },
   insightLabel: {
       fontSize: 12,
       color: '#6B7280', // Medium Gray
       marginTop: 2,
   },
   // --- Ticket Breakdown Chart Styles ---
    chartContainer: {
        marginTop: 10,
        marginBottom: 10, // Add margin below chart
    },
    barWrapper: {
        marginBottom: 12, // Space between bars
    },
    barLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    barColorIndicator: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 6,
    },
    barLabel: {
        fontSize: 13,
        color: '#4B5563', // Darker gray label
        fontWeight: '500',
    },
    barBackground: {
        height: 6, // Slimmer bar
        backgroundColor: '#F3F4F6', // Lighter background
        borderRadius: 3,
        overflow: 'hidden',
    },
    barForeground: {
        height: '100%',
        borderRadius: 3,
    },
    barValue: {
        fontSize: 12,
        color: '#6B7280',
        textAlign: 'right', // Align value to the right
        marginTop: 2,
    },
    // --- Progress Bar ---
    progressContainer: {
        marginTop: 16,
    },
    progressHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressLabel: {
      fontSize: 14,
      color: '#374151', // Darker gray
      fontWeight: '600',
    },
    progressBarBackground: {
      height: 8,
      backgroundColor: '#E5E7EB', // Gray-200
      borderRadius: 4,
      overflow: 'hidden',
    },
    progressBarForeground: {
      height: '100%',
      backgroundColor: '#6366F1', // Use primary theme color
      borderRadius: 4,
    },
    progressPercentage: {
      fontSize: 14,
      color: '#4B5563',
      fontWeight: '600',
    },
     // --- Attendee Stats ---
    attendeeStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Distribute items
        marginTop: 8,
        paddingVertical: 10,
    },
    attendeeStatItem: {
        alignItems: 'center',
    },
    attendeeStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1E293B',
    },
    attendeeStatLabel: {
        fontSize: 13,
        color: '#64748B',
        marginTop: 4,
    },
    // --- Actions ---
    actionsSection: {
       // Removed card style, actions are now individual cards
       marginTop: 4, // Reduced top margin as title has spacing now
       gap: 12, // Consistent gap
    },
    actionCard: {
       backgroundColor: '#FFFFFF',
       borderRadius: 12,
       paddingVertical: 16,
       paddingHorizontal: 16,
       flexDirection: 'row',
       alignItems: 'center',
       shadowColor: '#BCCCDC',
       shadowOffset: { width: 0, height: 1 },
       shadowOpacity: 0.1,
       shadowRadius: 4,
       elevation: 2,
       borderWidth: Platform.OS === 'android' ? 0 : 1,
       borderColor: '#F3F4F6',
    },
    actionIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        // Background color set inline based on prop
    },
    actionLabel: {
       fontSize: 16,
       color: '#374151', // Dark Gray
       flex: 1,
       fontWeight: '500',
    },
    actionChevron: {
       opacity: 0.7,
    },
    // --- QR Code ---
    qrSection: {
       // Combined with base card style
       alignItems: 'center', // Center content
    },
    qrContainer: {
       padding: 12, // Add padding
       backgroundColor: '#FFF',
       borderRadius: 12, // More rounded
       marginVertical: 15,
       overflow: 'hidden',
       borderWidth: 1, // Add border
       borderColor: '#E5E7EB', // Lighter border
       shadowColor: "#000", // Add shadow to QR
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 1,
    },
    qrHelp: {
       fontSize: 13,
       color: '#6B7280',
       marginTop: 8, // Less margin
       textAlign: 'center',
       marginBottom: 10,
    },
    copyLinkButton: {
       flexDirection: 'row',
       alignItems: 'center',
       marginTop: 10,
       paddingVertical: 8,
       paddingHorizontal: 16,
       borderRadius: 20,
       backgroundColor: '#EEF2FF', // Light indigo bg
    },
    copyLinkText: {
        color: '#6366F1',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default EventOverviewPage;