
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, ChevronLeft, ChevronRight, LogOut, History } from "lucide-react";
import BassLogo from "../shared/BassLogo";
import { ModelType } from "@/types/chat";
import ModelSelector from "./ModelSelector";

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
  // Get most recent sessions for the sidebar (limit to 10)
  const recentSessions = [...sessions]
    .sort((a, b) => b.createdAt - a.createdAt)
    .slice(0, 10);

  return (
    <div>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={onToggleSidebar}
        />
      )}
    
      {/* Sidebar */}
      <div 
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          fixed md:relative z-30 w-64 h-screen bg-chat-sidebar flex flex-col transition-transform duration-300 ease-in-out overflow-hidden
        `}
      >
        {/* Header */}
        <div className="p-4 border-b border-chat-assistant flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BassLogo className="w-8 h-8" />
            <h1 className="text-lg font-semibold text-chat-highlight">BassProChat</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="md:hidden text-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
        
        {/* New Chat Button */}
        <div className="p-2 border-b border-chat-assistant">
          <Button
            onClick={onNewChat}
            variant="outline"
            className="w-full bg-chat-accent text-white hover:bg-chat-accent/80 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            New Chat
          </Button>
        </div>
        
        {/* View History Button */}
        <div className="p-2 border-b border-chat-assistant">
          <Button
            onClick={onViewHistory}
            variant="outline"
            className="w-full bg-chat-assistant text-white hover:bg-chat-assistant/80 flex items-center gap-2"
          >
            <History className="h-4 w-4" />
            View History
          </Button>
        </div>
        
        {/* Model Selector */}
        <div className="p-2 border-b border-chat-assistant">
          <ModelSelector
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
          />
        </div>
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-2">
          {recentSessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className={`w-full text-left p-3 my-1 rounded-md text-sm transition-colors ${
                currentSessionId === session.id 
                  ? "bg-chat-assistant text-white"
                  : "text-chat-accent/80 hover:bg-chat-assistant/50"
              }`}
            >
              {session.title.substring(0, 25)}{session.title.length > 25 ? "..." : ""}
            </button>
          ))}
        </div>
        
        {/* Footer with Logout */}
        <div className="p-2 border-t border-chat-assistant">
          <Button
            variant="ghost"
            onClick={onLogout}
            className="w-full justify-start text-chat-accent/80 hover:bg-chat-assistant/50 hover:text-white"
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>
      
      {/* Toggle button for mobile (shows when sidebar is closed) */}
      <Button
        variant="ghost"
        onClick={onToggleSidebar}
        className={`
          ${!isOpen ? 'flex' : 'hidden'} 
          md:hidden fixed z-20 top-3 left-3 p-1.5 rounded-full bg-chat-accent text-white
        `}
        size="icon"
      >
        <ChevronRight className="h-5 w-5" />
      </Button>
    </div>
  );
};

export default ChatSidebar;
