
import { useToast } from "@/components/ui/use-toast";
import { ModelType } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";

export const sendMessage = async (
  message: string,
  userId: string,
  sessionId: string,
  modelType: ModelType
): Promise<string> => {
  // Always use the same webhook URL regardless of model
  const webhookUrl = "https://n8n.srv728397.hstgr.cloud/webhook/gemini";
  
  console.log("Sending message to webhook:", {
    userId,
    sessionId,
    userMessage: message,
    modelType // This is the only parameter that changes based on model selection
  });
  
  // Save the user message to Supabase if the model is pwned
  if (modelType === "pwned") {
    try {
      await supabase.from('pwned_chat_data').insert({
        user_id: userId,
        session_id: sessionId,
        content: message,
        model_type: modelType
      });
    } catch (error) {
      console.error("Error saving user message to database:", error);
    }
  }
  
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      sessionId,
      userMessage: message,
      modelType // Send the selected model type to n8n for routing
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Server responded with ${response.status}`);
  }
  
  const data = await response.json();
  console.log("Received response from webhook:", data);
  
  // Handle different response formats from n8n
  let assistantMessage = "";
  
  if (Array.isArray(data) && data.length > 0) {
    // If data is an array, take the first item's output or content
    if (data[0].output) {
      assistantMessage = data[0].output;
    } else if (data[0].content) {
      assistantMessage = data[0].content;
    } else if (data[0].reply) {
      assistantMessage = data[0].reply;
    } else if (typeof data[0] === 'string') {
      assistantMessage = data[0];
    } else {
      assistantMessage = JSON.stringify(data[0]);
    }
  } else if (data.output) {
    // Direct output property
    assistantMessage = data.output;
  } else if (data.reply) {
    // Direct reply property
    assistantMessage = data.reply;
  } else if (typeof data === 'string') {
    // Direct string response
    assistantMessage = data;
  } else {
    // Fallback: stringify the entire response
    assistantMessage = JSON.stringify(data);
  }
  
  // Save the assistant response to Supabase if the model is pwned
  if (modelType === "pwned") {
    try {
      await supabase.from('pwned_chat_data').insert({
        user_id: userId,
        session_id: sessionId,
        content: assistantMessage,
        model_type: modelType
      });
    } catch (error) {
      console.error("Error saving assistant message to database:", error);
    }
  }
  
  return assistantMessage;
};

export const handleLogout = async (
  onLogout: () => void,
  supabase: any
) => {
  try {
    await supabase.auth.signOut();
    onLogout();
  } catch (error) {
    console.error("Error logging out:", error);
  }
};
