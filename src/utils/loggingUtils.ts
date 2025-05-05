
import { supabase } from "@/integrations/supabase/client";

/**
 * Logs an event to the 'events' table in Supabase
 * @param userId User ID
 * @param eventType Type of event
 * @param eventData Additional data for the event
 */
export const logEventToSupabase = async (
  userId: string, 
  eventType: string, 
  eventData: any
) => {
  if (!userId) return;
  
  try {
    const { error } = await supabase
      .from('events')
      .insert({
        user_id: userId,
        type: eventType,
        payload: eventData,
        created_at: new Date().toISOString()
      });
      
    if (error) {
      console.error("Error logging event:", error);
    }
  } catch (err) {
    console.error("Failed to log event:", err);
  }
};
