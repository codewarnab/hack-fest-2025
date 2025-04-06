import React, { useState, useEffect, useRef } from 'react';
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
  Animated, // Import Animated
  Clipboard, // Import Clipboard for copy functionality
  ImageSourcePropType, // Import type for ImageSource
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import { useRouter, useLocalSearchParams, Stack, Link } from 'expo-router'; // Import Link for type-safe routing
import { Ionicons } from '@expo/vector-icons'; // Correctly imported

// Assume these utility functions exist and work as intended
// It's good practice to ensure these functions return consistent types, e.g., Promise<number | null>
import { getTotalTicketBought } from '@/utils/getevent';
import { getTotalRevenue } from '@/utils/getevent';
import { getEventById } from '@/utils/getevent'; // Assuming EventDetails type is exported from getevent
import { useEventUserCount } from '@/utils/getlive'; // Assume this hook provides live count: number

// --- Type Definitions ---
interface TicketBreakdownItem {
  type: string;
  sold: number;
  capacity: number;
  color: string;
}

// Combine dummy structure with potential fields from API (EventDetails)
interface EventData extends Partial<any> { // Make API fields optional initially
  id: string;
  name: string; // Keep some core fields non-optional for the dummy structure
  tagline?: string;
  bannerImage: string;
  date: string;
  time: string;
  location: string;
  address?: string;
  organizer?: string;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled'; // More specific status
  totalCapacity: number;
  attendeesRegistered: number;
  checkIns: number;
  ticketsBreakdown: TicketBreakdownItem[];
  website?: string;
  // Add fields from EventDetails that might be fetched
  title?: string; // from EventDetails
  description?: string; // from EventDetails
  image?: string; // from EventDetails
  venue?: string; // from EventDetails
  eventDate?: string; // from EventDetails (or Date object)
  eventTime?: string; // from EventDetails
  tags?: string[]; // from EventDetails
  // Add other fields as needed from your actual EventDetails type
}

// --- Dummy Data ---
const dummyEventData: EventData = {
  id: 'hackfest-2025',
  name: 'SynthWave Hack Fest 2025',
  tagline: 'Innovate. Collaborate. Create. The future is now.',
  bannerImage: 'https://images.unsplash.com/photo-1519671482749-fd09be7acce1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  date: 'April 15-17, 2025',
  time: '9:00 AM PST onwards',
  location: 'CyberTech Convention Hub',
  address: '1 Infinite Loop, Cupertino, CA',
  organizer: 'QuantumLeap Events',
  status: 'Upcoming',
  totalCapacity: 350,
  attendeesRegistered: 178,
  checkIns: 0,
  ticketsBreakdown: [
    { type: 'Early Bird', sold: 100, capacity: 100, color: '#3b82f6' }, // Blue-500
    { type: 'Regular', sold: 78, capacity: 200, color: '#10b981' },   // Emerald-500
    { type: 'VIP', sold: 0, capacity: 50, color: '#a855f7' },      // Purple-500
  ],
  website: 'https://hackfest2025.example.com'
};

// --- Reusable UI Components ---

// Insight Block Props
interface InsightBlockProps {
  iconName: keyof typeof Ionicons.glyphMap; // Use keyof for type safety
  value: string | number;
  label: string;
  iconColor?: string;
}

// Insight Block: Small, focused piece of data with Icon
const InsightBlock: React.FC<InsightBlockProps> = ({ iconName, value, label, iconColor = '#64748B' }) => (
  <View style={styles.insightBlock}>
    <View style={[styles.insightIconContainer, { backgroundColor: `${iconColor}20` }]}>
      <Ionicons name={iconName} size={20} color={iconColor} style={styles.insightIcon} />
    </View>
    <View style={styles.insightTextContainer}>
      <Text style={styles.insightValue}>{value}</Text>
      <Text style={styles.insightLabel}>{label}</Text>
    </View>
  </View>
);

// Section Header Props
interface SectionHeaderProps {
  title: string;
  // Use Href from expo-router for type-safe links if possible, otherwise string
  linkHref?: string; // Or import Href type from expo-router
  linkText?: string;
}

