import React, { useState, useEffect, useCallback } from "react";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "./ChatWindow";
import YouTubeModal from "./YouTubeModal";
import PwnedHistoryViewer from "./PwnedHistoryViewer";
import ContentSection from "./ContentSection";
import FluxImageGenModal from "@/components/gallery/FluxImageGenModal";
import Gpt4ImageGenModal from "@/components/gallery/Gpt4ImageGenModal";
import { useTheme } from "next-themes";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { logEventToSupabase } from "@/utils/loggingUtils";
import { ModelType } from "@/types/chat";

interface ChatContainerProps {
  onLogout: () => void;
}

const ChatContainer = ({ onLogout }: ChatContainerProps) => {
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isContentSectionOpen, setIsContentSectionOpen] = useState(false);
  const [isFluxImageModalOpen, setIsFluxImageModalOpen] = useState(false);
  const [isGpt4ImageModalOpen, setIsGpt4ImageModalOpen] = useState(false);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const { setTheme } = useTheme();
  const { toast } = useToast();
  const [modelType, setModelType] = useState<ModelType>("gemini");
  const [activeSession, setActiveSession] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user?.id);
          setUserLoggedIn(true);
        } else {
          setUserId(null);
          setUserLoggedIn(false);
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };

    getSession();

    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setUserId(session?.user.id || null);
        setUserLoggedIn(true);
      } else if (event === 'SIGNED_OUT') {
        setUserId(null);
        setUserLoggedIn(false);
      }
    });
  }, []);

  const handleToolClick = (tool: string) => {
    switch (tool) {
      case "youtube":
        setIsYouTubeModalOpen(true);
        break;
      case "notes":
        toast({
          title: "Coming Soon",
          description: "This feature is under development.",
        });
        break;
      case "calendar":
        toast({
          title: "Coming Soon",
          description: "This feature is under development.",
        });
        break;
      case "content":
        setIsContentSectionOpen(true);
        break;
      case "gen-image-flux":
        setIsFluxImageModalOpen(true);
        break;
      case "gen-image-gpt4":
        setIsGpt4ImageModalOpen(true);
        break;
      case "images":
        window.location.href = "/images";
        break;
      default:
        console.log(`Tool clicked: ${tool}`);
    }
  };

  const handleThemeChange = (theme: string) => {
    setTheme(theme);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setUserLoggedIn(false);
      onLogout(); // Pass it up to the parent component
      toast({
        title: "Logged out",
        description: "Successfully logged out.",
      });
    } catch (error) {
      console.error("Error logging out:", error);
      toast({
        title: "Logout Failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Function to handle changes in chat model type
  const handleModelChange = (newModel: ModelType) => {
    setModelType(newModel);
    
    // Log model change event if user is authenticated
    if (userLoggedIn && userId) {
      const logEvent = async () => {
        try {
          await supabase
            .from('user_events')
            .insert({
              user_id: userId,
              event_type: 'model_change',
              event_data: { from: modelType, to: newModel, session_id: activeSession?.id },
              created_at: new Date()
            });
        } catch (error) {
          console.error("Failed to log model change:", error);
        }
      };
      logEvent();
    }
  };

  const handleSendMessage = (message: string) => {
    // Placeholder function for ChatWindow
    console.log("Message sent:", message);
    // Add implementation for sending messages
  };

  const onNewSession = () => {
    // Implementation for creating a new session
    console.log("Creating new session");
    setActiveSession({ id: Date.now().toString(), messages: [] });
  };

  return (
    <div className="flex flex-col h-dvh lg:flex-row">
      <ChatSidebar
        sessions={[]}
        currentSessionId={activeSession?.id || ""}
        onSelectSession={() => {}}
        onNewChat={onNewSession}
        isOpen={isMobileMenuOpen}
        onToggleSidebar={() => setMobileMenuOpen(!isMobileMenuOpen)}
        selectedModel={modelType}
        onSelectModel={handleModelChange}
        onLogout={handleLogout}
        onViewHistory={() => {}}
        userId={userId || ""}
      />
      
      <ChatWindow
        messages={messages}
        onSendMessage={handleSendMessage}
        isLoading={isLoading}
        modelType={modelType}
      />
      
      {/* Modals */}
      <YouTubeModal
        open={isYouTubeModalOpen}
        onOpenChange={setIsYouTubeModalOpen} 
        userId={userId || ""}
        onSubmit={async () => {}}
        loading={false}
      />
      
      {/* Fix by passing all required props to PwnedHistoryViewer */}
      <PwnedHistoryViewer 
        userId={userId || ""}
        onSelectSession={() => {}}
        currentSessionId=""
      />
      
      <ContentSection 
        isOpen={isContentSectionOpen} 
        onOpenChange={setIsContentSectionOpen}
        userId={userId || ""}
      />
      
      <FluxImageGenModal
        open={isFluxImageModalOpen}
        onOpenChange={setIsFluxImageModalOpen}
        userId={userId || ""}
      />
      
      <Gpt4ImageGenModal
        open={isGpt4ImageModalOpen}
        onOpenChange={setIsGpt4ImageModalOpen}
        userId={userId || ""}
      />
    </div>
  );
};

export default ChatContainer;
