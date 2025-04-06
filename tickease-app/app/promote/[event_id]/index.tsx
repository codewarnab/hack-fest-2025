import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
  Platform,
  Share, // Import React Native's Share API
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import QRCode from 'react-native-qrcode-svg';
import * as Clipboard from 'expo-clipboard'; // Import Clipboard
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import { router } from 'expo-router';

// --- Dummy Data ---
// Simulating data relevant to promotion
const dummyPromoData = {
  eventId: 'hackfest-2025',
  eventName: 'SynthWave Hack Fest 2025',
  eventDescriptionShort: 'Join the most innovative hackathon of the year. Network, learn, and build amazing projects!', // Shorter description for easy sharing
  publicEventUrl: 'https://tickease.events/hackfest-2025', // Example public URL
  bannerImageUrl: 'https://images.unsplash.com/photo-1519671482749-fd09be7acce1?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', // Same banner
  activePromoCodes: 5,
  referralSources: [ // Example referral data (simplified)
    { source: 'X / Twitter', visits: 120, conversions: 15 },
    { source: 'LinkedIn Campaign', visits: 85, conversions: 10 },
    { source: 'Direct Link', visits: 250, conversions: 30 },
  ],
  // Add social media links if available
  socialLinks: {
      twitter: 'https://x.com/SynthWaveHack',
      linkedin: 'https://linkedin.com/company/SynthWaveHack'
  }
};

// --- Reusable UI Components ---

// Section Header (similar to overview, slightly adjusted)
const SectionHeader = ({ title, linkHref, linkText }: { title: string; linkHref?: string; linkText?: string }) => (
  <View style={styles.sectionHeaderContainer}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {linkHref && linkText && (
      <TouchableOpacity onPress={() => router.push('/eventlanding')}>
        <Text style={styles.viewDetailsText}>{linkText}</Text>
      </TouchableOpacity>
    )}
  </View>
);

// Action Button for specific tasks
const ActionButton = ({ iconName, label, onPress, color = '#6366F1' }: {
  iconName: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  color?: string;
}) => (
  <TouchableOpacity style={[styles.actionButton, { borderColor: color }]} onPress={onPress} activeOpacity={0.7}>
    <Ionicons name={iconName} size={20} color={color} />
    <Text style={[styles.actionButtonText, { color: color }]}>{label}</Text>
  </TouchableOpacity>
);

// Social Share Button
const SocialShareButton = ({ platform, onPress }: { platform: 'logo-twitter' | 'logo-linkedin' | 'logo-facebook' | 'share-social'; onPress: () => void }) => {
    let platformColor = '#1DA1F2'; // Default Twitter Blue
    if (platform === 'logo-linkedin') platformColor = '#0A66C2'; // LinkedIn Blue
    if (platform === 'logo-facebook') platformColor = '#1877F2'; // Facebook Blue
    if (platform === 'share-social') platformColor = '#64748B'; // Generic Grey

    return (
        <TouchableOpacity style={[styles.socialButton, { backgroundColor: platformColor }]} onPress={onPress} activeOpacity={0.8}>
            <Ionicons name={platform} size={22} color="#FFFFFF" />
        </TouchableOpacity>
    );
}


// --- Main Component ---

