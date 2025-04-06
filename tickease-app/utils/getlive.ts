import { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from './firebase'; // Update this path

export function useEventUserCount(eventId: string | null) {
  const [userCount, setUserCount] = useState(0);

  useEffect(() => {
    if (!eventId) {
      setUserCount(0);
      return;
    }

    // Reference to the event's attendees
    const eventAttendeesRef = ref(database, `events/${eventId}/attendees`);
    
    // Set up listener for attendees
    const unsubscribe = onValue(eventAttendeesRef, (snapshot) => {
      if (!snapshot.exists()) {
        setUserCount(0);
        return;
      }
      
      // Count active users in this event
      let count = 0;
      snapshot.forEach((childSnapshot) => {
        const userData = childSnapshot.val();
        if (userData && userData.active === true) {
          count++;
        }
      });
      
      setUserCount(count);
    });
    
    // Clean up the listener when component unmounts or eventId changes
    return () => unsubscribe();
  }, [eventId]);

  return userCount;
}