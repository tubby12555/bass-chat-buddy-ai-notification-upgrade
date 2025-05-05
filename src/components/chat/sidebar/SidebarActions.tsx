
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, History } from "lucide-react";
import ModelSelector from "../ModelSelector";
import { ModelType } from "@/types/chat";

interface SidebarActionsProps {
  onNewChat: () => void;
  onViewHistory: () => void;
  selectedModel: ModelType;
  onSelectModel: (model: ModelType) => void;
}

const SidebarActions = ({ 
  onNewChat, 
  onViewHistory, 
  selectedModel, 
  onSelectModel 
}: SidebarActionsProps) => {
  return (
    <>
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
      
      <div className="p-2 border-b border-chat-assistant">
        <ModelSelector
          selectedModel={selectedModel}
          onSelectModel={onSelectModel}
        />
      </div>
    </>
  );
};

export default SidebarActions;
