import { View, Text, StyleSheet } from 'react-native'
import React from 'react'

const Qrcode = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Qrcode deakho baba</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000', // Optional: Set background color for better contrast
  },
  text: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
})

export default Qrcode