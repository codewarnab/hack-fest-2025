import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path, Circle } from 'react-native-svg';

export default function Rating({ data }) {
  const { average, totalRatings, votingPeople } = data;
  
  // Calculate percentage for the progress arc
  const percentage = (average / 10) * 100;
  
  // Arc parameters
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  
  // Always use full circle
  const startAngle = -Math.PI / 2; // Start from top
  const endAngle = startAngle + 2 * Math.PI; // Full circle
  
  // Calculate path
  const getArcPath = (startAngle, endAngle, radius) => {
    const startX = size / 2 + radius * Math.cos(startAngle);
    const startY = size / 2 + radius * Math.sin(startAngle);
    const endX = size / 2 + radius * Math.cos(endAngle);
    const endY = size / 2 + radius * Math.sin(endAngle);
    
    // For full circle, we need largeArcFlag = 1
    return `M ${startX} ${startY} A ${radius} ${radius} 0 1 1 ${endX} ${endY}`;
  };
  
  // Calculate filled path based on percentage
  const progressAngle = startAngle + (2 * Math.PI * percentage) / 100;
  const bgPath = getArcPath(startAngle, endAngle, radius);
  const progressPath = getArcPath(startAngle, progressAngle, radius);
  
  // ...existing code...
  return (
    <View style={styles.container}>
      <View style={styles.ratingInfo}>
        <View style={styles.ratingBlock}>
          <Text style={styles.ratedBy}>Rated by</Text>
          <Text style={styles.ratingCount}>{totalRatings} people</Text>
        </View>
        
        <View style={styles.ratingBlock}>
          <Text style={styles.ratedBy}>Voting by</Text>
          <Text style={styles.ratingCount}>{votingPeople} people</Text>
        </View>
      </View>
      
      <View style={styles.ratingValueContainer}>
        <Svg height={size} width={size}>
          <Path
            d={bgPath}
            stroke="#E0E0E0"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          <Path
            d={progressPath}
            stroke="#4B0082"
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
        </Svg>
        <View style={styles.ratingValueOverlay}>
          <Text style={styles.ratingValue}>{average}</Text>
          <Text style={styles.ratingLabel}>Average Rating</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 10,
  },
  ratingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  ratingBlock: {
    backgroundColor: '#E0E6FA',
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  ratedBy: {
    fontSize: 12,
    color: '#888',
  },
  ratingCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#444',
  },
  ratingValueContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  ratingValueOverlay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#4B0082',
  },
  ratingLabel: {
    fontSize: 12,
    color: '#888',
  },
});
