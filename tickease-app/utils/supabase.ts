import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://pvohwzaszeoywvrltzwl.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2b2h3emFzemVveXd2cmx0endsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2ODIxMTUsImV4cCI6MjA1OTI1ODExNX0.O5WWcB88Er5heBrKulD5yaQoa0oKcqQinnyfWHllPTI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});
