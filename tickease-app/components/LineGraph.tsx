// components/LineGraph.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, G, Text as SvgText } from 'react-native-svg';

export default function LineGraph({ data }) {
  // Define chart dimensions
  const chartWidth = 280;
  const chartHeight = 200;
  const paddingLeft = 10;
  const paddingBottom = 40;
  
  // Find max values to scale the chart
  const allValues = data.flatMap(item => [item.tickets, item.visitors]);
  const maxValue = Math.max(...allValues);
  
  // Calculate point positions
  const getXPosition = (index) => {
    return paddingLeft + (index * (chartWidth - paddingLeft) / (data.length - 1));
  };
  
  const getYPosition = (value) => {
    return chartHeight - paddingBottom - ((value / maxValue) * (chartHeight - paddingBottom));
  };
  
  // Generate points for the lines
  const ticketPoints = data.map((item, index) => ({
    x: getXPosition(index),
    y: getYPosition(item.tickets),
  }));
  
  const visitorPoints = data.map((item, index) => ({
    x: getXPosition(index),
    y: getYPosition(item.visitors),
  }));
  
  // Create SVG paths
  const createLinePath = (points) => {
    return points.map((point, index) => 
      (index === 0 ? `M ${point.x} ${point.y}` : `L ${point.x} ${point.y}`)
    ).join(' ');
  };
  
  const ticketPath = createLinePath(ticketPoints);
  const visitorPath = createLinePath(visitorPoints);
  
  return (
    <View style={styles.container}>
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#00CED1' }]} />
          <Text style={styles.legendText}>Tickets sold</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendColor, { backgroundColor: '#FFA500' }]} />
          <Text style={styles.legendText}>Visitors</Text>
        </View>
      </View>
      
      <Svg height={chartHeight} width={chartWidth}>
        {/* Y-axis grid lines (horizontal) */}
        <G>
          {[0, 100, 200, 300, 400].map((value, index) => {
            const y = getYPosition(value);
            return (
              <SvgText 
                key={`y-${index}`} 
                x="5" 
                y={y} 
                fontSize="10" 
                fill="#888"
                textAnchor="start"
              >
                {value}
              </SvgText>
            );
          })}
        </G>
        
        {/* Draw ticket line */}
        <Path
          d={ticketPath}
          stroke="#00CED1"
          strokeWidth="3"
          fill="none"
        />
        
        {/* Draw visitor line */}
        <Path
          d={visitorPath}
          stroke="#FFA500"
          strokeWidth="3"
          fill="none"
        />
        
        {/* Draw points on ticket line */}
        {ticketPoints.map((point, index) => (
          <Circle
            key={`ticket-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#00CED1"
          />
        ))}
        
        {/* Draw points on visitor line */}
        {visitorPoints.map((point, index) => (
          <Circle
            key={`visitor-${index}`}
            cx={point.x}
            cy={point.y}
            r="4"
            fill="#FFA500"
          />
        ))}
        
        {/* X-axis labels */}
        {data.map((item, index) => (
          <SvgText
            key={`x-${index}`}
            x={getXPosition(index)}
            y={chartHeight - 10}
            fontSize="8"
            fill="#888"
            textAnchor="middle"
          >
            {item.time}
          </SvgText>
        ))}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 10,
  },
  legendContainer: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#555',
  },
});
