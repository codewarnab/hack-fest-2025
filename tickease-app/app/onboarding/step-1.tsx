import { ThemedText } from "@/components/ThemedText";
import { OnBoardingLayout } from "@/components/ui/OnBoardingLayout";
import { useThemeColor } from "../../hooks/useThemeColor";
import React from "react";
import { Image } from "expo-image";
import { View } from "react-native";
import { generalStyles } from "../../styles";
import { router } from "expo-router";

const navigateToTabs = () => {
  router.replace('/(tabs)');
};

export default function OnboardingStepOne() {
  const primary1 = useThemeColor({}, "primary1");
  return (
    <OnBoardingLayout nextBgColor={primary1} nextHref="/onboarding/step-2">
      <View style={generalStyles.container}>
        <Image
          source={require("../../assets/images/analytics.svg")}
          contentFit="contain"
          style={generalStyles.image}
        />
        <View style={generalStyles.textContainer}>
          <ThemedText style={[generalStyles.text, generalStyles.title]}>
            Track ticket sales, analyze audience insights, and boost revenue—all in one app.
          </ThemedText>
        </View>
      </View>
    </OnBoardingLayout>
  );
}