// Section Header with optional "View Details" link
const SectionHeader: React.FC<SectionHeaderProps> = ({ title, linkHref, linkText = 'View Details' }) => {
  const router = useRouter();
  return (
    <View style={styles.sectionHeaderContainer}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {linkHref && (
        // Using Link component for better type safety if linkHref matches a route definition
        // <Link href={linkHref as any} asChild>
        <TouchableOpacity onPress={() => router.push(linkHref)} activeOpacity={0.7}>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>{linkText}</Text>
            <Ionicons name="arrow-forward-outline" size={16} color="#6366F1" />
          </View>
        </TouchableOpacity>
        // </Link>
      )}
    </View>
  );
};

// Ticket Breakdown Chart Props
interface TicketTypeBreakdownChartProps {
  data: TicketBreakdownItem[]; // Use defined type
}

// Ticket Breakdown Mini Bar Chart Component (Improved Styling)
const TicketTypeBreakdownChart: React.FC<TicketTypeBreakdownChartProps> = ({ data }) => {
  const maxValue = Math.max(...data.map(item => item.sold), 1); // Avoid division by zero

  return (
    <View style={styles.chartContainer}>
      {data.map((item) => {
        const percentageWidth = maxValue > 0 ? (item.sold / maxValue) * 100 : 0;

        return (
          <View key={item.type} style={styles.barWrapper}>
            <View style={styles.barLabelContainer}>
              <View style={[styles.barColorIndicator, { backgroundColor: item.color || '#ccc' }]} />
              <Text style={styles.barLabel}>{item.type}</Text>
            </View>
            <View style={styles.barBackground}>
              <Animated.View // Using Animated.View allows potential future animations
                style={[
                  styles.barForeground,
                  { width: `${percentageWidth}%`, backgroundColor: item.color || '#6366F1' }
                ]}
              />
            </View>
            <Text style={styles.barValue}>{item.sold} sold</Text>
          </View>
        );
      })}
    </View>
  );
};


// Live Users Badge Props
interface LiveUsersBadgeProps {
  count: number;
}

// Live Users Badge: Shows real-time user count with pulsing animation
const LiveUsersBadge: React.FC<LiveUsersBadgeProps> = ({ count }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count <= 0) return; // Don't animate if count is 0 or less

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true
        })
      ])
    );
    pulse.start();

    return () => {
      pulseAnim.setValue(1);
      pulse.stop();
    };
  }, [pulseAnim, count]); // Re-run effect if count changes (to start/stop animation)

  // Return null if count is zero or less, badge shouldn't be visible
  if (count <= 0) {
    return null;
  }

  return (
    <View style={styles.liveUsersBadgeContainer}>
      <View style={styles.liveUsersBadge}>
        <Animated.View
          style={[
            styles.pulsingDot,
            { transform: [{ scale: pulseAnim }] }
          ]}
        />
        <Ionicons name="radio-button-on" size={12} color="#4ade80" style={styles.liveIndicatorIcon} />
        <Ionicons name="people" size={15} color="#FFFFFF" style={styles.liveUsersIcon} />
        <Text style={styles.liveUsersText}>{count} Live</Text>
      </View>
    </View>
  );
};

// --- Main Component ---

