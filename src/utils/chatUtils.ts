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
    } catch (error: unknown) {
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
  
  const text = await response.text();
  const data: unknown = text ? JSON.parse(text) : {};
  console.log("Received response from webhook:", data);
  
  // Type guards
  function isArrayOfObjects(val: unknown): val is Array<Record<string, unknown>> {
    return Array.isArray(val) && val.every(item => typeof item === 'object' && item !== null);
  }
  function isObject(val: unknown): val is Record<string, unknown> {
    return typeof val === 'object' && val !== null && !Array.isArray(val);
  }

  // Handle different response formats from n8n
  let assistantMessage = "";
  
  if (isArrayOfObjects(data) && data.length > 0) {
    const first = data[0];
    if ('output' in first && typeof first.output === 'string') {
      assistantMessage = first.output;
    } else if ('content' in first && typeof first.content === 'string') {
      assistantMessage = first.content;
    } else if ('reply' in first && typeof first.reply === 'string') {
      assistantMessage = first.reply;
    } else if (typeof first === 'string') {
      assistantMessage = first;
    } else {
      assistantMessage = JSON.stringify(first);
    }
  } else if (isObject(data) && 'output' in data && typeof data.output === 'string') {
    assistantMessage = data.output;
  } else if (isObject(data) && 'reply' in data && typeof data.reply === 'string') {
    assistantMessage = data.reply;
  } else if (typeof data === 'string') {
    assistantMessage = data;
  } else {
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
    } catch (error: unknown) {
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
