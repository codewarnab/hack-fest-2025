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
        await storeWithExpiry(`event_id`, insertedEvent.id, 1000 * 60 * 100); // expires in 100 min
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
        .update({ custon_forms: questionData })
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

const uploadImageToSupabase = async (imageFile) => {
    try {
        // Safely get file extension or use default
        let extension = 'jpg';
        if (imageFile.name && typeof imageFile.name === 'string') {
            const nameParts = imageFile.name.split('.');
            if (nameParts.length > 1) {
                extension = nameParts.pop() || 'jpg';
            }
        } else if (imageFile.type) {
            // Try to get extension from MIME type
            extension = imageFile.type.split('/').pop() || 'jpg';
        }

        const fileName = `${Date.now()}.${extension}`;
        const filePath = `event-banners/${fileName}`;

        // Direct upload of the file/blob
        const { data, error } = await supabase.storage
            .from('img')
            .upload(filePath, imageFile, {
                contentType: imageFile.type,
                upsert: true,
            });

        if (error) throw error;

        const { data: publicUrlData } = supabase.storage
            .from('img')
            .getPublicUrl(filePath);

        return {
            success: true,
            publicUrl: publicUrlData.publicUrl,
            filePath: filePath
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Failed to upload image'
        };
    }
};

interface Event {
    id: string;
    title: string;
    description: string;
    venue: string;
    image: string;
    category: string;
    eventDate: string;
    eventTime: string;
    form_schema: any;
    user_id: string;
    [key: string]: any;
}

// Function to validate if an event has all required fields
const isValidEvent = (event: Event) => {
    const requiredFields = [
        'title',
        'description',
        'venue',
        'image',
        'category',
        'eventDate',
        'eventTime',
        'form_schema'
    ];

    return requiredFields.every(field =>
        event[field] !== undefined &&
        event[field] !== null &&
        event[field] !== ''
    );
};

const fetchUserEvents = async () => {
    try {
        // Get the current user session
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
            console.error('Error getting session:', sessionError);
            return { events: [], error: sessionError };
        }

        const userId = sessionData?.session?.user?.id;

        if (!userId) {
            console.error('No user logged in');
            return { events: [], error: new Error('No user logged in') };
        }

        // Query events for the current user only
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('user_id', userId) // Filter events by user_id
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching events:', error);
            return { events: [], error };
        } else {
            // Filter events to only include those with all required fields
            const validEvents = (data || []).filter(isValidEvent);
            return { events: validEvents, error: null };
        }
    } catch (error) {
        console.error('Error:', error);
        return { events: [], error };
    }
};

export { updateProfile, initializeEvent, updateEvent, createTickets, uploadImageToSupabase, fetchUserEvents };

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