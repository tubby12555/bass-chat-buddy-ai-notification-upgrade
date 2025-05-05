
import React from "react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface SidebarFooterProps {
  onLogout: () => void;
}

const SidebarFooter = ({ onLogout }: SidebarFooterProps) => {
  return (
    <div className="p-2 border-t border-chat-assistant">
      <Button
        variant="ghost"
        onClick={onLogout}
        className="w-full justify-start text-chat-accent/80 hover:bg-chat-assistant/50 hover:text-white"
      >
        <LogOut className="mr-2 h-4 w-4" /> Sign Out
      </Button>
    </div>
  );
};

export default SidebarFooter;
