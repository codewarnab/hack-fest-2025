import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, Circle, G, Path } from 'react-native-svg';

export default function PolarChart({ data, userCount }) {
  const radius = 90;
  const strokeWidth = 8;
  const center = 110;
  const circumference = 2 * Math.PI * radius;

  // Calculate segments with proper offsets
  let currentOffset = 0;
  const segments = data.map((item) => {
    const segmentLength = (item.value / 100) * circumference;
    const segmentProps = {
      cx: center,
      cy: center,
      r: radius,
      stroke: item.color,
      strokeWidth: strokeWidth,
      strokeDasharray: `${segmentLength} ${circumference - segmentLength}`,
      strokeDashoffset: -currentOffset,
      transform: `rotate(-90, ${center}, ${center})`,
      strokeLinecap: "round",
      fill: "none",
    };
    currentOffset += segmentLength;
    return segmentProps;
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg height="220" width="220" viewBox="0 0 220 220">
          <G>
            {segments.map((props, index) => (
              <Circle key={index} {...props} />
            ))}
          </G>
        </Svg>
        <View style={styles.centerTextContainer}>
          <Text style={styles.userCount}>{userCount}</Text>
          <Text style={styles.userLabel}>Users</Text>
        </View>
      </View>
      
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>
              {item.source} ({item.value}%)
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  chartContainer: {
    position: 'relative',
    width: 220,
    height: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLabel: {
    fontSize: 24,
    color: '#666',
    fontWeight: '500',
  },
  userCount: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
  },
  legendColor: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 8,
  },
  legendText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
});