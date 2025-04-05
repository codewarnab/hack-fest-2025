import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from "@/components/ThemedView";
import Account from '../account/index'; // Import the Account component

export default function AccountScreen() {
  // Render the Account component directly
  return (
    <ThemedView style={styles.container}>
      <Account />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});