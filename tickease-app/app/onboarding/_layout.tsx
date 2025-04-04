import { Stack } from "expo-router";
import React from "react";

const OPTION_CONFIG = {
  presentation: "transparentModal" as const,
  animation: "none" as const,
  cardStyle: { backgroundColor: "#FFFFFF" }, // Set a white background color
};

export default function Layout() {
  return (
    <Stack screenOptions={{ headerShown: false, ...OPTION_CONFIG }}>
      <Stack.Screen name="step-1" {...OPTION_CONFIG} />
      <Stack.Screen name="step-2" {...OPTION_CONFIG} />
      <Stack.Screen name="welcome" {...OPTION_CONFIG} />
    </Stack>
  );
}
