
import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import DonutChart from '@/components/DonutChart';
import BarGraph from '@/components/BarGraph';
import PieChart from '@/components/PieChart';
import PolarChart from '@/components/PolarChart';
import LineGraph from '@/components/LineGraph';
import Rating from '@/components/Rating';
import FillLine from '@/components/FillLine';
import StatCard from '@/components/StatCard';
import { MaterialIcons } from '@expo/vector-icons';
export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState<'day' | 'month'>('day');
  // Dummy data for age group statistics
  const ageGroupData = [
    { name: 'VIP', value: 15, color: '#4169E1' },
    { name: 'Early Bird', value: 35, color: '#40E0D0' },
    { name: 'GA', value: 40, color: '#FF6B81' },
    { name: 'Food ticket', value: 10, color: '#FFA500' },
  ];

  // Dummy data for tickets sold per day
  const ticketsPerDayData = [
    { day: 'Sun', value: 450 },
    { day: 'Mon', value: 150 },
    { day: 'Tue', value: 300 },
    { day: 'Wed', value: 480 },
    { day: 'Thu', value: 380 },
    { day: 'Fri', value: 400 },
    { day: 'Sat', value: 380 },
  ];

  // Dummy data for language spoken by visitor
  const languageData = [
    { language: 'English', percentage: 30, color: '#2F4F4F' },
    { language: 'Bengali', percentage: 35, color: '#4169E1' },
    { language: 'Marathi', percentage: 20, color: '#FF00FF' },
    { language: 'Hindi', percentage: 15, color: '#FFA500' },
  ];

  // Dummy data for how users found out about the event
  const userSourceData = [
    { source: 'Social Media', value: 30, color: '#FF6347' },
    { source: 'Friends/Family', value: 25, color: '#00BFFF' },
    { source: 'Advertisement', value: 15, color: '#32CD32' },
    { source: 'Other', value: 30, color: '#FFD700' },
  ];

  // Dummy data for user behavior trends
  const userBehaviorData = [
    { time: '11 am - 15 pm', tickets: 100, visitors: 50 },
    { time: '15 pm - 18 pm', tickets: 300, visitors: 200 },
    { time: '18 pm - 20 pm', tickets: 200, visitors: 350 },
    { time: '20 pm - 22 pm', tickets: 350, visitors: 250 },
  ];

  // Dummy data for rating
  const ratingData = {
    average: 9.3,
    totalRatings: 365,
    votingPeople: 95,
  };

  // Dummy data for device used
  const deviceData = [
    { device: 'Desktop', percentage: 80, color: '#4682B4' },
    { device: 'Mobile', percentage: 22, color: '#32CD32' },
    { device: 'Mobile', percentage: 22, color: '#FF69B4' },
    { device: 'Tab', percentage: 22, color: '#FFD700' },
  ];

  const dailyTicketsData = [
    { day: 'Sun', value: 450 },
    { day: 'Mon', value: 150 },
    { day: 'Tue', value: 300 },
    { day: 'Wed', value: 480 },
    { day: 'Thu', value: 380 },
    { day: 'Fri', value: 400 },
    { day: 'Sat', value: 380 },
  ];

  const monthlyTicketsData = [
    { day: 'Week 1', value: 2000 },
    { day: 'Week 2', value: 1800 },
    { day: 'Week 3', value: 2200 },
    { day: 'Week 4', value: 2100 },
  ];
  const statsData = {
    day: {
      ticketsSold: { value: '1,250', percentage: '+15%' },
      totalRevenue: { value: '$12,500', percentage: '+12%' },
    },
    month: {
      ticketsSold: { value: '8,750', percentage: '+25%' },
      totalRevenue: { value: '$87,500', percentage: '+30%' },
    },
  };
  const currentStats = statsData[timeframe];
  const ticketsData = timeframe === 'day' ? dailyTicketsData : monthlyTicketsData;

  // Inline toggle component for day / month switching
  const TimeframeToggle = () => (
    <View style={{ flexDirection: 'row', justifyContent: 'center', marginVertical: 20 }}>
      <TouchableOpacity
        onPress={() => setTimeframe('day')}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: timeframe === 'day' ? '#4169E1' : '#fff',
          borderWidth: 1,
          borderColor: '#4169E1',
          borderRadius: 5,
          marginRight: 10,
        }}
      >
        <Text style={{ color: timeframe === 'day' ? '#fff' : '#4169E1', fontWeight: 'bold' }}>
          Daily
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setTimeframe('month')}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: timeframe === 'month' ? '#4169E1' : '#fff',
          borderWidth: 1,
          borderColor: '#4169E1',
          borderRadius: 5,
        }}
      >
        <Text style={{ color: timeframe === 'month' ? '#fff' : '#4169E1', fontWeight: 'bold' }}>
          Monthly
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statCardWrapper}>
          <StatCard
            title="Tickets Sold"
            value={currentStats.ticketsSold.value}
            percentage={currentStats.ticketsSold.percentage}
            icon={<MaterialIcons name="confirmation-number" size={24} color="#fff" />}
            iconBg="#4169E1"
          />
        </View>
        <View style={styles.statCardWrapper}>
          <StatCard
            title="Total Revenue"
            value={currentStats.totalRevenue.value}
            percentage={currentStats.totalRevenue.percentage}
            icon={<MaterialIcons name="attach-money" size={24} color="#fff" />}
            iconBg="#32CD32"
          />
        </View>
      </View>
      
      <TimeframeToggle />
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Age Group Statistics</Text>
        <View style={styles.card}>
          <DonutChart data={ageGroupData} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tickets sold per day</Text>
        <View style={styles.card}>
          <BarGraph data={ticketsPerDayData} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Language Spoken by Visitor</Text>
        <View style={styles.card}>
          <PieChart data={languageData} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How user found out about the event</Text>
        <View style={styles.card}>
          <PolarChart data={userSourceData} userCount={195} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>User behavior trends</Text>
        <View style={styles.card}>
          <LineGraph data={userBehaviorData} />
        </View>
      </View>
      
     
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Average rating</Text>
        <View style={styles.card}>
          <Rating data={ratingData} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device used by user</Text>
        <View style={styles.card}>
          <FillLine data={deviceData} />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6e9f0',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 15,
  },
  statCardWrapper: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sentimentText: {
    fontSize: 16,
    color: '#444',
    lineHeight: 22,
  },
});