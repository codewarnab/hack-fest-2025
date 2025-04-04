import { OnBoardingLayout } from "@/components/ui/OnBoardingLayout";
import { useThemeColor } from "@/hooks/useThemeColor";
import { generalStyles } from "@/styles";
import React, { useRef, useEffect } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function OnboardingStepTwo() {
  const primary1 = useThemeColor({}, "primary1");
  const primary2 = useThemeColor({}, "primary2");

  // Animated values for cards
  const cardOneAnim = useRef(new Animated.Value(50)).current;
  const cardTwoAnim = useRef(new Animated.Value(50)).current;
  const cardThreeAnim = useRef(new Animated.Value(50)).current;
  const cardOpacityAnim = useRef(new Animated.Value(0)).current;

  // Run animations when component mounts
  useEffect(() => {
    // Animate the cards
    Animated.stagger(200, [
      Animated.parallel([
        Animated.timing(cardOpacityAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(cardOneAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(cardTwoAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(cardThreeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <OnBoardingLayout nextBgColor={primary2} bgColor={primary1} nextText="START" nextHref="/onboarding/welcome" complete>
      <View style={generalStyles.container}>
        <View style={generalStyles.textContainer}>
          <Text style={[generalStyles.text, generalStyles.titleBold]}>
            Stay Ahead with Live Sales & Smart Alerts
          </Text>
          <Text style={[generalStyles.text, generalStyles.description]}>
            Monitor ticket sales in real-time, get automated recommendations, and optimize your marketing instantly.
          </Text>
        </View>

        <View style={styles.dashboardContainer}>
          {/* Dashboard Cards */}
          <Animated.View
            style={[
              styles.card,
              styles.cardPrimary,
              {
                opacity: cardOpacityAnim,
                transform: [{ translateY: cardOneAnim }]
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <Feather name="trending-up" size={20} color="#5E60CE" />
              <Text style={styles.cardTitle}>Ticket Sales</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardValue}>1,248</Text>
              <View style={styles.cardStats}>
                <Feather name="arrow-up" size={14} color="#10B981" />
                <Text style={styles.cardStatsText}>+12.5%</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.card,
              styles.cardSecondary,
              {
                opacity: cardOpacityAnim,
                transform: [{ translateY: cardTwoAnim }]
              }
            ]}
          >
            <View style={styles.cardHeader}>
              <Feather name="users" size={20} color="#64DFDF" />
              <Text style={styles.cardTitle}>Attendees</Text>
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardValue}>856</Text>
              <View style={styles.cardStats}>
                <Feather name="arrow-up" size={14} color="#10B981" />
                <Text style={styles.cardStatsText}>+8.3%</Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View
            style={[
              styles.notificationCard,
              {
                opacity: cardOpacityAnim,
                transform: [{ translateY: cardThreeAnim }]
              }
            ]}
          >
            <View style={styles.notificationHeader}>
              <Feather name="bell" size={16} color="#FF9F1C" />
              <Text style={styles.notificationTitle}>Smart Alert</Text>
            </View>
            <Text style={styles.notificationText}>
              Ticket sales are trending 20% higher than your last event. Consider adding more VIP options!
            </Text>
          </Animated.View>
        </View>
      </View>
    </OnBoardingLayout>
  );
}

const styles = StyleSheet.create({
  dashboardContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
  },
  card: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPrimary: {
    borderLeftWidth: 4,
    borderLeftColor: '#5E60CE',
  },
  cardSecondary: {
    borderLeftWidth: 4,
    borderLeftColor: '#64DFDF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A2E',
    marginLeft: 8,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  cardValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A2E',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  cardStatsText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#10B981',
    marginLeft: 4,
  },
  notificationCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 159, 28, 0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#270061',
    marginLeft: 8,
  },
  notificationText: {
    fontSize: 14,
    color: '#270061',
    opacity: 0.7,
    fontWeight: '400',
    lineHeight: 20,
  },
});