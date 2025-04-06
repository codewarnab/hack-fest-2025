import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Dimensions,
    TouchableOpacity,
    ActivityIndicator,
    Platform,
    RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
// Removed SVG Chart imports

// --- Define TypeScript Interfaces ---
interface GenderDataPoint {
    key: string;
    value: number;
    color: string; // Keep color for potential UI use
}

interface AgeDataPoint {
    label: string; // Age range e.g., "18-24"
    value: number; // count
}

interface LocationDataPoint {
    location: string; // e.g., "USA", "Canada", "London"
    count: number;
}

interface RegistrationTrendPoint {
    date: string; // "YYYY-MM-DD"
    count: number;
}

interface AttendeeDemographicsData {
    eventId: string;
    eventName: string;
    totalAttendees: number;
    genderDistribution: GenderDataPoint[];
    ageDistribution: AgeDataPoint[];
    topLocations: LocationDataPoint[]; // Top 5 for example
    registrationTrend: RegistrationTrendPoint[]; // Will be used differently now
}

// --- Mock Data ---
const MOCK_DEMOGRAPHICS_DATA: AttendeeDemographicsData = {
    eventId: 'hackfest-2025',
    eventName: 'SynthWave Hack Fest 2025',
    totalAttendees: 178,
    genderDistribution: [
        { key: 'Male', value: 95, color: '#6366F1' },
        { key: 'Female', value: 70, color: '#EC4899' },
        { key: 'Other/N/A', value: 13, color: '#A1A1AA' }, // Combined Other/NA
    ],
    ageDistribution: [
        { label: '18-24', value: 45 }, { label: '25-34', value: 88 },
        { label: '35-44', value: 30 }, { label: '45-54', value: 10 },
        { label: '55+', value: 5 },
    ],
    topLocations: [
        { location: 'California, USA', count: 65 }, // More specific example
        { location: 'New York, USA', count: 45 },
        { location: 'Toronto, Canada', count: 25 },
        { location: 'London, UK', count: 18 },
        { location: 'Berlin, Germany', count: 15 },
    ],
    registrationTrend: [ // Used to find peak day maybe
        { date: '2025-03-01', count: 20 }, { date: '2025-03-02', count: 35 },
        { date: '2025-03-03', count: 28 }, { date: '2025-03-04', count: 40 },
        { date: '2025-03-05', count: 25 }, { date: '2025-03-06', count: 18 },
        { date: '2025-03-07', count: 12 },
    ],
};

// --- Reusable Components ---
const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionTitle}>{title}</Text>
);

// Simple Progress Bar using Views
const SimpleProgressBar = ({ value, total, color }: { value: number; total: number; color: string }) => {
    const percentage = total > 0 ? Math.min((value / total) * 100, 100) : 0;
    return (
        <View style={styles.progressBarContainer}>
            <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarForeground, { width: `${percentage}%`, backgroundColor: color }]} />
            </View>
             <Text style={styles.progressBarText}>{value} ({percentage.toFixed(1)}%)</Text>
        </View>
    );
};

// List Item for ranked data like locations
const RankedListItem = ({ rank, label, value }: { rank: number; label: string; value: string | number }) => (
    <View style={styles.rankedListItem}>
        <Text style={styles.rankNumber}>{rank}</Text>
        <Text style={styles.rankedLabel}>{label}</Text>
        <Text style={styles.rankedValue}>{value}</Text>
    </View>
);

