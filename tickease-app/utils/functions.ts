import { supabase } from "@/utils/supabase"

// Define a more specific type based on your table structure
export interface UserProfile {
    name?: string;
    contact_phone?: string;
    bio?: string;
    discovery?: string;
    organizion_name?: string;
}

const updateProfile = async (userId: string, profileData: UserProfile) => {
    // console.log('Starting updateProfile function');
    // console.log('Received userId:', userId);
    // console.log('Received profileData:', profileData);

    const { data: sessionData, error: sessionError } =
        await supabase.auth.getSession();
    if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
    }

    console.log('Session data retrieved:', sessionData);

    const p_user_id = sessionData?.session?.user?.id || null;

    if (p_user_id !== userId) {
        console.error('User ID does not match session user ID');
        return null;
    }

    console.log('User ID matches session user ID');

    // Filter out any properties that aren't in your users table
    const sanitizedData: UserProfile = {
        name: profileData.name,
        contact_phone: profileData.contact_phone,
        bio: profileData.bio,
        discovery: profileData.discovery,
        organizion_name: profileData.organizion_name,
    };

    console.log('Sanitized profile data:', sanitizedData);

    const { data, error } = await supabase
        .from('users')
        .update(sanitizedData)
        .eq('id', userId);
    console.log(data, error);
    if (error) {
        console.error('Error updating profile:', error);
        return null;
    }

    console.log('Profile updated successfully:', data);

    return "success";
}

export default updateProfile;