const EventPromotionPage = () => {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ event_id?: string }>();
  const eventId = params.event_id || dummyPromoData.eventId;

  // Using dummy data
  const promoData = dummyPromoData;
  const eventName = promoData.eventName || 'Event Promotion';

  // --- Action Handlers ---
  const copyToClipboard = async (text: string, type: string) => {
    await Clipboard.setStringAsync(text);
    Alert.alert(`${type} Copied!`, `The ${type.toLowerCase()} has been copied to your clipboard.`);
  };

  const shareEvent = async () => {
    try {
      const result = await Share.share({
        // message: `${promoData.eventName}: ${promoData.eventDescriptionShort} \nCheck it out: ${promoData.publicEventUrl}`,
        // title: `Check out ${promoData.eventName}!`, // iOS only
         url: promoData.publicEventUrl // Best practice to share URL on most platforms
      });
      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // shared with activity type of result.activityType
          console.log(`Shared via ${result.activityType}`);
        } else {
          // shared
           console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // dismissed
         console.log('Share dismissed');
      }
    } catch (error: any) {
      Alert.alert('Sharing Error', error.message);
    }
  };

  const shareToPlatform = (platformUrl?: string) => {
      if(!platformUrl) {
          shareEvent(); // Fallback to generic share if platform link missing
          return;
      }
      // Basic implementation: attempt to open platform-specific sharing
      // More robust solutions might involve checking if the app is installed
      // or using platform-specific share SDKs if needed.
      let shareText = encodeURIComponent(`${promoData.eventName}: ${promoData.eventDescriptionShort} ${promoData.publicEventUrl}`);
      let url = platformUrl; // Use pre-defined social links or construct share intents

      // Example for Twitter (X) Web Intent
      if(platformUrl.includes('twitter') || platformUrl.includes('x.com')) {
           url = `https://twitter.com/intent/tweet?text=${shareText}`;
      }
      // Add similar logic for LinkedIn, Facebook etc. if needed, or rely on generic share

      router.push("/eventlanding"); // Or use Linking.openURL(url)
      console.log(`Attempting to share to: ${url}`);
  }


  return (
    <>
      {/* Simple Header: Title only */}
      <Stack.Screen options={{ title: 'Promote Event', headerBackVisible: false }} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header - Optional subtitle */}
        <View style={styles.pageHeader}>
             <Ionicons name="megaphone-outline" size={28} color="#6366F1" style={styles.pageHeaderIcon}/>
            <Text style={styles.pageTitle}>Boost Your Event!</Text>
            <Text style={styles.pageSubtitle}>Tools and insights to maximize reach and ticket sales.</Text>
        </View>

        {/* 1. Quick Sharing Section */}
        <View style={styles.card}>
          <SectionHeader title="Quick Sharing" />
          <Text style={styles.shareLinkText}>{promoData.publicEventUrl}</Text>
          <View style={styles.buttonRow}>
            <ActionButton
              iconName="copy-outline"
              label="Copy Link"
              onPress={() => copyToClipboard(promoData.publicEventUrl, 'Event Link')}
              color="#3B82F6" // Blue
            />
            <ActionButton
              iconName="qr-code-outline"
              label="Show QR"
              onPress={() => Alert.alert( // Simple way to show QR, could be modal
                  "Event QR Code",
                  "Scan to visit the event page.",
                  [{ text: "OK" }]
                )}
                color="#10B981" // Green
            />
           </View>
            <View style={styles.qrPreviewContainer}>
                <QRCode
                    value={promoData.publicEventUrl}
                    size={80} // Smaller preview size
                    color="#111827"
                    backgroundColor="#FFFFFF"
                />
                 <Text style={styles.qrPreviewLabel}>Link QR Code</Text>
            </View>
        </View>

        {/* 2. Social Media Promotion */}
        <View style={styles.card}>
            <SectionHeader title="Social Media Sharing" />
             <Text style={styles.sectionSubtitle}>Quickly share your event on major platforms.</Text>
             <View style={styles.socialButtonRow}>
                  <SocialShareButton platform="logo-twitter" onPress={() => shareToPlatform(promoData.socialLinks?.twitter)} />
                  <SocialShareButton platform="logo-linkedin" onPress={() => shareToPlatform(promoData.socialLinks?.linkedin)} />
                  <SocialShareButton platform="logo-facebook" onPress={() => shareEvent()} />{/* Use generic for FB */}
                  <SocialShareButton platform="share-social" onPress={shareEvent} />{/* Generic Share */}
             </View>
        </View>


        {/* 3. Marketing Assets */}
        <View style={styles.card}>
          <SectionHeader title="Marketing Assets" />
          <Text style={styles.assetLabel}>Short Description:</Text>
          <Text style={styles.assetDescription}>{promoData.eventDescriptionShort}</Text>
          <View style={styles.buttonRow}>
            <ActionButton
              iconName="clipboard-outline"
              label="Copy Description"
              onPress={() => copyToClipboard(promoData.eventDescriptionShort, 'Description')}
              color="#F59E0B" // Amber
            />
             {/* Add a "Download Banner" button - requires backend/storage logic */}
             <ActionButton
              iconName="image-outline"
              label="Get Banner"
              onPress={() => Alert.alert("Feature Coming Soon", "Downloading banner image.")} // Placeholder action
              color="#A855F7" // Purple
            />
          </View>
        </View>

        {/* 4. Discount Codes */}
        <View style={styles.card}>
          <SectionHeader title="Discount Codes" linkHref={`/discounts/${eventId}`} linkText="Manage"/>
          <Text style={styles.sectionSubtitle}>Create and manage promotional codes to boost sales.</Text>
          <View style={styles.insightRow}>
             <Ionicons name="pricetag-outline" size={24} color="#EF4444" style={styles.insightIconLarge}/>
             <View>
                 <Text style={styles.insightValueLarge}>{promoData.activePromoCodes}</Text>
                 <Text style={styles.insightLabel}>Active Codes</Text>
             </View>
          </View>
           {/* <ActionButton
              iconName="add-circle-outline"
              label="Create New Code"
              onPress={() => router.push(`/discounts/${eventId}/create`)} // Navigate to creation page
              color="#EF4444" // Red
            /> */}
        </View>

        {/* 5. Performance Snapshot */}
        <View style={styles.card}>
          <SectionHeader title="Performance Snapshot" linkHref={`/analytics/${eventId}`} />
           <Text style={styles.sectionSubtitle}>Top referral sources driving traffic.</Text>
           {promoData.referralSources.length > 0 ? (
               promoData.referralSources.slice(0, 3).map((source, index) => ( // Show top 3
                 <View key={index} style={styles.referralRow}>
                     <Text style={styles.referralSource}>{index + 1}. {source.source}</Text>
                     <View style={styles.referralStats}>
                         <Text style={styles.referralValue}>{source.visits} Visits</Text>
                         <Text style={styles.referralValue}>{source.conversions} Sales</Text>
                     </View>
                 </View>
               ))
           ) : (
                <Text style={styles.noDataText}>No referral data yet.</Text>
           )}
        </View>

      </ScrollView>
    </>
  );
};