const EventOverviewPage = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ event_id?: string }>();
  const eventId = params.event_id || dummyEventData.id; // Use param or fallback to dummy ID

  const [eventData, setEventData] = useState<EventData>(dummyEventData); // Use EventData type
  const [totalTicketsSold, setTotalTicketsSold] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get live user count from the hook
  const liveUserCount = useEventUserCount(eventId); // Assume hook returns number

  useEffect(() => {
    const fetchEventData = async () => {
      // Reset state for potentially new eventId
      setLoading(true);
      setError(null);
      // Reset to dummy if fetching dummy, otherwise wait for fetch
      // setEventData(dummyEventData); // Consider resetting or showing loading state over old data

      if (!eventId || eventId === dummyEventData.id) {
        console.log("Using dummy data, skipping fetch.");
        const dummySold = dummyEventData.ticketsBreakdown.reduce((sum, t) => sum + t.sold, 0);
        setTotalTicketsSold(dummySold);
        setTotalRevenue(dummySold * 25); // Example dummy revenue
        setEventData(prev => ({ // Ensure attendeesRegistered matches for dummy
          ...prev,
          id: dummyEventData.id, // Ensure ID is set correctly
          attendeesRegistered: dummySold
        }));
        setLoading(false);
        return;
      }

      console.log("Fetching data for event ID:", eventId);
      try {
        // Fetch details, tickets, revenue in parallel
        const [eventDetailsResult, ticketsResult, revenueResult] = await Promise.all([
          getEventById(eventId),       // Assume Promise<EventDetails | null>
          getTotalTicketBought(eventId), // Assume Promise<number | null>
          getTotalRevenue(eventId)       // Assume Promise<number | null>
        ]);

        console.log("Fetched Details:", eventDetailsResult);
        console.log("Fetched Tickets:", ticketsResult);
        console.log("Fetched Revenue:", revenueResult);

        const fetchedTickets = ticketsResult ?? 0; // Default to 0 if null/undefined
        const fetchedRevenue = revenueResult ?? 0; // Default to 0 if null/undefined

        if (eventDetailsResult) {
          // Merge fetched data with dummy data structure, prioritizing fetched data
          setEventData(prev => ({
            ...prev, // Keep base structure/defaults
            ...eventDetailsResult, // Spread fetched details (overwrites matching keys)
            id: eventId, // Ensure ID is the fetched one
            name: eventDetailsResult.title || prev.name, // Use fetched title or fallback
            tagline: eventDetailsResult.description?.substring(0, 80) + '...' || prev.tagline,
            bannerImage: eventDetailsResult.image || prev.bannerImage,
            location: eventDetailsResult.venue || prev.location,
            date: eventDetailsResult.eventDate || prev.date,
            time: eventDetailsResult.eventTime || prev.time,
            // TODO: Update ticketsBreakdown if API provides this detail
            attendeesRegistered: fetchedTickets, // Use fetched ticket count for registered
            // website: eventDetailsResult.websiteUrl || prev.website // Example
          }));
        } else {
          setError("Event details could not be found.");
          // Keep showing dummy data or clear it? For now, shows error above dummy.
          setEventData(dummyEventData); // Reset to dummy on error? Or keep potentially stale data?
        }

        setTotalTicketsSold(fetchedTickets);
        setTotalRevenue(fetchedRevenue);

      } catch (fetchError: unknown) { // Type error as unknown
        console.error("Error fetching event data:", fetchError);
        let errorMessage = 'Failed to load event data.';
        if (fetchError instanceof Error) {
          errorMessage += ` ${fetchError.message}`;
        }
        setError(errorMessage);
        // Reset to dummy data on fetch error
        setEventData(dummyEventData);
        setTotalTicketsSold(0);
        setTotalRevenue(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEventData();
  }, [eventId]); // Re-run effect if eventId changes

  const eventName = eventData.name || 'Event Overview';
  // Ensure website is a string, provide a fallback if needed, maybe based on eventId
  const eventShareLink = eventData.website || `https://yourapp.com/events/${eventData.id}`;

  const formatCurrency = (amount: number): string => {
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Robust calculation, handles zero cases
  const calculateCheckinProgress = (): number => {
    const registered = Number(eventData.attendeesRegistered) || 0;
    const checkedIn = Number(eventData.checkIns) || 0;
    if (registered === 0) return 0;
    return Math.min((checkedIn / registered) * 100, 100);
  }
  const checkinProgress = calculateCheckinProgress();

  const calculateTicketProgress = (): number => {
    const capacity = Number(eventData.totalCapacity) || 0;
    const sold = Number(totalTicketsSold) || 0;
    if (capacity === 0) return 0; // Avoid division by zero
    return Math.min((sold / capacity) * 100, 100);
  }
  const ticketProgress = calculateTicketProgress(); // Calculate once

  const handleCopyLink = () => {
    if (!eventShareLink) {
      Alert.alert("Error", "No share link available for this event.");
      return;
    }
    Clipboard.setString(eventShareLink);
    Alert.alert("Link Copied!", "Event link copied to clipboard.");
  };

  // Use require for local images - ensure the path is correct
  // The type ImageSourcePropType covers {uri: string} and require() result
  const qrLogoSource: ImageSourcePropType = require('../../../assets/images/icon.png');


  return (
    <>
      {/* Header Configuration */}
      <Stack.Screen options={{
        title: '', // Hide default title
        headerTransparent: true,
        headerTintColor: '#FFFFFF', // White back arrow for contrast on banner
        headerBackVisible: false, // Hide default back arrow, we use a custom one
      }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Image */}
        <View style={styles.bannerContainer}>
          {/* Ensure bannerImage is a valid URI string */}
          {eventData.bannerImage && (
            <Image
              source={{ uri: eventData.bannerImage }}
              style={[styles.bannerImage, { width }]}
              resizeMode="cover"
              // Add onError handling for image loading issues
              onError={(e) => console.warn("Failed to load banner image:", e.nativeEvent.error)}
            />
          )}
          <View style={styles.bannerOverlay} />

          {/* Custom Back Button */}
          <TouchableOpacity
            style={[styles.backButton, { top: insets.top + 10 }]}
            onPress={() => router.canGoBack() ? router.back() : router.push('/')} // Handle cannot go back case
            activeOpacity={0.8}
          >
            <View style={styles.backButtonCircle}>
              <Ionicons name="arrow-back" size={24} color="#1E293B" />
            </View>
          </TouchableOpacity>

          {/* Live User Count Badge */}
          <LiveUsersBadge count={liveUserCount} />
        </View>

        {/* Main Content Area */}
        <View style={styles.contentArea}>

          {/* Loading Indicator */}
          {loading && <Text style={styles.loadingText}>Loading event data...</Text>}

          {/* Error Message */}
          {error && !loading && <Text style={styles.errorText}>{error}</Text>}

          {/* Render content only if not loading and no critical error preventing display */}
          {!loading && (
            <>
              {/* Event Title & Basic Info Card */}
              <View style={[styles.card, styles.titleCard]}>
                <Text style={styles.eventName}>{eventName}</Text>
                {eventData.tagline && <Text style={styles.eventTagline}>{eventData.tagline}</Text>}
                <View style={styles.infoRow}>
                  <Ionicons name="calendar-outline" size={16} color="#64748B" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{eventData.date}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={16} color="#64748B" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{eventData.time}</Text>
                </View>
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={16} color="#64748B" style={styles.infoIcon} />
                  <Text style={styles.infoText}>{eventData.location}</Text>
                </View>
                <View style={[styles.statusBadge, eventData.status === 'Completed' ? styles.statusCompleted : styles.statusUpcoming]}>
                  <View style={[styles.statusDot, eventData.status === 'Completed' ? styles.dotCompleted : styles.dotUpcoming]} />
                  <Text style={[styles.statusText, eventData.status === 'Completed' ? styles.textCompleted : styles.textUpcoming]}>
                    {eventData.status}
                  </Text>
                </View>
              </View>

              {/* At a Glance Section */}
              <View style={[styles.card, styles.quickGlanceCard]}>
                <SectionHeader title="At a Glance" />
                <View style={styles.insightsGrid}>
                  <InsightBlock iconName="ticket-outline" value={totalTicketsSold} label="Tickets Sold" iconColor="#3b82f6" />
                  <InsightBlock iconName="people-outline" value={eventData.attendeesRegistered} label="Registered" iconColor="#a855f7" />
                  <InsightBlock iconName="cash-outline" value={formatCurrency(totalRevenue)} label="Est. Revenue" iconColor="#10b981" />
                  {/* Conditionally render Live Now if count > 0 */}
                  {liveUserCount > 0 && (
                    <InsightBlock iconName="pulse-outline" value={liveUserCount} label="Live Now" iconColor="#ef4444" />
                  )}
                </View>
              </View>

              {/* Ticketing Section */}
              <View style={styles.card}>
                <SectionHeader title="Ticketing" linkHref={`/manage-tickets/${eventId}`} />
                <Text style={styles.sectionSubtitle}>Sales breakdown by ticket type.</Text>
                <TicketTypeBreakdownChart data={eventData.ticketsBreakdown} />
                <View style={styles.progressContainer}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Overall Capacity</Text>
                    <Text style={styles.progressPercentage}>{`${totalTicketsSold} / ${eventData.totalCapacity}`}</Text>
                  </View>
                  <View style={styles.progressBarBackground}>
                    <Animated.View style={[styles.progressBarForeground, { width: `${ticketProgress}%` }]} />
                  </View>
                </View>
              </View>

              {/* Attendee Section */}
              <View style={styles.card}>
                <SectionHeader title="Attendees" linkHref={`/attendees/${eventId}`} />
                <Text style={styles.sectionSubtitle}>Registration and check-in status.</Text>
                <View style={styles.attendeeStatsRow}>
                  <View style={styles.attendeeStatItem}>
                    <Ionicons name="person-add-outline" size={22} color="#a855f7" style={styles.attendeeStatIcon} />
                    <Text style={styles.attendeeStatValue}>{eventData.attendeesRegistered}</Text>
                    <Text style={styles.attendeeStatLabel}>Registered</Text>
                  </View>
                  <View style={styles.attendeeStatItem}>
                    <Ionicons name="checkmark-circle-outline" size={22} color="#10b981" style={styles.attendeeStatIcon} />
                    <Text style={styles.attendeeStatValue}>{eventData.checkIns}</Text>
                    <Text style={styles.attendeeStatLabel}>Checked-In</Text>
                  </View>
                  <View style={styles.attendeeStatItem}>
                    <Ionicons name="trending-up-outline" size={22} color="#3b82f6" style={styles.attendeeStatIcon} />
                    <Text style={styles.attendeeStatValue}>{checkinProgress.toFixed(0)}%</Text>
                    <Text style={styles.attendeeStatLabel}>Check-in Rate</Text>
                  </View>
                </View>
              </View>

              {/* Management Tools Section */}
              <View style={styles.actionsSectionContainer}>
                <SectionHeader title="Management Tools" />
                <View style={styles.actionsGrid}>
                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push(`/analytics/${eventId}`)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIconContainer, { backgroundColor: '#ECFDF5' }]}>
                      <Ionicons name="stats-chart-sharp" size={24} color="#10B981" />
                    </View>
                    <Text style={styles.actionLabel}>Analytics</Text>
                    <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" style={styles.actionChevron} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push(`/promote/${eventId}`)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIconContainer, { backgroundColor: '#FEF2F2' }]}>
                      <Ionicons name="megaphone-outline" size={24} color="#EF4444" />
                    </View>
                    <Text style={styles.actionLabel}>Promotion</Text>
                    <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" style={styles.actionChevron} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push(`/settings/${eventId}`)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIconContainer, { backgroundColor: '#EFF6FF' }]}>
                      <Ionicons name="settings-outline" size={24} color="#3B82F6" />
                    </View>
                    <Text style={styles.actionLabel}>Settings</Text>
                    <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" style={styles.actionChevron} />
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.actionCard}
                    onPress={() => router.push(`/manage-tickets/${eventId}`)}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.actionIconContainer, { backgroundColor: '#F5F3FF' }]}>
                      <Ionicons name="ticket-outline" size={24} color="#8B5CF6" />
                    </View>
                    <Text style={styles.actionLabel}>Tickets</Text>
                    <Ionicons name="chevron-forward-outline" size={18} color="#9CA3AF" style={styles.actionChevron} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* QR Code Section */}
              <View style={[styles.card, styles.qrSection]}>
                <SectionHeader title="Quick Share" />
                <View style={styles.qrContainer}>
                  {/* Ensure eventShareLink is not empty */}
                  {eventShareLink ? (
                    <QRCode
                      value={eventShareLink}
                      size={width * 0.38}
                      color="#111827"
                      backgroundColor="#FFFFFF"
                      logo={qrLogoSource} // Use typed variable
                      logoSize={30}
                      logoBackgroundColor='transparent'
                      logoMargin={5}
                      logoBorderRadius={5}
                    />
                  ) : (
                    <Text style={styles.errorText}>No share link available.</Text>
                  )}
                </View>
                {eventShareLink && (
                  <>
                    <Text style={styles.qrHelp}>Scan or share the event link below.</Text>
                    <TouchableOpacity
                      style={styles.copyLinkButton}
                      onPress={handleCopyLink}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="link-outline" size={18} color="#6366F1" />
                      <Text style={styles.copyLinkText}>Copy Event Link</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
};

// --- Styles --- (Keep existing styles, assuming they are correct)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA', // Lighter Gray background
  },
  scrollContentContainer: {
    paddingBottom: 100, // Extra space at bottom
  },
  bannerContainer: {
    position: 'relative',
    backgroundColor: '#D1D5DB', // Placeholder if image fails
    minHeight: 240, // Ensure container has height even if image fails
  },
  bannerImage: {
    height: 240, // Slightly taller banner
    width: '100%', // Ensure image takes full width
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.4)', // Slightly darker overlay
  },
  backButton: {
    position: 'absolute',
    left: 15,
    zIndex: 10,
    // top position set dynamically using insets
  },
  backButtonCircle: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)', // More opaque white circle
    width: 44,
    height: 44,
    borderRadius: 22, // Perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.00,
    elevation: 4, // Increased elevation
  },
  contentArea: {
    marginTop: -70, // Overlap banner more significantly
    paddingHorizontal: 16,
    borderTopLeftRadius: 35, // More pronounced curve
    borderTopRightRadius: 35,
    backgroundColor: '#F8F9FA', // Match container bg
    paddingTop: 28, // Padding inside the curved area
    minHeight: 400, // Ensure content area has min height
  },
  loadingText: {
    textAlign: 'center',
    marginVertical: 40,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    textAlign: 'center',
    marginVertical: 15,
    padding: 12,
    backgroundColor: '#FEF2F2', // Light red background
    color: '#DC2626', // Darker red text
    borderRadius: 8,
    fontSize: 14,
    fontWeight: '500',
    borderWidth: 1,
    borderColor: '#FEE2E2', // Lighter red border
    marginHorizontal: 10, // Add some horizontal margin for error text
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20, // More rounded corners
    marginBottom: 24, // Increased spacing
    padding: 22, // More padding
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 4 }, // Slightly larger shadow offset
    shadowOpacity: 0.12, // Slightly more opacity
    shadowRadius: 8,
    elevation: 5, // Increased elevation for Android
    borderWidth: Platform.OS === 'android' ? 0 : 1,
    borderColor: '#F3F4F6', // Keep light border for iOS
  },
  titleCard: {
    position: 'relative', // Needed for absolute positioning of status badge
    paddingBottom: 50, // Adjust padding to ensure status badge doesn't overlap text much
    overflow: 'hidden', // Clip content if necessary (e.g., status badge slightly outside)
  },
  eventName: {
    fontSize: 28, // Larger event name
    fontWeight: 'bold', // Bold
    color: '#111827',
    marginBottom: 6,
    lineHeight: 34, // Adjust line height
  },
  eventTagline: {
    fontSize: 15, // Slightly larger tagline
    color: '#4B5563', // Darker gray
    marginBottom: 20, // More space below tagline
    lineHeight: 22,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12, // More space between info rows
  },
  infoIcon: {
    marginRight: 12, // More space next to icon
  },
  infoText: {
    fontSize: 15, // Slightly larger info text
    color: '#374151', // Dark Gray
    flexShrink: 1, // Allow text to wrap if needed
  },
  statusBadge: {
    position: 'absolute',
    bottom: 18, // Positioned near the bottom right
    right: 18,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12, // More horizontal padding
    paddingVertical: 6, // More vertical padding
    borderRadius: 16, // Pill shape
    zIndex: 1, // Ensure badge is above other content in the card
  },
  statusDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    marginRight: 8, // More space next to dot
  },
  // Ensure status styles handle different statuses you might have
  statusUpcoming: { backgroundColor: '#DBEAFE', }, // Blue-100
  statusCompleted: { backgroundColor: '#DCFCE7', }, // Green-100
  dotUpcoming: { backgroundColor: '#3B82F6' }, // Blue-500
  dotCompleted: { backgroundColor: '#22C55E' }, // Green-500
  statusText: { fontSize: 13, fontWeight: '600', }, // Slightly larger status text
  textUpcoming: { color: '#2563EB' }, // Blue-600
  textCompleted: { color: '#16A34A' }, // Green-600

  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18, // More space below header
    paddingBottom: 12, // More padding below line
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB', // Gray-200 separator
  },
  sectionTitle: {
    fontSize: 20, // Larger section title
    fontWeight: 'bold',
    color: '#1F2937', // Darker Gray
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280', // Medium Gray
    marginBottom: 18,
    marginTop: -10, // Pull closer to title
    lineHeight: 20,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 8, // Add horizontal padding for better tap target
    borderRadius: 6,
    backgroundColor: '#EEF2FF', // Light Indigo background for button
  },
  viewDetailsText: {
    fontSize: 14,
    color: '#4F46E5', // Indigo-600
    fontWeight: '600',
    marginRight: 5,
  },
  quickGlanceCard: {
    // Specific styles if needed
  },
  insightsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -6, // Counteract block margin/padding
  },
  insightBlock: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '48%', // Maintain two blocks per row roughly
    marginBottom: 18,
    paddingHorizontal: 6, // Add padding inside the block area
  },
  insightIconContainer: { // Style for the icon background
    width: 40,
    height: 40,
    borderRadius: 20, // Circle
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    // background color set dynamically with opacity
  },
  insightIcon: {
    // Icon itself - size/color set in component props
  },
  insightTextContainer: {
    flex: 1, // Take remaining space
  },
  insightValue: {
    fontSize: 20, // Larger value
    fontWeight: 'bold',
    color: '#111827',
    lineHeight: 24,
  },
  insightLabel: {
    fontSize: 13, // Slightly larger label
    color: '#6B7280',
    marginTop: 3,
    lineHeight: 18,
  },
  // --- Ticket Breakdown Chart Styles ---
  chartContainer: {
    marginTop: 12,
    marginBottom: 16, // Add margin below chart
  },
  barWrapper: {
    marginBottom: 14, // More space between bars
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6, // More space below label
  },
  barColorIndicator: {
    width: 12,
    height: 12,
    borderRadius: 3, // Slightly rounded square
    marginRight: 8,
  },
  barLabel: {
    fontSize: 14, // Larger label
    color: '#374151', // Darker gray label
    fontWeight: '500',
  },
  barBackground: {
    height: 8, // Slightly thicker bar
    backgroundColor: '#F3F4F6', // Lighter background
    borderRadius: 4,
    overflow: 'hidden',
  },
  barForeground: {
    height: '100%',
    borderRadius: 4,
  },
  barValue: {
    fontSize: 13, // Slightly larger value
    color: '#4B5563',
    textAlign: 'right', // Align value to the right
    marginTop: 4, // More space above value
    fontWeight: '500',
  },
  // --- Progress Bar ---
  progressContainer: {
    marginTop: 20, // More space above progress bar
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 15, // Larger label
    color: '#374151',
    fontWeight: '600',
  },
  progressBarBackground: {
    height: 10, // Thicker progress bar
    backgroundColor: '#E5E7EB', // Gray-200
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBarForeground: {
    height: '100%',
    backgroundColor: '#6366F1', // Indigo-500 primary theme color
    borderRadius: 5,
  },
  progressPercentage: {
    fontSize: 14,
    color: '#4B5563',
    fontWeight: '600',
  },
  // --- Attendee Stats ---
  attendeeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingVertical: 12,
    // backgroundColor: '#F9FAFB', // Optional subtle background
    borderRadius: 12,
  },
  attendeeStatItem: {
    alignItems: 'center',
    flex: 1, // Distribute space evenly
    paddingHorizontal: 5, // Prevent text collision on small screens
  },
  attendeeStatIcon: {
    marginBottom: 8, // Space between icon and value
  },
  attendeeStatValue: {
    fontSize: 22, // Larger stat value
    fontWeight: 'bold',
    color: '#111827', // Very dark gray
    textAlign: 'center',
  },
  attendeeStatLabel: {
    fontSize: 13,
    color: '#6B7280', // Medium gray
    marginTop: 4,
    textAlign: 'center',
  },
  // --- Actions ---
  actionsSectionContainer: { // Container for the actions section including header
    backgroundColor: '#FFFFFF', // Give actions section its own card-like background
    borderRadius: 20,
    padding: 22,
    marginBottom: 24,
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: Platform.OS === 'android' ? 0 : 1,
    borderColor: '#F3F4F6',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 4, // Space after the header within the container
  },
  actionCard: {
    width: '48%', // Two actions per row
    backgroundColor: '#F9FAFB', // Lighter background for individual action cards
    borderRadius: 12,
    padding: 16,
    marginBottom: 12, // Space between rows of actions
    flexDirection: 'row',
    alignItems: 'center',
    // Remove individual shadows, rely on the container shadow
  },
  actionIconContainer: {
    width: 44, // Larger icon container
    height: 44,
    borderRadius: 12, // Slightly rounded square
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    // Background color set inline
  },
  actionLabel: {
    fontSize: 15, // Larger label
    color: '#374151',
    fontWeight: '600', // Bolder label
    flex: 1, // Take available space
    flexShrink: 1, // Allow label to shrink if needed
  },
  actionChevron: {
    opacity: 0.8,
    marginLeft: 4, // Add small margin before chevron
  },
  // --- QR Code ---
  qrSection: {
    alignItems: 'center',
  },
  qrContainer: {
    padding: 10, // Padding around the QR code itself
    backgroundColor: '#FFF',
    borderRadius: 16, // Rounded corners for the QR background
    marginVertical: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F3F4F6', // Very light border
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2, },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 2,
    alignItems: 'center', // Center QR code if link is missing
    justifyContent: 'center', // Center QR code if link is missing
    minHeight: 100, // Ensure container has some height
  },
  qrHelp: {
    fontSize: 14, // Slightly larger help text
    color: '#4B5563',
    marginTop: 0, // Reduced margin
    textAlign: 'center',
    marginBottom: 16, // Space before button
  },
  copyLinkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 0,
    paddingVertical: 12, // Larger button
    paddingHorizontal: 24,
    borderRadius: 25, // Pill shape
    backgroundColor: '#EEF2FF', // Light Indigo background
    borderWidth: 1,
    borderColor: '#C7D2FE', // Slightly darker border
  },
  copyLinkText: {
    color: '#4F46E5', // Indigo-600
    marginLeft: 8, // More space next to icon
    fontSize: 15, // Larger text
    fontWeight: '600',
  },
  // Live Users Badge styles
  liveUsersBadgeContainer: {
    position: 'absolute',
    // Positioned relative to banner, not affected by safe area here
    top: 15,
    right: 15,
    zIndex: 10,
  },
  liveUsersBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darker semi-transparent background
    paddingVertical: 7, // Slightly more padding
    paddingHorizontal: 14,
    borderRadius: 20, // Pill shape
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  liveIndicatorIcon: { // For the small green dot
    marginRight: 5,
  },
  pulsingDot: { // Animated dot (could be hidden or used alongside indicator)
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80', // Green color for live status
    position: 'absolute', // Position behind the badge content slightly offset
    left: 8,
    top: 11, // Adjusted position
    opacity: 0.8, // Slightly transparent
  },
  liveUsersIcon: {
    marginRight: 5, // Space between icons and text
  },
  liveUsersText: {
    color: '#FFFFFF',
    fontWeight: 'bold', // Bolder text
    fontSize: 14, // Larger font
  },
});


export default EventOverviewPage;