// --- Main Component ---
const AttendeeDemographicsPage = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState<AttendeeDemographicsData | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const router = useRouter();
    const params = useLocalSearchParams<{ event_id?: string }>();
    const eventId = params.event_id;

    // --- Fetch Data Logic (keep as before) ---
     const fetchData = async (isRefreshing = false) => {
        if (!isRefreshing) setIsLoading(true);
        else setRefreshing(true);
        console.log(`Fetching demographics for event: ${eventId}`);
        await new Promise(resolve => setTimeout(resolve, isRefreshing ? 400 : 1000));
        setData(MOCK_DEMOGRAPHICS_DATA); // Use mock data
        setIsLoading(false);
        setRefreshing(false);
     };

     useEffect(() => { fetchData(); }, [eventId]);
     const onRefresh = () => { fetchData(true); };


    // --- Derived Insights (Calculated from data) ---
    const dominantAgeGroup = data?.ageDistribution?.reduce(
        (max, current) => (current.value > max.value ? current : max),
        { label: 'N/A', value: 0 }
    )?.label;

    const peakRegistrationDay = data?.registrationTrend?.reduce(
         (max, current) => (current.count > max.count ? current : max),
         { date: 'N/A', count: 0 }
     );
     const peakDayFormatted = peakRegistrationDay && peakRegistrationDay.date !== 'N/A'
         ? new Date(peakRegistrationDay.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
         : 'N/A';


    // --- Render Loading/Error States (keep as before) ---
     if (isLoading && !refreshing) { /* ... loading UI ... */
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#6366F1" />
                <Text style={styles.loadingText}>Loading Demographics...</Text>
            </View>
        );
    }
     if (!data && !isLoading) { /* ... error/no data UI ... */
        return (
             <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
                  <Stack.Screen options={{ title: 'Error Loading Data' }} />
                 <View style={styles.header}>
                      <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                         <Ionicons name="arrow-back" size={24} color="#6366F1" />
                      </TouchableOpacity>
                       <Text style={styles.headerTitleError}>Demographics Unavailable</Text>
                       <View style={{ width: 24 }} />
                  </View>
                  <View style={styles.loadingContainer}>
                       <Ionicons name="sad-outline" size={50} color="#9CA3AF" style={{ marginBottom: 15 }}/>
                      <Text style={styles.errorText}>Could not load demographic data.</Text>
                      <TouchableOpacity onPress={onRefresh} style={styles.retryButton}>
                          <Ionicons name="refresh-outline" size={18} color="#FFFFFF" style={{marginRight: 8}}/>
                          <Text style={styles.retryButtonText}>Retry</Text>
                      </TouchableOpacity>
                  </View>
              </SafeAreaView>
        );
    }


    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <Stack.Screen options={{ title: 'Attendee Demographics', headerBackVisible: false }} />

            {/* Header */}
             <View style={styles.header}>
                 <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                     <Ionicons name="arrow-back" size={24} color="#6366F1" />
                  </TouchableOpacity>
                <Text style={styles.headerTitle}>Attendee Demographics</Text>
                 <TouchableOpacity onPress={onRefresh}>
                     <Ionicons name="refresh-outline" size={24} color="#6366F1" />
                 </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.scrollView}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />
                }
            >
                {/* Overall Title */}
                <Text style={styles.overallTitle}>Analysis for {data.eventName}</Text>
                <Text style={styles.overallSubtitle}>Total Attendees: {data.totalAttendees.toLocaleString()}</Text>

                {/* Gender Distribution Card */}
                <View style={styles.card}>
                    <SectionHeader title="Gender Distribution" />
                    {data.genderDistribution.length > 0 ? (
                        data.genderDistribution.map((gender) => (
                            <View key={gender.key} style={styles.distroRow}>
                                <View style={styles.distroLabelContainer}>
                                    <View style={[styles.distroColorIndicator, { backgroundColor: gender.color }]}/>
                                    <Text style={styles.distroLabel}>{gender.key}</Text>
                                </View>
                                <SimpleProgressBar
                                    value={gender.value}
                                    total={data.totalAttendees}
                                    color={gender.color}
                                />
                            </View>
                        ))
                    ) : <Text style={styles.noDataText}>No gender data available.</Text>}
                </View>

                {/* Age Distribution Card */}
                <View style={styles.card}>
                    <SectionHeader title="Age Distribution" />
                     {data.ageDistribution.length > 0 ? (
                         <View>
                             {data.ageDistribution.map((ageGroup) => (
                                <View key={ageGroup.label} style={styles.distroRow}>
                                    <Text style={[styles.distroLabel, styles.ageLabel]}>{ageGroup.label}</Text>
                                    <SimpleProgressBar
                                        value={ageGroup.value}
                                        total={data.totalAttendees}
                                        color="#818CF8" // Indigo-400 for age bars
                                    />
                                </View>
                             ))}
                             <View style={styles.insightBox}>
                                 <Ionicons name="sparkles-outline" size={20} color="#8B5CF6" style={styles.insightIcon}/>
                                 <Text style={styles.insightText}>
                                    <Text style={styles.insightHighlight}>Dominant Group:</Text> The {dominantAgeGroup} age range has the highest attendance.
                                 </Text>
                            </View>
                         </View>
                     ) : <Text style={styles.noDataText}>No age data available.</Text>}
                </View>

                {/* Top Locations Card */}
                <View style={styles.card}>
                    <SectionHeader title="Top Attendee Locations" />
                     {data.topLocations.length > 0 ? (
                        <View style={styles.rankedListContainer}>
                            {data.topLocations.map((loc, index) => (
                                <RankedListItem
                                    key={loc.location}
                                    rank={index + 1}
                                    label={loc.location}
                                    value={`${loc.count} attendees`}
                                />
                            ))}
                        </View>
                     ): <Text style={styles.noDataText}>No location data available.</Text>}
                </View>

                {/* Registration Trend Insight Card */}
                <View style={styles.card}>
                    <SectionHeader title="Registration Insights" />
                    {peakRegistrationDay && peakRegistrationDay.date !== 'N/A' ? (
                         <View style={styles.insightBox}>
                            <Ionicons name="calendar-number-outline" size={20} color="#10B981" style={styles.insightIcon}/>
                            <Text style={styles.insightText}>
                                <Text style={styles.insightHighlight}>Peak Registration:</Text> The highest number of registrations occurred on {peakDayFormatted} ({peakRegistrationDay.count} sign-ups).
                            </Text>
                        </View>
                     ) : <Text style={styles.noDataText}>No registration trend data available.</Text>}
                     {/* Optional: Add link to full registration timeline */}
                      <TouchableOpacity style={styles.viewMoreButton} onPress={() => router.push('/analytics/registration-timeline')}>
                        <Text style={styles.viewMoreButtonText}>View Full Timeline</Text>
                        <Ionicons name="arrow-forward" size={16} color="#6366F1" />
                    </TouchableOpacity>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
};

