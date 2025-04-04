import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, G, Circle, Path, Text as SvgText } from 'react-native-svg';

export default function DonutChart({ data }) {
  const radius = 70;
  const strokeWidth = 30; // Width of the donut ring
  const innerRadius = radius - strokeWidth; // Radius of the inner circle
  const circleCircumference = 2 * Math.PI * radius;
  
  // Calculate the center point
  const centerX = 100;
  const centerY = 100;
  
  // Calculate start angle for each segment
  let startAngle = 0;
  
  return (
    <View style={styles.container}>
      <Svg height="200" width="200" viewBox="0 0 200 200">
        <G>
          {data.map((segment, index) => {
            // Each segment gets an equal part of the circle
            const sweepAngle = (segment.value / 100) * 360;
            const endAngle = startAngle + sweepAngle;
            
            // Calculate the SVG path for the segment
            const x1 = centerX + radius * Math.cos((startAngle * Math.PI) / 180);
            const y1 = centerY + radius * Math.sin((startAngle * Math.PI) / 180);
            const x2 = centerX + radius * Math.cos((endAngle * Math.PI) / 180);
            const y2 = centerY + radius * Math.sin((endAngle * Math.PI) / 180);
            
            // Calculate inner arc points
            const x1Inner = centerX + innerRadius * Math.cos((startAngle * Math.PI) / 180);
            const y1Inner = centerY + innerRadius * Math.sin((startAngle * Math.PI) / 180);
            const x2Inner = centerX + innerRadius * Math.cos((endAngle * Math.PI) / 180);
            const y2Inner = centerY + innerRadius * Math.sin((endAngle * Math.PI) / 180);
            
            // Determine if the arc should be drawn in the "large-arc" (> 180 degrees)
            const largeArcFlag = sweepAngle > 180 ? 1 : 0;
            
            // SVG path for donut segment
            const path = `
              M ${x1} ${y1}
              A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}
              L ${x2Inner} ${y2Inner}
              A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x1Inner} ${y1Inner}
              Z
            `;
            
            const currentStartAngle = startAngle;
            startAngle = endAngle;
            
            return (
              <Path
                key={index}
                d={path}
                fill={segment.color}
              />
            );
          })}
        </G>
      </Svg>
      
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.name}</Text>
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
  },
  legendContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: 15,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    marginBottom: 5,
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