
import React from "react";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BassLogo from "@/components/shared/BassLogo";

interface SidebarHeaderProps {
  onToggleSidebar: () => void;
}

const SidebarHeader = ({ onToggleSidebar }: SidebarHeaderProps) => {
  return (
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
  );
};

export default SidebarHeader;
