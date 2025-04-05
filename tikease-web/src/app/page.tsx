'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Get the referrer (previous page)
    const referrer = document.referrer;
    const eventId = localStorage.getItem("eventId");
    if (referrer && referrer !== window.location.href) {
      // If there is a referrer and it's not the current page, redirect to it
      window.location.href = referrer;
    } else {
      // If no referrer or same as current page, redirect to a default page
      // You can change this to any default page you prefer
      router.push('/event/' + eventId);
    }
  }, [router]);

  // Return minimal content as this page will redirect immediately
  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Redirecting...</p>
    </div>
  );
}