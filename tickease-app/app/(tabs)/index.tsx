import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedView } from "@/components/ThemedView";
import MyEvents from '../eventlanding/index'; // Import the MyEvents component

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <MyEvents />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});