import { supabase } from "@/utils/supabase"
import AsyncStorage from '@react-native-async-storage/async-storage';


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





const initializeEvent = async (
    userId: string,
    title: string,
    description: string,
    eventDate: string,
    eventTime: string,
    location: string,
    category: string,
    tags: string[],
    social_links: {
        linkedin?: string;
        twitter?: string;
        instagram?: string;
        facebook?: string;
        youtube?: string;
        website?: string;
    },
    image?: string,
) => {
    // Step 1: Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
    }

    const p_user_id = sessionData?.session?.user?.id || null;

    // Step 2: Verify user
    if (p_user_id !== userId) {
        console.error('User ID does not match session user ID');
        return null;
    }



    // Step 3: Prepare data (sanitize + format dates)
    const sanitizedData = {
        user_id: userId,
        title,
        description,
        eventDate,
        eventTime,
        venue: location,
        category,
        tags,
        social_links,
        image
    };

    // Step 4: Insert into Supabase
    const { data, error } = await supabase
        .from('events')
        .insert([sanitizedData])
        .select();

    if (error) {
        console.error('Error inserting event:', error);
        return null;
    }

    const insertedEvent = data?.[0];

    // Step 5: Store in AsyncStorage
    try {
        await storeWithExpiry(`event_${insertedEvent.id}`, insertedEvent, 1000 * 60 * 60 * 24); // expires in 24 hrs
        console.log('Event stored in AsyncStorage');
    } catch (storageError) {
        console.error('Error saving to AsyncStorage:', storageError);
    }

    return "success";
};



interface Question {
    id: number;
    title: string;
    fields: string[];
}


const updateEvent = async (eventId: string, questionData: Question[]) => {
    // Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
    }

    if (!questionData || !Array.isArray(questionData)) {
        console.error('Invalid question data');
        return null;
    }

    // Update only the form_Schema field
    const { data, error } = await supabase
        .from('events')
        .update({ form_Schema: questionData })
        .eq('id', eventId)
        .select();

    if (error) {
        console.error('Error updating event form schema:', error);
        return null;
    }

    console.log('Event form schema updated successfully:', data);
    return "success";
};

interface Ticket {
    id: string;
    label: string;
    maxQuantity: number;
    price: number;
    description: string;
    addonOptions?: {
        id: string;
        label: string;
        price: number;
        description: string;
    }[];
}


const createTickets = async (eventId: string, tickets: Ticket[]) => {
    // Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
        console.error('Error getting session:', sessionError);
        return null;
    }

    if (!tickets || !Array.isArray(tickets)) {
        console.error('Invalid ticket data');
        return null;
    }

    // Prepare ticket data for insertion
    const ticketsToInsert = tickets.map(ticket => ({
        event_id: eventId,
        label: ticket.label,
        price: ticket.price,
        description: ticket.description,
        max_quantity: ticket.maxQuantity,
        addonOptions: ticket.addonOptions || []
    }));

    // Insert tickets into the tickets table
    const { data, error } = await supabase
        .from('tickets')
        .insert(ticketsToInsert)
        .select();

    if (error) {
        console.error('Error creating tickets:', error);
        return null;
    }

    console.log('Tickets created successfully:', data);
    return "success";
};

// Final Ticket Page Data(Fixed Fields + Promo Codes)-- -
//         (NOBRIDGE) LOG[
//             {
//                 "id": "ticket_1743831527192",
//                 "label": "Gdud",
//                 "maxQuantity": 64,
//                 "price": 5,
//                 "description": "Bdhdhf",
//                 "addonOptions": [
//                     {
//                         "id": "addon_1743831529068",
//                         "label": "Hshd",
//                         "price": 64,
//                         "description": ""
//                     },
//                     {
//                         "id": "addon_1743831539849",
//                         "label": "",
//                         "price": 0,
//                         "description": ""
//                     }
//                 ]
//             }
//         ]
//             (NOBRIDGE) LOG-------------------------------------------------------

export { updateProfile, initializeEvent, updateEvent, createTickets };


const storeWithExpiry = async (key: string, value: any, ttlInMs: number) => {
    const now = Date.now();
    const item = {
        value,
        expiry: now + ttlInMs
    };
    await AsyncStorage.setItem(key, JSON.stringify(item));
};


const getWithExpiry = async (key: string) => {
    const itemStr = await AsyncStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    const now = Date.now();

    if (now > item.expiry) {
        await AsyncStorage.removeItem(key);
        return null;
    }

    return item.value;
};


// (NOBRIDGE) LOG  Selected Question Sets: [
//     {
//         "id": 1,
//         "title": "Personal Information",
//         "fields": [
//             "Name",
//             "Email address",
//             "Phone number"
//         ]
//     },
//     {
//         "id": 2,
//         "title": "Location Details",
//         "fields": [
//             "Address",
//             "City",
//             "State",
//             "Postal code",
//             "Country"
//         ]
//     },
//     {
//         "id": 3,
//         "title": "Demographics",
//         "fields": [
//             "Date of birth",
//             "Gender",
//             "Occupation",
//             "Company/Organization Name",
//             "Interests"
//         ]
//     }
// ]