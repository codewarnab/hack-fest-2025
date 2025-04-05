"use client";

import { useEffect } from "react";

interface EventStorageProps {
  eventId: string;
}

export default function EventStorage({ eventId }: EventStorageProps) {
  useEffect(() => {
    // Save event ID to localStorage when the component mounts
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem("EventId", eventId);
        console.log("Event ID saved to localStorage:", eventId);
      }
    } catch (error) {
      console.error("Failed to save Event ID to localStorage:", error);
    }
  }, [eventId]);

  // This component doesn't render anything visible
  return null;
}