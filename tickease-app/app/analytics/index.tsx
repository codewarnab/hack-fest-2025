import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { supabase } from '@/utils/supabase';
import DonutChart from '@/components/DonutChart';
import BarGraph from '@/components/BarGraph';
import PieChart from '@/components/PieChart';
import PolarChart from '@/components/PolarChart';
import LineGraph from '@/components/LineGraph';
import Rating from '@/components/Rating';
import FillLine from '@/components/FillLine';
import StatCard from '@/components/StatCard';
import { MaterialIcons } from '@expo/vector-icons';

// Function to fetch real data from the transactions table
async function fetchTicketsPerDayData() {
  const today = new Date();
  const lastWeek = new Date(today);
  lastWeek.setDate(today.getDate() - 7);

  const { data, error } = await supabase
    .from('transactions')
    .select('timestamp, quantity')
    .gte('timestamp', lastWeek.toISOString())
    .lte('timestamp', today.toISOString())
    .eq('status', 'completed');

  if (error) {
    console.error('Error fetching tickets per day data:', error);
    return [];
  }

  // Create an object with all days of the week initialized to 0
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const initialData = days.reduce((acc, day) => ({ ...acc, [day]: 0 }), {});

  // Process data to group by day and sum quantities
  const groupedData = data.reduce((acc, transaction) => {
    const day = new Date(transaction.timestamp).toLocaleDateString('en-US', { weekday: 'short' });
    acc[day] = (acc[day] || 0) + transaction.quantity;
    return acc;
  }, initialData);

  // Convert grouped data into the required format and ensure all days are present
  return days.map(day => ({
    day,
    value: groupedData[day] || 0
  }));
}

// Function to fetch event data from transactions and events tables
async function fetchEventData() {
  // First get all transactions with event_ids
  const { data: transactionData, error: transactionError } = await supabase
    .from('transactions')
    .select(`
      event_id,
      quantity
    `)
    .eq('status', 'completed');

  if (transactionError) {
    console.error('Error fetching transaction data:', transactionError);
    return [];
  }

  // Get all events to map their titles
  const { data: eventsData, error: eventsError } = await supabase
    .from('events')
    .select('id, title');

  if (eventsError) {
    console.error('Error fetching events data:', eventsError);
    return [];
  }

  // Create a map of event ids to titles
  const eventTitles = Object.fromEntries(
    eventsData.map(event => [event.id, event.title])
  );

  // Group transactions by event_id and sum quantities
  const groupedData = transactionData.reduce((acc, transaction) => {
    if (transaction.event_id) {
      acc[transaction.event_id] = (acc[transaction.event_id] || 0) + transaction.quantity;
    }
    return acc;
  }, {});

  // Calculate total for percentage
  const total = Object.values(groupedData).reduce((sum, value) => sum + (value as number), 0);

  // Convert to required format with event titles
  return Object.entries(groupedData).map(([eventId, quantity], index) => {
    const colors = ['#4169E1', '#40E0D0', '#FF6B81', '#FFA500', '#9370DB', '#20B2AA', '#FF69B4'];
    return {
      name: eventTitles[eventId] || 'Unknown Event',
      value: Math.round((quantity as number / total) * 100),
      color: colors[index % colors.length]
    };
  });
}

// Function to fetch real user source data
async function fetchUserSourceData() {
  // Fetch both discovery data and total user count
  const [discoveryData, totalUsersData] = await Promise.all([
    supabase.from('web_users').select('discovery'),
    supabase.from('web_users').select('id', { count: 'exact' })
  ]);

  if (discoveryData.error) {
    console.error('Error fetching user source data:', discoveryData.error);
    return { data: [], totalUsers: 0 };
  }

  // Group users by discovery source
  const groupedData = (discoveryData.data || []).reduce((acc, user) => {
    const source = user.discovery || 'Other';
    acc[source] = (acc[source] || 0) + 1;
    return acc;
  }, {});

  // Calculate total for percentages
  const total = Object.values(groupedData).reduce((sum, value) => sum + (value as number), 0);

  // Define consistent colors for common sources
  const colors = {
    'Social Media': '#FF6347',
    'Friends/Family': '#00BFFF',
    'Advertisement': '#32CD32',
    'Other': '#FFD700',
    'Search Engine': '#9370DB',
    'Email': '#FF69B4',
    'Blog': '#20B2AA'
  };

  // Convert to required format and calculate percentages
  const data = Object.entries(groupedData).map(([source, count]) => ({
    source,
    value: Math.round((count as number / total) * 100),
    color: colors[source] || '#' + Math.floor(Math.random()*16777215).toString(16)
  }));

  return {
    data,
    totalUsers: totalUsersData.count || 0
  };
}

