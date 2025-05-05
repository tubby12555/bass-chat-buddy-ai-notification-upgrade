import React, { useState } from "react";
import { ModelType } from "@/types/chat";
import MobileOverlay from "./sidebar/MobileOverlay";
import MobileTrigger from "./sidebar/MobileTrigger";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarActions from "./sidebar/SidebarActions";
import SessionList from "./sidebar/SessionList";
import { LogOut } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import YouTubeModal from "./YouTubeModal";
import { useToast } from "@/components/ui/use-toast";
import ToolsSection from "./sidebar/ToolsSection";
import SettingsSection from "./sidebar/SettingsSection";

interface Session {
  id: string;
  title: string;
  createdAt: number;
  messages: unknown[];
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
  userId: string;
  onToolClick?: (tool: string) => void;
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
  onViewHistory,
  userId,
  onToolClick
}: ChatSidebarProps) => {
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isYouTubeLoading, setIsYouTubeLoading] = useState(false);

  const handleYouTubeSubmit = async (videoUrl: string) => {
    setIsYouTubeLoading(true);
    try {
      const webhookUrl = "https://n8n.srv728397.hstgr.cloud/webhook/gemini";
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          videoUrl,
          contentType: "youtube"
        })
      });
      if (!res.ok) throw new Error("Failed to submit video");
      toast({ title: "Video submitted!", description: "Waiting for transcript..." });
      setIsYouTubeModalOpen(false);
    } catch (err) {
      toast({ title: "Error", description: "Could not submit video.", variant: "destructive" });
    } finally {
      setIsYouTubeLoading(false);
    }
  };

  // Handler for tool clicks from ToolsSection
  const handleSidebarToolClick = (tool: string) => {
    if (tool === "youtube") {
      setIsYouTubeModalOpen(true);
      return;
    }
    if (onToolClick) onToolClick(tool);
  };

  return (
    <div>
      <MobileOverlay isOpen={isOpen} onClose={onToggleSidebar} />
      
      <div 
        className={`
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} 
          fixed md:relative z-30 w-64 h-screen bg-chat-assistant flex flex-col transition-transform duration-300 ease-in-out overflow-hidden
        `}
      >
        <SidebarHeader onToggleSidebar={onToggleSidebar} />
        
        {/* Chats Section Header */}
        <div className="px-4 py-2 text-white text-opacity-70 font-semibold">
          Chats
        </div>
        
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
        
        {/* Tools Section */}
        <ToolsSection onToolClick={handleSidebarToolClick} />
        
        {/* Settings Section */}
        <SettingsSection onToolClick={onToolClick || (() => {})} />
        
        {/* Sign Out button remains at the bottom */}
        <div className="mt-auto border-t border-chat-assistant">
          <div 
            className="flex items-center px-4 py-3 text-white hover:bg-chat-accent/20 cursor-pointer"
            onClick={onLogout}
          >
            <LogOut size={16} className="mr-2" />
            <span>Sign Out</span>
          </div>
        </div>
      </div>
      
      <MobileTrigger isOpen={isOpen} onToggle={onToggleSidebar} />
      
      {/* YouTube Modal */}
      <Dialog open={isYouTubeModalOpen} onOpenChange={setIsYouTubeModalOpen}>
        <YouTubeModal
          open={isYouTubeModalOpen}
          onOpenChange={setIsYouTubeModalOpen}
          userId={userId}
          onSubmit={handleYouTubeSubmit}
          loading={isYouTubeLoading}
        />
      </Dialog>
      {/* Flux and GPT-4.1 modals are now managed by ChatContainer only */}
    </div>
  );
};

export default ChatSidebar;
