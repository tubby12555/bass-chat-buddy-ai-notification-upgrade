import { useState, useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ModelType } from "@/types/chat";
import { sendMessage } from "@/utils/chatUtils";
import { User } from '@supabase/supabase-js';

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface Session {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
}

export const useChat = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();
  const [selectedModel, setSelectedModel] = useState<ModelType>("qwen");

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    };

    getUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe?.();
    };
  }, []);

  // Restore sessions from local storage
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSessions(parsed);
          setCurrentSessionId(parsed[0].id);
        }
      } catch (e) {
        console.error("Error parsing saved sessions:", e);
      }
    }
  }, []);

  // Save sessions to local storage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  // Create new session if none exists
  useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, [sessions]);

  const createNewSession = () => {
    const newSessionId = uuidv4();
    const newSession: Session = {
      id: newSessionId,
      title: "New Chat",
      createdAt: Date.now(),
      messages: [
        {
          id: uuidv4(),
          role: "system",
          content: `Welcome to BassProChat! Using ${selectedModel} model. How can I assist with your fishing questions today?`,
          timestamp: Date.now()
        }
      ]
    };

    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSessionId);
  };

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    
    if (!currentSessionId || !sessions.find(s => s.id === currentSessionId)) {
      createNewSession();
      return;
    }
    
    const userMessage: Message = {
      id: uuidv4(),
      role: "user",
      content: message,
      timestamp: Date.now()
    };
    
    // Update state with user message
    setSessions(prev => prev.map(session => {
      if (session.id === currentSessionId) {
        const updatedMessages = [...session.messages, userMessage];
        return {
          ...session,
          messages: updatedMessages,
          title: session.title === "New Chat" ? message.slice(0, 30) : session.title
        };
      }
      return session;
    }));
    
    try {
      const USER_ID = user?.id || "anonymous";
      const SESSION_ID = currentSessionId;
      
      const assistantMessage = await sendMessage(message, USER_ID, SESSION_ID, selectedModel);
      
      // Update state with assistant response
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [
              ...session.messages,
              {
                id: uuidv4(),
                role: "assistant",
                content: assistantMessage,
                timestamp: Date.now()
              }
            ]
          };
        }
        return session;
      }));
      
    } catch (error) {
      console.error("Error sending message:", error);
      
      // Add error message
      setSessions(prev => prev.map(session => {
        if (session.id === currentSessionId) {
          return {
            ...session,
            messages: [
              ...session.messages,
              {
                id: uuidv4(),
                role: "system",
                content: "Error: Failed to get a response. Please try again.",
                timestamp: Date.now()
              }
            ]
          };
        }
        return session;
      }));
      
      toast({
        title: "Error",
        description: "Failed to get a response. Please check your connection.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return {
    sessions,
    currentSession,
    currentSessionId,
    isLoading,
    selectedModel,
    handleSendMessage,
    handleSelectSession,
    createNewSession,
    setSelectedModel,
    user
  };
};
