import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import { ThemedView } from "@/components/ThemedView";
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
  Roboto_900Black,
} from "@expo-google-fonts/roboto";
import { Platform, useColorScheme } from "react-native";
import { SessionProvider } from "@/context/SessionProvider";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  let [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
    Roboto_900Black,
  });

  useEffect(() => {
    console.log("Fonts loaded:", fontsLoaded);
    const setNavBar = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        await NavigationBar.setPositionAsync("absolute");
        await NavigationBar.setBackgroundColorAsync("#ffffff00");
      } catch (e) {
        console.warn("Error setting navigation bar:", e);
      } finally {
        if (fontsLoaded) {
          await SplashScreen.hideAsync();
        }
      }
    };
    if (Platform.OS === "android") {
      setNavBar();
    }
  }, [fontsLoaded]);

  return (
    <SessionProvider>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <ThemedView style={{ flex: 1 }}>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="account/index" />
            <Stack.Screen name="sign-up/index" />
            <Stack.Screen name="eventlanding/index" />
          </Stack>
        </ThemedView>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SessionProvider>
  );
}