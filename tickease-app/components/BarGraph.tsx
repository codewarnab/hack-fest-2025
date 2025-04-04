// components/BarGraph.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function BarGraph({ data }) {
  const maxValue = Math.max(...data.map(item => item.value));
  
  return (
    <View style={styles.container}>
      <View style={styles.yAxis}>
        <Text style={styles.axisText}>500</Text>
        <Text style={styles.axisText}>400</Text>
        <Text style={styles.axisText}>300</Text>
        <Text style={styles.axisText}>200</Text>
        <Text style={styles.axisText}>100</Text>
        <Text style={styles.axisText}>0</Text>
      </View>
      
      <View style={styles.graphContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.barContainer}>
            <View style={styles.barWrapper}>
              <View 
                style={[
                  styles.bar, 
                  { 
                    height: `${(item.value / maxValue) * 100}%`,
                    backgroundColor: '#4B0082'
                  }
                ]} 
              />
            </View>
            <Text style={styles.dayText}>{item.day}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 250,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 20,
  },
  yAxis: {
    width: 30,
    height: '100%',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingRight: 5,
  },
  axisText: {
    fontSize: 10,
    color: '#888',
  },
  graphContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '100%',
  },
  barContainer: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: 30,
  },
  barWrapper: {
    width: '100%',
    height: '90%', // Leave room for the day label
    justifyContent: 'flex-end',
  },
  bar: {
    width: 15,
    borderRadius: 2,
  },
  dayText: {
    fontSize: 10,
    marginTop: 5,
    color: '#888',
  },
});

