
import React, { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BassLogo from "@/components/shared/BassLogo";
import { useToast } from "@/components/ui/use-toast";
import ProfileEditor from "@/components/profile/ProfileEditor";
import { supabase } from "@/integrations/supabase/client";

interface SidebarHeaderProps {
  onToggleSidebar: () => void;
}

const SidebarHeader = ({ onToggleSidebar }: SidebarHeaderProps) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);

  // Get the current user ID when opening the profile
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
      
      setUserId(user.id);
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

  return (
    <div className="p-4 border-b border-chat-assistant flex items-center justify-between">
      <div 
        className="flex items-center gap-2 cursor-pointer" 
        onClick={handleProfileClick}
        title="Edit Profile"
      >
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
      
      {userId && (
        <ProfileEditor 
          isOpen={isProfileOpen} 
          onOpenChange={setIsProfileOpen}
          userId={userId}
        />
      )}
    </div>
  );
};

export default SidebarHeader;