// --- Styles --- (Enhanced for Promotion Focus)
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB', // Consistent light background
  },
  scrollContentContainer: {
    paddingBottom: 40,
    paddingTop: 20, // Add initial padding
  },
  pageHeader: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center', // Center header content
  },
   pageHeaderIcon: {
      marginBottom: 8,
      color: '#8B5CF6', // Violet
   },
  pageTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1F2937', // Darker title
    textAlign: 'center',
  },
   pageSubtitle: {
       fontSize: 15,
       color: '#6B7280',
       textAlign: 'center',
       marginTop: 4,
   },
  card: { // Consistent card styling
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 20,
    padding: 20,
    shadowColor: '#9CA3AF',
    shadowOffset: { width: 0, height: 2 }, // Softer shadow Y offset
    shadowOpacity: 0.08, // More subtle shadow
    shadowRadius: 12, // Wider shadow radius
    elevation: 2,
    borderWidth: Platform.OS === 'android' ? 0 : 1,
    borderColor: '#F3F4F6',
  },
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6', // Lighter separator
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold', // Bolder title
    color: '#111827',
  },
  sectionSubtitle: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 16,
      marginTop: -8,
      lineHeight: 20,
   },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8, // Add horizontal padding for touch area
    borderRadius: 16,
    backgroundColor: '#EEF2FF', // Light indigo bg
  },
  viewDetailsText: {
    fontSize: 13,
    color: '#6366F1',
    fontWeight: '600',
    marginRight: 4,
  },
  // Quick Sharing
  shareLinkText: {
      fontSize: 15,
      color: '#4F46E5', // Use theme color for link
      marginBottom: 16,
      fontWeight: '500',
      textDecorationLine: 'underline', // Indicate it's a link
  },
  buttonRow: {
      flexDirection: 'row',
      justifyContent: 'space-around', // Distribute buttons
      marginTop: 8,
       marginBottom: 16,
  },
  actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      borderWidth: 1.5, // Use border for outline style
      // backgroundColor removed, using border instead
  },
  actionButtonText: {
      marginLeft: 8,
      fontSize: 14,
      fontWeight: '600', // Bolder text
  },
   qrPreviewContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center', // Center QR and label
      marginTop: 10,
      paddingTop: 15,
      borderTopWidth: 1,
      borderTopColor: '#F3F4F6',
   },
   qrPreviewLabel: {
       marginLeft: 15,
       fontSize: 14,
       color: '#6B7280',
       flexShrink: 1, // Allow text to wrap if needed
   },
   // Social Media
    socialButtonRow: {
        flexDirection: 'row',
        justifyContent: 'space-around', // Spread buttons
        alignItems: 'center',
        marginTop: 10,
    },
    socialButton: {
        width: 48,
        height: 48,
        borderRadius: 24, // Circular
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2, },
        shadowOpacity: 0.15,
        shadowRadius: 3.00,
        elevation: 3,
    },
  // Marketing Assets
  assetLabel: {
      fontSize: 14,
      color: '#6B7280',
      marginBottom: 6,
      fontWeight: '500',
  },
  assetDescription: {
      fontSize: 15,
      color: '#374151',
      backgroundColor: '#F9FAFB', // Subtle background
      padding: 12,
      borderRadius: 8,
      marginBottom: 16,
      lineHeight: 21,
  },
  // Discount Codes
   insightRow: {
       flexDirection: 'row',
       alignItems: 'center',
       paddingVertical: 10, // Add some padding
   },
   insightIconLarge: {
       marginRight: 12,
   },
   insightValueLarge: {
       fontSize: 24, // Larger font for key insight
       fontWeight: 'bold',
       color: '#111827',
   },
   insightLabel: { // Reusing from InsightBlock but could be specific
       fontSize: 13,
       color: '#6B7280',
       marginTop: 2,
   },
    // Performance Snapshot
    referralRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
       
    },
    referralSource: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
        flex: 2, // Give more space to source name
    },
    referralStats: {
        flexDirection: 'row',
        flex: 1.5, // Take slightly less space
        justifyContent: 'flex-end', // Align stats to right
    },
    referralValue: {
        fontSize: 14,
        color: '#4B5563',
        marginLeft: 15, // Space between stats
        fontWeight: '500',
        textAlign: 'right',
    },
     noDataText: {
       fontSize: 14,
       color: '#9CA3AF', // Lighter grey for no data
       textAlign: 'center',
       marginTop: 10,
       fontStyle: 'italic',
    },
    // QR Section
     qrSection: { // Combined with base card style
      alignItems: 'center',
    },
    qrContainer: {
      padding: 10,
      backgroundColor: '#FFF',
      borderRadius: 8,
      marginVertical: 15,
      overflow: 'hidden',
       borderWidth: 1,
       borderColor: '#F3F4F6', // Lighter border
    },
    qrHelp: {
      fontSize: 13,
      color: '#6B7280',
      marginTop: 4,
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
       backgroundColor: '#EEF2FF',
    },
    copyLinkText: {
        color: '#6366F1',
        marginLeft: 6,
        fontSize: 14,
        fontWeight: '500',
    },
});

export default EventPromotionPage;