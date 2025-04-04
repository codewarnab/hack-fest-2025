import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatCard = ({ title, value, percentage, icon, iconBg }) => {
  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: iconBg }]}>
        {icon}
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        <Text style={[
          styles.percentage,
          { color: percentage.startsWith('+') ? '#32CD32' : '#FF4500' }
        ]}>
          {percentage}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    padding: 10,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    marginLeft: 12,
    flex: 1,
  },
  title: {
    color: '#666',
    fontSize: 14,
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginVertical: 2,
  },
  percentage: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default StatCard;