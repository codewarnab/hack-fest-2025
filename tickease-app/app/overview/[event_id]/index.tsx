import React from 'react'; // Removed useState, useEffect as we use dummy data now
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  // Removed ActivityIndicator, Alert as they are not used with dummy data
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
// Removed getEventById and Event type imports as we use dummy data

// --- Dummy Data ---
// Represents the kind of data you might fetch for an event overview
const dummyEventData = {
  id: 'hackfest-2025',
  name: 'Hack Fest 2025',
  bannerImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Example banner
  date: 'April 15-17, 2025',
  time: '9:00 AM - 5:00 PM',
  location: 'Tech Innovation Center',
  address: '123 Developer Ave, Silicon Valley, CA', // Added address for completeness
  organizer: 'Tech Community Network',
  status: 'Upcoming',
  totalTicketsSold: 63,
  totalCapacity: 350,
  estimatedRevenue: 5898.40,
  checkInRate: 0, // Assuming event hasn't started
  ticketsBreakdown: [
    { type: 'Early Bird', sold: 25, capacity: 100 },
    { type: 'Regular', sold: 38, capacity: 200 },
    { type: 'VIP', sold: 0, capacity: 50 },
  ],
  // Add more relevant manager data if needed
};

// --- Reusable UI Components ---

const MetricCard = ({ iconName, label, value, color = '#6366F1' }: {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number; // Accept string or number
  color?: string;
}) => (
  <View style={styles.metricCard}>
    <Ionicons name={iconName} size={26} color={color} style={styles.metricIcon} />
    <Text style={styles.metricValue}>{value}</Text>
    <Text style={styles.metricLabel}>{label}</Text>
  </View>
);

const ActionCard = ({ iconName, label, onPress, color = '#475569' }: { // Default color grey
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress} activeOpacity={0.7}>
    <View style={[styles.actionIconContainer, { backgroundColor: `${color}1A` }]}>
         <Ionicons name={iconName} size={22} color={color} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
    <Ionicons name="chevron-forward-outline" size={20} color="#94a3b8" style={styles.actionChevron} />
  </TouchableOpacity>
);

// --- Main Component ---

