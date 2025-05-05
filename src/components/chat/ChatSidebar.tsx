
import React from "react";
import { ModelType } from "@/types/chat";
import MobileOverlay from "./sidebar/MobileOverlay";
import MobileTrigger from "./sidebar/MobileTrigger";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarActions from "./sidebar/SidebarActions";
import SessionList from "./sidebar/SessionList";
import SidebarFooter from "./sidebar/SidebarFooter";

interface Session {
  id: string;
  title: string;
  createdAt: number;
  messages: any[];
}

interface ChatSidebarProps {
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggleSidebar: () => void;
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
  onLogout: () => void;
  onViewHistory: () => void;
}

const ChatSidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  isOpen,
  onToggleSidebar,
  selectedModel,
  onSelectModel,
  onLogout,
  onViewHistory
}: ChatSidebarProps) => {
  return (
    <div>
      <MobileOverlay isOpen={isOpen} onClose={onToggleSidebar} />
      
      <div 
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          fixed md:relative z-30 w-64 h-screen bg-chat-sidebar flex flex-col transition-transform duration-300 ease-in-out overflow-hidden
        `}
      >
        <SidebarHeader onToggleSidebar={onToggleSidebar} />
        
        <SidebarActions 
          onNewChat={onNewChat}
          onViewHistory={onViewHistory}
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
        
        <SessionList 
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={onSelectSession}
        />
        
        <SidebarFooter onLogout={onLogout} />
      </div>
      
      <MobileTrigger isOpen={isOpen} onToggle={onToggleSidebar} />
    </div>
  );
};

export default ChatSidebar;
