
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from "uuid";
import { supabase } from "@/integrations/supabase/client";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import { Button } from "@/components/ui/button";
import { Loader, LogOut } from "lucide-react";
import { ModelType } from "@/types/chat";

interface ChatContainerProps {
  onLogout: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

interface Session {
  id: string;
  title: string;
  createdAt: number;
  messages: Message[];
}

const ChatContainer = ({ onLogout }: ChatContainerProps) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelType>("qwen");
  const [user, setUser] = useState<any>(null);
  const { toast } = useToast();
  const isMobile = window.innerWidth < 768;

  useEffect(() => {
    if (isMobile) {
      setIsSidebarOpen(false);
    }

    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUser(data.user);
      }
    };

    getUser();

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
          content: "Welcome to BassProChat! How can I assist with your fishing questions today?",
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
      // Send message to webhook
      const SESSION_ID = currentSessionId;
      const USER_ID = user?.id || "anonymous";
      
      const webhookUrl = `https://n8n.srv728397.hstgr.cloud/webhook/${selectedModel}`;
      
      console.log("Sending message to webhook:", {
        userId: USER_ID,
        sessionId: SESSION_ID,
        userMessage: message
      });
      
      const response = await fetch(webhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: USER_ID,
          sessionId: SESSION_ID,
          userMessage: message
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
    if (isMobile) {
      setIsSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      onLogout();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <div className="flex h-screen overflow-hidden bg-chat">
      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={createNewSession}
        isOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-2 border-b border-chat-assistant">
          <Button 
            variant="ghost" 
            size="sm"
            className="md:hidden text-white"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? "Hide Menu" : "Menu"}
          </Button>
          
          <div className="flex items-center ml-auto">
            {isLoading && <Loader className="animate-spin mr-2 h-4 w-4 text-white" />}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={handleLogout}
              className="text-white hover:bg-chat-assistant"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <ChatWindow
          messages={currentSession?.messages || []}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default ChatContainer;
