
import { useEffect, useState } from "react";
import { ModelType, MODEL_THEMES } from "@/types/chat";

export const useChatTheme = (selectedModel: ModelType, currentSessionId: string) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Check if mobile on mount and add resize listener
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    
    checkMobile();
    window.addEventListener("resize", checkMobile);
    
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  // Apply theme based on selected model
  useEffect(() => {
    const model = selectedModel;
    const theme = MODEL_THEMES[model];
    
    // Set CSS variables for theme
    document.documentElement.style.setProperty('--chat-bg', theme.background);
    document.documentElement.style.setProperty('--chat-accent', theme.accent);
    document.documentElement.style.setProperty('--chat-highlight', theme.highlight);
    document.documentElement.style.setProperty('--chat-user-msg', theme.messageUser);
    document.documentElement.style.setProperty('--chat-assistant-msg', theme.messageAssistant);
    
    // Update tailwind classes
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.accent);
    
    // Don't return anything here (or return undefined)
  }, [selectedModel]);

  // Fix: This useEffect was incorrectly returning a value instead of a cleanup function
  useEffect(() => {
    // Find previous session with current model logic can stay here
    // But we shouldn't return anything except a cleanup function
    const checkPreviousSessions = () => {
      const savedSessions = localStorage.getItem('chatSessions');
      if (savedSessions) {
        try {
          const parsed = JSON.parse(savedSessions);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const theme = MODEL_THEMES[selectedModel];
            
            // Find the last session with this model
            const lastSessionWithModel = parsed.find(s => 
              s.messages.some(m => m.content.includes(`Using ${theme.name} model`))
            );
            
            // This is just for checking; we don't return anything from this effect
            return lastSessionWithModel?.id;
          }
        } catch (e) {
          console.error("Error parsing saved sessions:", e);
        }
      }
      return null;
    };
    
    // Execute the function but don't return its result
    checkPreviousSessions();
    
    // Either return nothing (undefined) or a cleanup function if needed
  }, [selectedModel, currentSessionId]);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  
  return {
    isMobile,
    isSidebarOpen,
    toggleSidebar,
    setIsSidebarOpen,
    currentTheme: MODEL_THEMES[selectedModel]
  };
};
