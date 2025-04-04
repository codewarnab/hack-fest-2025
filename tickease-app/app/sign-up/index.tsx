import React, { useState } from "react";
import {
  Alert,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Animated,
} from "react-native";
import { supabase } from "@/utils/supabase";
import { router } from "expo-router";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const drawerAnimation = new Animated.Value(-200);

  // Function to show the success drawer
  const showSuccessDrawer = () => {
    setShowDrawer(true);
    Animated.timing(drawerAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Hide drawer and redirect after 3 seconds
    setTimeout(() => {
      Animated.timing(drawerAnimation, {
        toValue: -200,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setShowDrawer(false);
        router.push("/account");
      });
    }, 3000);
  };

  async function signUpWithEmail() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        Alert.alert("Sign Up Error", error.message);
      } else {
        // Show success drawer instead of alert
        showSuccessDrawer();
      }
    } catch (error) {
      Alert.alert("Unexpected Error", "Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Success Drawer Notification */}
      {showDrawer && (
        <Animated.View
          style={[
            styles.successDrawer,
            { transform: [{ translateY: drawerAnimation }] },
          ]}
        >
          <View style={styles.successContent}>
            <Text style={styles.successIcon}>✅</Text>
            <View>
              <Text style={styles.successTitle}>Success!</Text>
              <Text style={styles.successMessage}>
                Please check your inbox for email verification
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome</Text>
        <Text style={styles.subText}>Sign up to manage your events</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="email@address.com"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={[styles.signInButton, loading && styles.disabledButton]}
          onPress={signUpWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.signInText}>Sign Up</Text>
          )}
        </TouchableOpacity>

        <View style={styles.signUpContainer}>
          <Text style={styles.accountText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.push("/onboarding/welcome")}>
            <Text style={styles.signUpText}> Sign In!</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEF1F9",
    padding: 24,
  },
  header: {
    marginTop: 60,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  subText: {
    fontSize: 18,
    color: "#666",
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#e1e1e1",
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 12,
    height: 56,
    fontSize: 16,
    color: "#333",
    backgroundColor: "#fff",
  },
  signInButton: {
    backgroundColor: "#6366F1",
    borderRadius: 50,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signInText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signUpContainer: {
    flexDirection: "row",
    justifyContent: "center",
  },
  accountText: {
    color: "#666",
    fontSize: 14,
  },
  signUpText: {
    color: "#6366F1",
    fontSize: 14,
    fontWeight: "600",
  },
  // Success drawer styles
  successDrawer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: "#4CAF50",
    zIndex: 1000,
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  successContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  successIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  successTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  successMessage: {
    color: "#fff",
    fontSize: 14,
  },
});