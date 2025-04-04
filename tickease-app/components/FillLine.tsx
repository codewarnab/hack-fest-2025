// components/FillLine.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function FillLine({ data }) {
  // Calculate total for percentage
  const total = data.reduce((sum, item) => sum + item.percentage, 0);
  
  return (
    <View style={styles.container}>
      <View style={styles.lineContainer}>
        {data.map((item, index) => (
          <View 
            key={index} 
            style={[
              styles.segment, 
              { 
                backgroundColor: item.color,
                width: `${(item.percentage / total) * 100}%`,
              }
            ]} 
          />
        ))}
      </View>
      
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: item.color }]} />
              <Text style={styles.legendText}>{item.device}: {item.percentage}%</Text>
            </View>
          ))}
        </View>
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      padding: 10,
    },
    lineContainer: {
      flexDirection: 'row',
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
      marginBottom: 15,
    },
    segment: {
      height: '100%',
    },
    legendContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    legendItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 15,
      marginBottom: 8,
    },
    legendColor: {
      width: 12,
      height: 12,
      borderRadius: 6,
      marginRight: 5,
    },
    legendText: {
      fontSize: 12,
      color: '#555',
    },
  });