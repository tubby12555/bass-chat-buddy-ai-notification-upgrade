
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
    document.documentElement.style.setProperty('--sidebar-bg', theme.background);
    document.documentElement.style.setProperty('--sidebar-accent', theme.accent);
    
    // Update tailwind classes
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.accent);
  }, [selectedModel]);

  // We need to make sure the useEffect doesn't return anything
  useEffect(() => {
    // This is just for any additional side effects
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
