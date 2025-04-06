"use client"
import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase'; // Adjust the import based on your project structure
import { ref, onValue, set, onDisconnect, push } from 'firebase/database';
import { v4 as uuidv4 } from 'uuid';

export function useActiveUsers(eventId:any) {
  const [activeUsers, setActiveUsers] = useState(0);
  const [eventUsers, setEventUsers] = useState(0);
  
  useEffect(() => {
    // Skip during SSR
    if (typeof window === 'undefined') return;
    
    console.log('useActiveUsers hook initialized with eventId:', eventId);
    
    // Get or create user ID
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('userId', userId);
      console.log('Created new userId:', userId);
    } else {
      console.log('Using existing userId:', userId);
    }
    
    // Reference to user status
    const userStatusRef = ref(database, `status/${userId}`);
    console.log('User status reference path:', `status/${userId}`);
    
    // Mark user as active and include the eventId if provided
    const userData = {
      active: true,
      lastActive: new Date().toISOString(),
      eventId: eventId
    };
    
    console.log('Setting user data:', userData);
    set(userStatusRef, userData)
      .then(() => console.log('Successfully set user status data'))
      .catch(err => console.error('Error setting user status:', err));
    
    // Set up disconnect handler
    onDisconnect(userStatusRef).update({
      active: false,
      lastActive: new Date().toISOString()
    });
    console.log('Disconnect handler set up');
    
    // Listen for all active users
    const statusRef = ref(database, 'status');
    console.log('Listening for active users at path: status');
    
    const unsubscribe = onValue(statusRef, (snapshot) => {
      console.log('Received status snapshot:', snapshot.exists() ? 'Data exists' : 'No data');
      let totalCount = 0;
      let eventCount = 0;
      
      snapshot.forEach((childSnapshot) => {
        const user = childSnapshot.val();
        console.log('User data:', childSnapshot.key, user);
        if (user.active === true) {
          totalCount++;
          console.log('Found active user, total count:', totalCount);
          // Count users for this specific event
          if (eventId && user.eventId === eventId) {
            eventCount++;
            console.log('User matches current event, event count:', eventCount);
          }
        }
      });
      
      console.log('Setting active users count:', totalCount);
      setActiveUsers(totalCount);
      
      console.log('Setting event users count:', eventCount);
      setEventUsers(eventCount);
    }, (error) => {
      console.error('Error in onValue listener:', error);
    });
    
    // Also log the event attendance if an eventId is provided
    if (eventId) {
      const eventAttendanceRef = ref(database, `events/${eventId}/attendees/${userId}`);
      console.log('Setting event attendance at:', `events/${eventId}/attendees/${userId}`);
      
      set(eventAttendanceRef, {
        joined: new Date().toISOString(),
        active: true
      })
        .then(() => console.log('Successfully set event attendance'))
        .catch(err => console.error('Error setting event attendance:', err));
      
      // Update attendance when user disconnects
      onDisconnect(eventAttendanceRef).update({
        active: false,
        left: new Date().toISOString()
      });
      console.log('Event attendance disconnect handler set up');
    }
    
    // Cleanup
    return () => {
      console.log('Cleaning up useActiveUsers hook');
      unsubscribe();
    };
  }, [eventId]);
  
  console.log('Returning counts - Total active users:', activeUsers, 'Event active users:', eventUsers);
  return { totalActiveUsers: activeUsers, eventActiveUsers: eventUsers };
}

// Add a function to create new events
export function createEvent(eventName, eventDetails = {}) {
  if (typeof window === 'undefined') return null;
  
  console.log('Creating new event:', eventName);
  const eventsRef = ref(database, 'events');
  const newEventRef = push(eventsRef);
  
  set(newEventRef, {
    name: eventName,
    details: eventDetails,
    createdAt: new Date().toISOString()
  })
    .then(() => console.log('Event created successfully with ID:', newEventRef.key))
    .catch(err => console.error('Error creating event:', err));
  
  return newEventRef.key; // Return the auto-generated event ID
}