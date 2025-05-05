
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Session } from "@/hooks/useChat";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { ModelType } from "@/types/chat";
import { supabase } from "@/integrations/supabase/client";
import BassLogo from "@/components/shared/BassLogo";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Plus,
  MessageSquare,
  Youtube,
  ClipboardList,
  Image,
  FolderOpen,
  Calendar,
  Settings,
  User,
  ChevronDown,
  ChevronRight,
  History,
  LogOut,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface EnhancedSidebarProps {
  sessions: Session[];
  currentSessionId: string;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
  onLogout: () => void;
  onViewHistory: () => void;
  userId?: string;
}

const EnhancedSidebar = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewChat,
  selectedModel,
  onSelectModel,
  onLogout,
  onViewHistory,
  userId
}: EnhancedSidebarProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isToolsCollapsed, setIsToolsCollapsed] = useState(false);
  const { toast } = useToast();

  const handleProfileClick = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Not logged in",
          description: "You need to be logged in to edit your profile",
          variant: "destructive"
        });
        return;
      }
      
      setIsProfileOpen(true);
    } catch (error) {
      console.error("Error getting user:", error);
      toast({
        title: "Error",
        description: "Could not access user information",
        variant: "destructive"
      });
    }
  };

  // Tools coming soon toast
  const handleToolClick = (tool: string) => {
    toast({
      title: `${tool} Coming Soon`,
      description: `The ${tool} feature will be available in a future update.`,
    });
  };

  return (
    <SidebarProvider>
      <div className="flex h-screen">
        <Sidebar variant="sidebar" collapsible="icon">
          <SidebarHeader>
            <div 
              className="flex items-center gap-2 cursor-pointer p-3" 
              onClick={handleProfileClick}
              title="Edit Profile"
            >
              <BassLogo className="w-8 h-8" />
              <h1 className="text-lg font-semibold text-sidebar-foreground">BassProChat</h1>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {/* New Chat Button */}
            <SidebarGroup>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={onNewChat}
                    tooltip="New Chat"
                    className="bg-chat-accent text-white hover:bg-chat-accent/80"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span>New Chat</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Chat History */}
            <SidebarGroup>
              <SidebarGroupLabel>Chats</SidebarGroupLabel>
              <SidebarMenu>
                {sessions.map((session) => (
                  <SidebarMenuItem key={session.id}>
                    <SidebarMenuButton 
                      isActive={session.id === currentSessionId}
                      onClick={() => onSelectSession(session.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      <span className="truncate">
                        {session.title.substring(0, 25)}
                        {session.title.length > 25 ? "..." : ""}
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton onClick={onViewHistory} tooltip="View History">
                    <History className="h-4 w-4 mr-2" />
                    <span>View History</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>

            {/* Tools Section (Collapsible) */}
            <Collapsible
              open={!isToolsCollapsed}
              onOpenChange={(open) => setIsToolsCollapsed(!open)}
            >
              <CollapsibleTrigger asChild>
                <div className="flex items-center justify-between px-2 py-1 cursor-pointer">
                  <SidebarGroupLabel asChild>
                    <div>Tools</div>
                  </SidebarGroupLabel>
                  {isToolsCollapsed ? (
                    <ChevronRight className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroup>
                  <SidebarMenu>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => handleToolClick("YouTube")}
                        tooltip="YouTube Ingestion"
                      >
                        <Youtube className="h-4 w-4 mr-2" />
                        <span>YouTube</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => handleToolClick("Notes")}
                        tooltip="Notes"
                      >
                        <ClipboardList className="h-4 w-4 mr-2" />
                        <span>Notes</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => handleToolClick("Images")}
                        tooltip="Image Generation"
                      >
                        <Image className="h-4 w-4 mr-2" />
                        <span>Images</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => handleToolClick("Content")}
                        tooltip="Content Hub"
                      >
                        <FolderOpen className="h-4 w-4 mr-2" />
                        <span>Content</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        onClick={() => handleToolClick("Calendar")}
                        tooltip="Calendar"
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        <span>Calendar</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroup>
              </CollapsibleContent>
            </Collapsible>

            {/* Settings/Profile Section */}
            <SidebarGroup>
              <SidebarGroupLabel>Settings</SidebarGroupLabel>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={() => handleToolClick("Settings")}
                    tooltip="Settings"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton 
                    onClick={handleProfileClick}
                    tooltip="Profile"
                  >
                    <User className="h-4 w-4 mr-2" />
                    <span>Profile</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton onClick={onLogout} tooltip="Sign Out">
                  <LogOut className="h-4 w-4 mr-2" />
                  <span>Sign Out</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Mobile Trigger */}
        <div className="fixed left-4 top-3 z-40 md:hidden">
          <SidebarTrigger />
        </div>

        {userId && (
          <ProfileEditor 
            isOpen={isProfileOpen} 
            onOpenChange={setIsProfileOpen}
            userId={userId}
          />
        )}
      </div>
    </SidebarProvider>
  );
};

export default EnhancedSidebar;
