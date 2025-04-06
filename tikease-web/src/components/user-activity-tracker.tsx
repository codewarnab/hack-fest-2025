"use client";

import { useActiveUsers } from '@/hooks/useActiveUser';
import { useEffect } from 'react';

interface UserActivityTrackerProps {
  eventId: string;
}

export default function UserActivityTracker({ eventId }: UserActivityTrackerProps) {
  const { totalActiveUsers, eventActiveUsers } = useActiveUsers(eventId);
  
  useEffect(() => {
    console.log('UserActivityTracker - Rendering with values:', {
      eventId,
      totalActiveUsers,
      eventActiveUsers
    });
  }, [eventId, totalActiveUsers, eventActiveUsers]);
  
  
  return (
    <div className="stats bg-black text-stone-600 p-3 rounded-md mb-4 shadow-sm">
      <p className="text-sm font-medium">Total active users: <span className="font-bold">{totalActiveUsers}</span></p>
      {eventId && (
        <p className="text-sm font-medium">Users in this event: <span className="font-bold">{eventActiveUsers}</span></p>
      )}
    </div>
  );
}