// Function to fetch real device usage data
async function fetchDeviceData() {
  const { data, error } = await supabase
    .from('registrations')
    .select('device');

  if (error) {
    console.error('Error fetching device data:', error);
    return [];
  }

  // Group devices by type and count occurrences
  const groupedData = data.reduce((acc, registration) => {
    // Skip if no device data
    if (!registration.device) return acc;

    // Parse the JSONB device data
    const deviceData = registration.device;
    
    // Determine device type based on isMobile flag
    let deviceType = deviceData.os.split(" ")[0]
    acc[deviceType] = (acc[deviceType] || 0) + 1;
    return acc;
  }, {});

  // Calculate total for percentages
  const total = Object.values(groupedData).reduce((sum, value) => sum + (value as number), 0);

  // Define consistent colors for device types
  const colors = {
    'Android': '#4682B4',
    'Windows': '#32CD32',
    'Linux': '#FF0000',
    'IOS': '#FFD700',
    'Other': '#FF69B4'
  };

  // Convert to required format and calculate percentages
  return Object.entries(groupedData).map(([device, count]) => ({
    device,
    percentage: Math.round((count as number / total) * 100),
    color: colors[device] || '#FF69B4' // Use pink for unknown device types
  }));
}

// Function to fetch real language data from registrations
async function fetchLanguageData() {
  const { data, error } = await supabase
    .from('registrations')
    .select('language');

  if (error) {
    console.error('Error fetching language data:', error);
    return [];
  }

  // Group languages and count occurrences
  const groupedData = data.reduce((acc, registration) => {
    const language = registration.language || 'Other';
    acc[language] = (acc[language] || 0) + 1;
    return acc;
  }, {});

  // Calculate total for percentages
  const total = Object.values(groupedData).reduce((sum, value) => sum + (value as number), 0);

  // Define consistent colors for common languages
  const colors = {
    'English': '#2F4F4F',
    'Bengali': '#4169E1',
    'Hindi': '#FFA500',
    'Marathi': '#FF00FF',
    'Other': '#FF69B4'
  };

  // Convert to required format and calculate percentages
  return Object.entries(groupedData).map(([language, count]) => ({
    language,
    percentage: Math.round((count as number / total) * 100),
    color: colors[language] || '#' + Math.floor(Math.random()*16777215).toString(16) // fallback random color
  }));
}

// Function to fetch real rating data from transactions
async function fetchRatingData() {
  const { data, error } = await supabase
    .from('transactions')
    .select('feedback_rating');

  if (error) {
    console.error('Error fetching rating data:', error);
    return {
      average: 0,
      totalpeople: 0,
      votingPeople: 0
    };
  }

  const totalpeople = data.length;
  const votingEntries = data.filter(entry => entry.feedback_rating !== null);
  const votingPeople = votingEntries.length;
  const totalRating = votingEntries.reduce((sum, entry) => sum + entry.feedback_rating, 0);
  // Convert to 5-point scale and round to 2 decimals
  const average = totalRating/votingPeople;

  return {
    average,
    totalpeople,
    votingPeople
  };
}

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('day');
  const [ticketsPerDayData, setTicketsPerDayData] = useState([]);
  const [eventData, setEventData] = useState([]);
  const [userSourceData, setUserSourceData] = useState([]);
  const [deviceData, setDeviceData] = useState([]);
  const [languageData, setLanguageData] = useState([]);
  const [ratingData, setRatingData] = useState({
    average: 0,
    totalRatings: 0,
    votingPeople: 0
  });
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    async function loadData() {
      const [ticketData, eventData, sourceData, devicesData, langData, ratings] = await Promise.all([
        fetchTicketsPerDayData(),
        fetchEventData(),
        fetchUserSourceData(),
        fetchDeviceData(),
        fetchLanguageData(),
        fetchRatingData()
      ]);
      
      setTicketsPerDayData(ticketData);
      setEventData(eventData);
      setUserSourceData(sourceData.data);
      setDeviceData(devicesData);
      setLanguageData(langData);
      setRatingData(ratings);
      setTotalUsers(sourceData.totalUsers);
    }

    loadData();
  }, []);

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
          backgroundColor: timeframe === 'day' ? '#4169E1' : '#f5f6fa',
          borderWidth: 1,
          borderColor: '#4169E1',
          borderRadius: 5,
          marginRight: 10,
        }}
      >
        <Text style={{ color: timeframe === 'day' ? '#f5f6fa' : '#4169E1', fontWeight: 'bold' }}>
          Daily
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => setTimeframe('month')}
        style={{
          paddingVertical: 10,
          paddingHorizontal: 20,
          backgroundColor: timeframe === 'month' ? '#4169E1' : '#f5f6fa',
          borderWidth: 1,
          borderColor: '#4169E1',
          borderRadius: 5,
        }}
      >
        <Text style={{ color: timeframe === 'month' ? '#f5f6fa' : '#4169E1', fontWeight: 'bold' }}>
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
        <Text style={styles.sectionTitle}>Types of tickets purchased </Text>
        <View style={styles.card}>
          <DonutChart data={eventData} />
        </View>
      </View>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device used by user</Text>
        <View style={styles.card}>
          <FillLine data={deviceData} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Average rating</Text>
        <View style={styles.card}>
          <Rating data={ratingData} />
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
          <PolarChart data={userSourceData} userCount={totalUsers} />
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
    backgroundColor: '#f5f6fa',
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
    backgroundColor: '#f5f6fa',
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