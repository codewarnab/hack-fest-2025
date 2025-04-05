"use client";
import { useEffect, useState } from 'react';
import { createClient } from '../../utils/supabase/client'; // Correct import path

export default function UserCounter() {
  const [userCount, setUserCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  
  useEffect(() => {
    // Generate a unique session ID for this user
    const sessionId = Math.random().toString(36).substring(2, 15);
    let interval: NodeJS.Timeout;
    let countSubscription: any;
    
    // Function to remove the user's session
    const removeSession = async () => {
      try {
        await supabase
          .from('active_sessions')
          .delete()
          .eq('session_id', sessionId);
        console.log('User session removed');
      } catch (err) {
        console.error('Error removing session:', err);
      }
    };
    
    // Handle page close/refresh events
    const handlePageHide = () => {
      removeSession();
    };
    
    const handleBeforeUnload = () => {
      removeSession();
    };
    
    // Register event listeners for page exit
    window.addEventListener('pagehide', handlePageHide);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // For Safari and older browsers
    window.addEventListener('unload', handlePageHide);
    
    const setupUserCounter = async () => {
      try {
        // Insert this user session into the active_sessions table
        await supabase
          .from('active_sessions')
          .insert([
            { 
              session_id: sessionId, 
              last_seen: new Date().toISOString(),
            }
          ]);
        
        // Initial fetch of the count
        const { data, error: countError } = await supabase
          .from('active_sessions')
          .select('*', { count: 'exact' });
        
        if (countError) {
          console.error('Error fetching initial count:', countError);
          setError('Failed to fetch visitor count');
        } else {
          setUserCount(data?.length || 0);
        }
        
        // Set up a real-time subscription to the active_sessions table
        countSubscription = supabase
          .channel('active_sessions_changes')
          .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'active_sessions' }, 
            async () => {
              // On any change to active_sessions, refetch the count
              const { data: refreshData, error: refreshError } = await supabase
                .from('active_sessions')
                .select('*', { count: 'exact' });
              
              if (!refreshError) {
                setUserCount(refreshData?.length || 0);
              }
            })
          .subscribe();
        
        // Setup an interval to update the last_seen timestamp
        interval = setInterval(async () => {
          await supabase
            .from('active_sessions')
            .update({ last_seen: new Date().toISOString() })
            .eq('session_id', sessionId);
        }, 60000); // Every minute
      } catch (err) {
        console.error('Error in UserCounter setup:', err);
        setError('Failed to initialize visitor counter');
      }
    };
    
    setupUserCounter();
    
    // Clean up function
    return () => {
      // Remove event listeners
      window.removeEventListener('pagehide', handlePageHide);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handlePageHide);
      
      // Clean up when component unmounts
      if (interval) clearInterval(interval);
      if (countSubscription) countSubscription.unsubscribe();
      
      // Remove this session
      removeSession();
    };
  }, []);
  
  if (error) {
    return (
      <div className="user-counter user-counter-error">
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="user-counter">
      <p>Current visitors: {userCount}</p>
    </div>
  );
}