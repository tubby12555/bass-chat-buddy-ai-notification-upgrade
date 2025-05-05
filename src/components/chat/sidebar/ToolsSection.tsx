import React, { useState } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Youtube, FileText, Image, FolderOpen, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ToolsSectionProps {
  onToolClick: (tool: string) => void;
}

const ToolsSection = ({ onToolClick }: ToolsSectionProps) => {
  const [toolsOpen, setToolsOpen] = useState(true);
  const navigate = useNavigate();

  const handleToolClick = (tool: string) => {
    if (tool === "content") {
      navigate("/content");
      return;
    }
    
    onToolClick(tool);
  };

  return (
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
        
        {/* Gen Image with Flux */}
        <div 
          className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
          onClick={() => handleToolClick("gen-image-flux")}
        >
          <Image size={16} className="mr-2" />
          <span>Gen Image with Flux</span>
        </div>
        
        {/* Gen Image with GPT-4.1 */}
        <div 
          className="flex items-center px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
          onClick={() => handleToolClick("gen-image-gpt4")}
        >
          <Image size={16} className="mr-2" />
          <span>Gen Image with GPT-4.1</span>
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
  );
};

export default ToolsSection;
