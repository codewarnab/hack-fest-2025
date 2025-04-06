import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Path } from 'react-native-svg';

export default function Rating({ data: { average, totalpeople, votingPeople } }) {
  // Calculate percentage for the progress arc (0-5 scale)
  const percentage = Math.min((average / 5) * 100, 100);
  
  // Arc parameters
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Calculate the path for the arc
  const getArcPath = (percentage) => {
    const angle = (percentage / 100) * 360;
    const angleRad = (angle - 90) * Math.PI / 180;
    const x1 = center + radius * Math.cos(-Math.PI / 2);
    const y1 = center + radius * Math.sin(-Math.PI / 2);
    const x2 = center + radius * Math.cos(angleRad);
    const y2 = center + radius * Math.sin(angleRad);
    
    const largeArcFlag = angle <= 180 ? "0" : "1";
    
    return `
      M ${x1} ${y1}
      A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
    `;
  };

  return (
    <View style={styles.container}>
      <View style={styles.ratingInfo}>
        <View style={styles.ratingBlock}>
          <Text style={styles.ratedBy}>Total People</Text>
          <Text style={styles.ratingCount}>{totalpeople}</Text>
        </View>
        
        <View style={styles.ratingBlock}>
          <Text style={styles.ratedBy}>Voting People</Text>
          <Text style={styles.ratingCount}>{votingPeople}</Text>
        </View>
      </View>
      
      <View style={styles.ratingValueContainer}>
        <Svg height={size} width={size}>
          {percentage > 0 && (
            <Path
              d={getArcPath(percentage)}
              stroke="#4B0082"
              strokeWidth={strokeWidth}
              fill="none"
              strokeLinecap="round"
            />
          )}
        </Svg>
        <View style={styles.ratingValueOverlay}>
          <Text style={styles.ratingValue}>{average}/5</Text>
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
