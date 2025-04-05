import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme, Platform } from "react-native";
import { useMemo } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";

const AnimatedIcon = ({ name, color, size, focused }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          scale: withTiming(focused ? 1.2 : 1, { 
            duration: 200 
          }) 
        }
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
};

export default function TabsLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  
  // Modern color palette
  const colors = useMemo(() => ({
    primary: "#2563eb", // Vibrant blue
    primaryLight: "#3b82f6",
    background: "#ffffff",
    border: "#f1f5f9",
    inactiveTab: "#94a3b8",
    shadow: "rgba(0, 0, 0, 0.05)",
  }), []);
  
  // Calculate bottom padding (use safe area inset or fallback to fixed value)
  const bottomPadding = Math.max(insets.bottom, 10);
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.inactiveTab,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: bottomPadding,
          paddingTop: 10,
          height: 65 + bottomPadding, // Adjust height to account for padding
          elevation: 0,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          position: 'absolute', // To ensure it stays at the bottom
          bottom: 0,
          left: 0,
          right: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "500",
          marginTop: 2,
        },
        // Subtle animation on tab transition
        tabBarHideOnKeyboard: true,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Events",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name="calendar" size={size} color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: "Account",
          headerShown: false,
          tabBarIcon: ({ color, size, focused }) => (
            <AnimatedIcon name="person" size={size} color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}