// components/PieChart.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Svg, G, Path, Text as SvgText } from 'react-native-svg';

export default function PieChart({ data }) {
  const radius = 80;
  const center = { x: 100, y: 100 };
  
  // Calculate the total to ensure percentages add up to 100%
  const total = data.reduce((sum, item) => sum + item.percentage, 0);
  
  // Calculate start and end angles for each segment
  let startAngle = 0;
  const segments = data.map(item => {
    const angle = (item.percentage / total) * 360;
    const segmentData = {
      ...item,
      startAngle,
      endAngle: startAngle + angle,
    };
    startAngle += angle;
    return segmentData;
  });
  
  // Function to calculate SVG path for a pie segment
  const getPath = (segment) => {
    const startRad = (segment.startAngle * Math.PI) / 180;
    const endRad = (segment.endAngle * Math.PI) / 180;
    
    const startX = center.x + radius * Math.cos(startRad);
    const startY = center.y + radius * Math.sin(startRad);
    const endX = center.x + radius * Math.cos(endRad);
    const endY = center.y + radius * Math.sin(endRad);
    
    // Determine if the arc should be drawn in the "large-arc" (> 180 degrees)
    const largeArcFlag = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
    
    return `M ${center.x} ${center.y} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
  };
  
  // Calculate position for percentage text
  const getTextPosition = (segment) => {
    const midAngle = (segment.startAngle + segment.endAngle) / 2;
    const midRad = (midAngle * Math.PI) / 180;
    const x = center.x + (radius * 0.7) * Math.cos(midRad);
    const y = center.y + (radius * 0.7) * Math.sin(midRad);
    return { x, y };
  };
  
  return (
    <View style={styles.container}>
      <Svg height="200" width="200" viewBox="0 0 200 200">
        <G>
          {segments.map((segment, index) => {
            const textPosition = getTextPosition(segment);
            return (
              <React.Fragment key={index}>
                <Path
                  d={getPath(segment)}
                  fill={segment.color}
                />
                <SvgText
                  x={textPosition.x}
                  y={textPosition.y}
                  fontSize="12"
                  fontWeight="bold"
                  fill="white"
                  textAnchor="middle"
                  alignmentBaseline="middle"
                >
                  {segment.percentage}%
                </SvgText>
              </React.Fragment>
            );
          })}
        </G>
      </Svg>
      
      <View style={styles.legendContainer}>
        {data.map((item, index) => (
          <View key={index} style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: item.color }]} />
            <Text style={styles.legendText}>{item.language}</Text>
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

