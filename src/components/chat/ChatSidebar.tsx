import React, { useState } from "react";
import { ModelType } from "@/types/chat";
import MobileOverlay from "./sidebar/MobileOverlay";
import MobileTrigger from "./sidebar/MobileTrigger";
import SidebarHeader from "./sidebar/SidebarHeader";
import SidebarActions from "./sidebar/SidebarActions";
import SessionList from "./sidebar/SessionList";
import SidebarFooter from "./sidebar/SidebarFooter";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Youtube, FileText, Image, FolderOpen, Calendar, Settings, User, LogOut } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import YouTubeModal from "./YouTubeModal";
import { useToast } from "@/components/ui/use-toast";

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
  userId: string;
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
  userId
}: ChatSidebarProps) => {
  // State for tracking collapsible sections
  const [toolsOpen, setToolsOpen] = useState(true);
  const [isYouTubeModalOpen, setIsYouTubeModalOpen] = useState(false);
  const [isYouTubeLoading, setIsYouTubeLoading] = useState(false);
  const { toast } = useToast();

  // Handle tool section clicks (placeholder for now)
  const handleToolClick = (tool: string) => {
    if (tool === "youtube") {
      setIsYouTubeModalOpen(true);
      return;
    }
    console.log(`Tool clicked: ${tool}`);
    // Implement actual navigation or action here
  };

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
      // TODO: Start listening for real-time updates here
    } catch (err) {
      toast({ title: "Error", description: "Could not submit video.", variant: "destructive" });
    } finally {
      setIsYouTubeLoading(false);
    }
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
        
        {/* Tools Section - Collapsible */}
        <Collapsible 
          open={toolsOpen} 
          onOpenChange={setToolsOpen}
          className="border-t border-chat-assistant mt-2"
        >
          <div className="flex justify-between items-center px-4 py-2 text-white text-opacity-70 font-semibold cursor-pointer">
            <CollapsibleTrigger className="flex items-center justify-between w-full bg-transparent border-none">
              <span>Tools</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${toolsOpen ? 'transform rotate-180' : ''}`} />
            </CollapsibleTrigger>
          </div>
          
          <CollapsibleContent className="space-y-1">
            {/* YouTube */}
            <div 
              className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
              onClick={() => handleToolClick("youtube")}
            >
              <Youtube size={16} className="mr-2" />
              <span>YouTube</span>
            </div>
            
            {/* Notes */}
            <div 
              className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
              onClick={() => handleToolClick("notes")}
            >
              <FileText size={16} className="mr-2" />
              <span>Notes</span>
            </div>
            
            {/* Images */}
            <div 
              className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
              onClick={() => handleToolClick("images")}
            >
              <Image size={16} className="mr-2" />
              <span>Images</span>
            </div>
            
            {/* Content */}
            <div 
              className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
              onClick={() => handleToolClick("content")}
            >
              <FolderOpen size={16} className="mr-2" />
              <span>Content</span>
            </div>
            
            {/* Calendar */}
            <div 
              className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
              onClick={() => handleToolClick("calendar")}
            >
              <Calendar size={16} className="mr-2" />
              <span>Calendar</span>
            </div>
          </CollapsibleContent>
        </Collapsible>
        
        {/* Settings Section */}
        <div className="border-t border-chat-assistant mt-2">
          <div className="px-4 py-2 text-white text-opacity-70 font-semibold">
            Settings
          </div>
          
          {/* Settings Item */}
          <div 
            className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
            onClick={() => handleToolClick("settings")}
          >
            <Settings size={16} className="mr-2" />
            <span>Settings</span>
          </div>
          
          {/* Profile Item */}
          <div 
            className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
            onClick={() => handleToolClick("profile")}
          >
            <User size={16} className="mr-2" />
            <span>Profile</span>
          </div>
        </div>
        
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
      
      {/* YouTube Modal (to be implemented) */}
      <Dialog open={isYouTubeModalOpen} onOpenChange={setIsYouTubeModalOpen}>
        <YouTubeModal
          open={isYouTubeModalOpen}
          onOpenChange={setIsYouTubeModalOpen}
          userId={userId}
          onSubmit={handleYouTubeSubmit}
          loading={isYouTubeLoading}
        />
      </Dialog>
    </div>
  );
};

export default ChatSidebar;