// --- Styles --- (Adapted for new components)
const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F9FAFB', },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 20, },
    loadingText: { marginTop: 15, fontSize: 16, color: '#6B7280', },
    errorText: { marginTop: 15, fontSize: 16, color: '#EF4444', textAlign: 'center', paddingHorizontal: 30, marginBottom: 20, },
    retryButton: { flexDirection: 'row', alignItems: 'center', marginTop: 20, backgroundColor: '#6366F1', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, },
    retryButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 15, },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: Platform.OS === 'android' ? 12 : 10, height: Platform.OS === 'android' ? 56 : 44, backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', },
    backButton: { padding: 6, marginLeft: -6, },
    headerTitle: { fontSize: 17, fontWeight: '600', color: '#1F2937', },
     headerTitleError: { fontSize: 17, fontWeight: '600', color: '#6B7280', textAlign: 'center', flex: 1, },
    scrollView: { flex: 1, paddingTop: 16, paddingBottom: 30, },
    overallTitle: { fontSize: 16, fontWeight: '600', color: '#4B5563', marginHorizontal: 16, marginBottom: 4, },
    overallSubtitle: { fontSize: 14, color: '#6B7280', marginHorizontal: 16, marginBottom: 20, }, // Increased margin
    card: { backgroundColor: '#FFFFFF', borderRadius: 12, marginHorizontal: 16, marginBottom: 20, padding: 20, /* Increased padding */ shadowColor: '#9CA3AF', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2, borderWidth: Platform.OS === 'android' ? 0 : 1, borderColor: '#F3F4F6', },
    sectionTitle: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 16, },
    noDataText: { textAlign: 'center', color: '#9CA3AF', paddingVertical: 30, fontSize: 14, fontStyle: 'italic', },

    // Distribution Row (Gender/Age)
    distroRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    distroLabelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 100, // Fixed width for label part
        marginRight: 10,
    },
     distroColorIndicator: {
        width: 12,
        height: 12,
        borderRadius: 3,
        marginRight: 8,
    },
    distroLabel: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    ageLabel: { // Specific style to ensure fixed width for age labels
         width: 50, // Adjust as needed for your age ranges
         textAlign: 'right',
         marginRight: 10,
    },
    // Simple Progress Bar
    progressBarContainer: {
        flex: 1, // Takes remaining space in the row
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBarBackground: {
        flex: 1, // Bar background takes most space
        height: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 4,
        overflow: 'hidden',
        marginRight: 8, // Space before text
    },
    progressBarForeground: {
        height: '100%',
        borderRadius: 4,
    },
     progressBarText: {
        fontSize: 12,
        color: '#6B7280',
        fontWeight: '500',
        minWidth: 60, // Ensure space for text like "100 (100.0%)"
        textAlign: 'right',
    },

    // Ranked List (Top Locations)
    rankedListContainer: {
        marginTop: 4,
    },
    rankedListItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    rankNumber: {
        fontSize: 13,
        fontWeight: '600',
        color: '#9CA3AF', // Gray-400 for rank
        width: 25, // Fixed width for rank number
        textAlign: 'center',
        marginRight: 10,
    },
    rankedLabel: {
        flex: 1, // Label takes most space
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    rankedValue: {
        fontSize: 14,
        color: '#4B5563',
        fontWeight: '500',
        marginLeft: 10,
    },

     // Insight Box (Used for Age/Registration insights)
     insightBox: {
        backgroundColor: '#F5F3FF', // Light purple background
        borderRadius: 8,
        padding: 12,
        marginTop: 16,
        flexDirection: 'row',
        alignItems: 'flex-start',
        borderLeftWidth: 3,
        borderLeftColor: '#8B5CF6', // Purple accent
    },
    insightIcon: {
        marginRight: 10,
        marginTop: 1,
        color: '#8B5CF6', // Match border color
    },
    insightText: {
        fontSize: 13,
        color: '#581C87', // Dark Purple text
        flex: 1,
        lineHeight: 18,
    },
    insightHighlight: {
        fontWeight: 'bold',
        color: '#581C87',
    },
    viewMoreButton: { // Consistent button style
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center', // Center the button
        marginTop: 16,
        paddingVertical: 8,
        borderRadius: 8,
        backgroundColor: '#F3F4F6', // Subtle background
     },
     viewMoreButtonText: {
         color: '#6366F1',
         fontWeight: '600',
         marginRight: 6,
         fontSize: 14,
     },

    // Keep Recommendation Styles
     recommendationsContainer: { marginHorizontal: 16, marginBottom: 30, marginTop: 24, }, // Added margin top
     recommendationCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, flexDirection: 'row', alignItems: 'center', shadowColor: '#BCCCDC', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2, borderWidth: Platform.OS === 'android' ? 0 : 1, borderColor: '#F3F4F6', },
     recommendationIconBg: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EEF2FF', justifyContent: 'center', alignItems: 'center', marginRight: 12, },
     recommendationContent: { flex: 1, },
     recommendationTitle: { fontSize: 15, fontWeight: '600', color: '#1F2937', marginBottom: 4, },
     recommendationText: { fontSize: 13, color: '#4B5563', lineHeight: 18, marginBottom: 10, },
     recommendationActionButton: { backgroundColor: '#6366F1', borderRadius: 16, paddingVertical: 6, paddingHorizontal: 12, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', },
     recommendationActionButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 12, marginRight: 4, },

});

export default AttendeeDemographicsPage;