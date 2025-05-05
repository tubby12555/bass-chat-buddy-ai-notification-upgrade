import React, { useState, useEffect, useCallback } from "react";
import ChatSidebar from "./sidebar/ChatSidebar";
import ChatWindow from "./ChatWindow";
import YouTubeModal from "./YouTubeModal";
import PwnedHistoryViewer from "./PwnedHistoryViewer";
import ContentSection from "./ContentSection";
import FluxImageGenModal from "./FluxImageGenModal";
import Gpt4ImageGenModal from "./Gpt4ImageGenModal";
import { useTheme } from "next-themes";
import { MobileOverlay } from "@/components/ui/mobile-overlay";
import { handleLogout } from "@/utils/chatUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { logEventToSupabase } from "@/utils/loggingUtils";
import { ModelType } from "@/types/chat";

interface ChatContainerProps {
  activeSession: any;
  onNewSession: () => void;
  setActiveSession: (session: any) => void;
}

const ChatContainer = ({ activeSession, onNewSession, setActiveSession }: ChatContainerProps) => {
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

  useEffect(() => {
    const getSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user?.id);
        setUserLoggedIn(true);
      } else {
        setUserId(null);
        setUserLoggedIn(false);
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
      logEventToSupabase(userId, "model_change", { 
        from: modelType,
        to: newModel,
        session_id: activeSession?.id
      });
    }
  };

  return (
    <div className="flex flex-col h-dvh lg:flex-row">
      <ChatSidebar
        activeSession={activeSession}
        onNewSession={onNewSession}
        setActiveSession={setActiveSession}
        onLogout={handleLogout}
        onToolClick={handleToolClick}
        onThemeChange={handleThemeChange}
        userLoggedIn={userLoggedIn}
        onModelChange={handleModelChange}
        modelType={modelType}
      />
      
      <MobileOverlay isMobileMenuOpen={isMobileMenuOpen} onClose={() => setMobileMenuOpen(false)}>
        <ChatSidebar
          activeSession={activeSession}
          onNewSession={onNewSession}
          setActiveSession={setActiveSession}
          onLogout={handleLogout}
          onToolClick={handleToolClick}
          onThemeChange={handleThemeChange}
          userLoggedIn={userLoggedIn}
          onModelChange={handleModelChange}
          modelType={modelType}
          isMobile={true}
          onMobileClose={() => setMobileMenuOpen(false)}
        />
      </MobileOverlay>
      
      <ChatWindow
        activeSession={activeSession}
        userId={userId}
        onMobileMenuToggle={() => setMobileMenuOpen(true)}
        modelType={modelType}
      />
      
      {/* Modals */}
      <YouTubeModal
        isOpen={isYouTubeModalOpen}
        onOpenChange={setIsYouTubeModalOpen} 
        userId={userId}
      />
      
      {/* Fix by passing only expected props */}
      <PwnedHistoryViewer 
        userId={userId}
      />
      
      <ContentSection 
        isOpen={isContentSectionOpen} 
        onOpenChange={setIsContentSectionOpen}
        userId={userId}
      />
      
      <FluxImageGenModal
        isOpen={isFluxImageModalOpen}
        onOpenChange={setIsFluxImageModalOpen}
        userId={userId}
      />
      
      <Gpt4ImageGenModal
        isOpen={isGpt4ImageModalOpen}
        onOpenChange={setIsGpt4ImageModalOpen}
        userId={userId}
      />
    </div>
  );
};

export default ChatContainer;
