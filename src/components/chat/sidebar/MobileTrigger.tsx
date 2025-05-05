
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface MobileTriggerProps {
  isOpen: boolean;
  onToggle: () => void;
}

const MobileTrigger = ({ isOpen, onToggle }: MobileTriggerProps) => {
  if (isOpen) return null;
  
  return (
    <Button
      variant="ghost"
      onClick={onToggle}
      className="md:hidden fixed z-20 top-3 left-3 p-1.5 rounded-full bg-chat-accent text-white"
      size="icon"
    >
      <ChevronRight className="h-5 w-5" />
    </Button>
  );
};

export default MobileTrigger;
