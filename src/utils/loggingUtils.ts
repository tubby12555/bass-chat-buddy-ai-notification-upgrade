
import { supabase } from "@/integrations/supabase/client";

export const logEventToSupabase = async (
  userId: string,
  eventType: string,
  payload: Record<string, any> = {}
): Promise<void> => {
  try {
    console.log(`Logging event: ${eventType}`, payload);
    const { error } = await supabase
      .from('events')
      .insert({
        user_id: userId,
        type: eventType,
        payload
      });
    
    if (error) {
      console.error(`Error logging event ${eventType}:`, error);
    }
  } catch (err) {
    console.error(`Failed to log event ${eventType}:`, err);
  }
};
