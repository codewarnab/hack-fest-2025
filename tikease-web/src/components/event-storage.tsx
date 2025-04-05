"use client";

import { useEffect } from "react";

interface EventStorageProps {
  eventId: string;
}

export default function EventStorage({ eventId }: EventStorageProps) {
  useEffect(() => {
    // Save event ID to localStorage when the component mounts
    if (typeof window !== "undefined") {
      localStorage.setItem("eventId", eventId);
      console.log("Event ID saved to localStorage:", eventId);
    }
  }, [eventId]);

  // This component doesn't render anything visible
  return null;
}