const EventOverviewPage = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ event_id?: string }>();
  const eventId = params.event_id || dummyEventData.id; // Use dummy if no param

  // Using dummy data directly
  const eventData = dummyEventData;
  const eventName = eventData.name || 'Event Overview';

  const formatCurrency = (amount: number): string => {
    // Add locale formatting if needed: .toLocaleString('en-US', { style: 'currency', currency: 'USD' })
    return `$${amount.toFixed(2)}`;
  };

  const calculateTicketProgress = (): number => {
    if (!eventData.totalCapacity || eventData.totalCapacity === 0) return 0;
    return Math.min( (eventData.totalTicketsSold / eventData.totalCapacity) * 100, 100); // Cap at 100%
  };
  const ticketProgress = calculateTicketProgress();

  return (
    <>
      {/* Configure Header Title Dynamically */}
      <Stack.Screen options={{ title: eventName, headerBackTitleVisible: false }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false} // Hide scrollbar for cleaner look
      >
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: eventData.bannerImage }}
            style={[styles.bannerImage, { width }]}
            resizeMode="cover"
          />
           {/* Subtle Gradient Overlay */}
           <View style={styles.bannerOverlay} />
        </View>


        {/* Back Button (positioned absolutely) */}
        <TouchableOpacity
          style={[styles.backButton, { top: insets.top + 10 }]}
          onPress={() => router.back()}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back-circle" size={36} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>

        {/* Main Content Area */}
        <View style={styles.contentArea}>

          {/* Event Title Section */}
          <View style={styles.titleSection}>
            <Text style={styles.eventName}>{eventName}</Text>
            <View style={[styles.statusBadge, eventData.status === 'Completed' ? styles.statusCompleted : styles.statusUpcoming]}>
              <View style={[styles.statusDot, eventData.status === 'Completed' ? styles.dotCompleted : styles.dotUpcoming]}/>
              <Text style={[styles.statusText, eventData.status === 'Completed' ? styles.textCompleted : styles.textUpcoming]}>
                {eventData.status}
              </Text>
            </View>
          </View>

          {/* Key Metrics Section */}
          <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Key Metrics</Text>
          <View style={styles.metricsGrid}>
            <MetricCard
              iconName="ticket-outline"
              label="Tickets Sold"
              value={`${eventData.totalTicketsSold} / ${eventData.totalCapacity}`}
              color="#3b82f6" // Blue-500
            />
            <MetricCard
              iconName="cash-outline"
              label="Est. Revenue"
              value={formatCurrency(eventData.estimatedRevenue)}
              color="#10b981" // Emerald-500
            />
            <MetricCard
              iconName="checkmark-done-outline"
              label="Check-in Rate"
              value={`${eventData.checkInRate}%`}
              color="#f59e0b" // Amber-500
            />
            {/* Optional: Add another metric or leave space */}
            <View style={styles.metricCardPlaceholder} />
          </View>

           {/* Ticket Sales Progress */}
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
                <Text style={styles.progressLabel}>Ticket Sales Progress</Text>
                <Text style={styles.progressPercentage}>{ticketProgress.toFixed(0)}%</Text>
            </View>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarForeground, { width: `${ticketProgress}%` }]} />
            </View>
          </View>


          {/* Core Details Section */}
           <View style={styles.detailsSection}>
              <Text style={styles.sectionTitle}>Event Details</Text>
              <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                     <Ionicons name="calendar-clear-outline" size={20} color="#64748b" />
                     <Text style={styles.detailText}>{eventData.date}</Text>
                  </View>
                   <View style={styles.detailItem}>
                     <Ionicons name="time-outline" size={20} color="#64748b" />
                     <Text style={styles.detailText}>{eventData.time}</Text>
                  </View>
              </View>
               <View style={styles.detailItemFullWidth}>
                 <Ionicons name="location-outline" size={20} color="#64748b" />
                 <Text style={styles.detailText}>{eventData.location}</Text>
              </View>
               <View style={styles.detailItemFullWidth}>
                 <Ionicons name="map-outline" size={20} color="#64748b" />
                 <Text style={styles.detailText}>{eventData.address}</Text>
              </View>
          </View>


          {/* Actions/Navigation Section */}
          <View style={styles.actionsSection}>
             <Text style={[styles.sectionTitle, styles.sectionTitleSpaced]}>Management Tools</Text>
             <ActionCard
                iconName="analytics-outline"
                label="Detailed Analytics"
                onPress={() => router.push(`/analytics/${eventId}`)} // Example route
                color="#ef4444" // Red-500
             />
             <ActionCard
                iconName="people-outline"
                label="Manage Attendees"
                onPress={() => router.push(`/attendees/${eventId}`)} // Example route
                color="#3b82f6" // Blue-500
             />
              <ActionCard
                iconName="pricetags-outline"
                label="Ticket Types & Add-ons"
                onPress={() => router.push(`/manage-tickets/${eventId}`)} // Example route
                color="#10b981" // Emerald-500
             />
               <ActionCard
                iconName="share-social-outline"
                label="Promotion & Sharing"
                onPress={() => router.push(`/promote/${eventId}`)} // Example route
                color="#a855f7" // Purple-500
             />
              <ActionCard
                iconName="settings-outline"
                label="Event Settings"
                onPress={() => router.push(`/settings/${eventId}`)} // Example route
                color="#64748b" // Slate-500
             />
          </View>

           {/* QR Code Section */}
           <View style={styles.qrSection}>
             <Text style={styles.sectionTitle}>Quick Share</Text>
             <View style={styles.qrContainer}>
               <QRCode
                 value={`https://yourapp.com/event/${eventData.id}`} // Link to a public event page
                 size={width * 0.4}
                 color="#1E293B"
                 backgroundColor="#FFFFFF"
                 logo={require('../../../assets/images/icon.png')} // Example: Add your app icon
                 logoSize={30}
                 logoBackgroundColor='transparent'
               />
             </View>
             <Text style={styles.qrHelp}>Share this code or link with attendees</Text>
           </View>

        </View>
      </ScrollView>
    </>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Very light gray background
  },
  scrollContentContainer: {
    paddingBottom: 60,
  },
  bannerContainer: {
     position: 'relative', // Needed for overlay
  },
  bannerImage: {
    height: 200, // Adjusted height
    backgroundColor: '#E2E8F0',
  },
   bannerOverlay: {
      ...StyleSheet.absoluteFillObject, // Cover the image
      backgroundColor: 'rgba(0, 0, 0, 0.15)', // Subtle dark overlay
   },
  backButton: {
    position: 'absolute',
    left: 16,
    // top: // Set dynamically using insets
    // Removed background for cleaner look over image gradient
    width: 44, // Larger touch target
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  contentArea: {
    marginTop: -50, // Increased overlap
    paddingHorizontal: 16,
    borderTopLeftRadius: 24, // Add rounding to the content area start
    borderTopRightRadius: 24,
    backgroundColor: '#F8FAFC', // Match container background
    paddingTop: 20, // Add padding after the overlap
  },
  titleSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24, // More space after title card
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#94A3B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  eventName: {
    fontSize: 24, // Title size
    fontWeight: 'bold',
    color: '#1E293B',
    flexShrink: 1,
    marginRight: 10,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 99, // Pill shape
    marginLeft: 'auto',
  },
  statusDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginRight: 6,
  },
  statusUpcoming: {
      backgroundColor: '#EFF6FF', // Lighter blue
  },
  statusCompleted: {
      backgroundColor: '#F0FDF4', // Lighter green
  },
  dotUpcoming: { backgroundColor: '#3B82F6' /* Blue-500 */ },
  dotCompleted: { backgroundColor: '#22C55E' /* Green-500 */ },
  statusText: {
      fontSize: 12,
      fontWeight: '600', // Semibold
  },
  textUpcoming: { color: '#2563EB' /* Blue-600 */ },
  textCompleted: { color: '#16A34A' /* Green-600 */ },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E293B',
    marginBottom: 16,
  },
  sectionTitleSpaced: {
    marginTop: 12, // Add space above section titles that aren't the first
     paddingBottom: 8,
     borderBottomWidth: 1,
     borderBottomColor: '#F1F5F9',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6, // Counteract card margin
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    width: '48%', // Keep ~2 cards per row
    marginBottom: 12,
    alignItems: 'flex-start',
    shadowColor: '#BCCCDC', // Lighter shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 2,
    marginHorizontal: '1%', // Add horizontal margin
  },
   metricCardPlaceholder: { // To balance grid if odd number of metrics
       width: '48%',
       marginHorizontal: '1%',
   },
  metricIcon: {
    marginBottom: 10,
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 24, // Emphasize value
    fontWeight: 'bold', // Use bold or heavy font
    color: '#1E293B',
    marginBottom: 3,
  },
  metricLabel: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24, // More space after progress
    shadowColor: '#BCCCDC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
   progressHeader: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       marginBottom: 8,
   },
  progressLabel: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600', // Bolder label
  },
  progressBarBackground: {
    height: 10, // Thicker bar
    backgroundColor: '#F1F5F9', // Lighter background
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#4ADE80', // Use a vibrant green for progress
    borderRadius: 5,
  },
  progressPercentage: {
    fontSize: 13,
    color: '#475569',
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 0, // Details right after progress
    shadowColor: '#BCCCDC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
   detailRow: { // Group Date and Time
       flexDirection: 'row',
       justifyContent: 'space-between',
       marginBottom: 8, // Space below row
   },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6, // Vertical padding for spacing
    flex: 1, // Allow items in a row to share space
    marginRight: 10, // Add space between items in a row
  },
  detailItemFullWidth: { // For location and address
     flexDirection: 'row',
     alignItems: 'center',
     paddingVertical: 6,
  },
  detailText: {
    fontSize: 14, // Standard text size
    color: '#334155',
    marginLeft: 10,
    flexShrink: 1, // Allow text wrapping
    lineHeight: 20,
  },
  actionsSection: {
    marginTop: 24,
    gap: 10, // Add gap between action cards
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 14, // Slightly less vertical padding
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    // marginBottom: 10, // Use gap in parent instead
    shadowColor: '#BCCCDC',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1, // Subtle border
    borderColor: '#F1F5F9',
  },
  actionIconContainer: {
      width: 36,
      height: 36,
      borderRadius: 18,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      // Background color set inline based on prop
  },
  actionLabel: {
    fontSize: 15, // Slightly larger action text
    color: '#334155',
    flex: 1,
    fontWeight: '500',
  },
  actionChevron: {
    opacity: 0.6,
  },
  qrSection: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginTop: 24,
    padding: 25,
    shadowColor: '#BCCCDC',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qrContainer: {
    padding: 10, // Less padding if logo is present
    backgroundColor: '#FFF',
    borderRadius: 8, // Smaller radius for QR container
    marginVertical: 15,
    overflow: 'hidden',
     borderWidth: 1,
     borderColor: '#E2E8F0',
  },
  qrHelp: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default EventOverviewPage;