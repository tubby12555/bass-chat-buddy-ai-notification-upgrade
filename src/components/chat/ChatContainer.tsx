
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import HistoryViewer from "./HistoryViewer";
import { Button } from "@/components/ui/button";
import { Loader, LogOut } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { useChatTheme } from "@/hooks/useChatTheme";
import { handleLogout } from "@/utils/chatUtils";
import ChatTheme from "./ChatTheme";

interface ChatContainerProps {
  onLogout: () => void;
}

const ChatContainer = ({ onLogout }: ChatContainerProps) => {
  const {
    sessions,
    currentSession,
    currentSessionId,
    isLoading,
    selectedModel,
    handleSendMessage,
    handleSelectSession,
    createNewSession,
    setSelectedModel
  } = useChat();
  
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  
  const {
    isSidebarOpen,
    toggleSidebar,
    setIsSidebarOpen,
    isMobile,
    currentTheme
  } = useChatTheme(selectedModel, currentSessionId);

  return (
    <div className="flex h-screen overflow-hidden bg-chat">
      <ChatTheme currentTheme={currentTheme} />

      <ChatSidebar
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={(sessionId) => {
          handleSelectSession(sessionId);
          if (isMobile) {
            setIsSidebarOpen(false);
          }
        }}
        onNewChat={createNewSession}
        isOpen={isSidebarOpen}
        onToggleSidebar={toggleSidebar}
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        onLogout={() => handleLogout(onLogout, supabase)}
        onViewHistory={() => setIsHistoryOpen(true)}
      />
      
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center p-2 border-b border-chat-assistant">
          <Button 
            variant="ghost" 
            size="sm"
            className="md:hidden text-white"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? "Hide Menu" : "Menu"}
          </Button>
          
          <div className="flex items-center ml-auto">
            {isLoading && <Loader className="animate-spin mr-2 h-4 w-4 text-white" />}
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleLogout(onLogout, supabase)}
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
          modelType={selectedModel}
        />
      </div>

      <HistoryViewer 
        isOpen={isHistoryOpen} 
        onOpenChange={setIsHistoryOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={handleSelectSession}
      />
    </div>
  );
};

export default ChatContainer;
