"use client";

import { useEffect } from "react";

interface EventStorageProps {
  eventId: string;
}

export default function EventStorage({ eventId }: EventStorageProps) {
  useEffect(() => {
    console.log("Event ID:", eventId);
    // Save event ID to localStorage when the component mounts
    if (typeof window !== "undefined") {
      localStorage.setItem("EventId", eventId);
      console.log("Event ID saved to localStorage:", eventId);
    }
  }, [eventId]);

  // This component doesn't render anything visible
  return null;
}