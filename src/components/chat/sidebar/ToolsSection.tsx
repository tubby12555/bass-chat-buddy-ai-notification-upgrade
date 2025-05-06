import React, { useState, useEffect } from "react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Youtube, FileText, Image, FolderOpen, Calendar, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import EmailModal from "../EmailModal";

interface ToolsSectionProps {
  onToolClick: (tool: string) => void;
  userId: string;
}

const ToolsSection = ({ onToolClick, userId }: ToolsSectionProps) => {
  const [toolsOpen, setToolsOpen] = useState(true);
  const [pendingImages, setPendingImages] = useState(0);
  const navigate = useNavigate();
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailBody, setEmailBody] = useState("");
  const [emailSection, setEmailSection] = useState("custom");

  useEffect(() => {
    const checkPendingImages = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { count, error } = await supabase
          .from("content_images")
          .select("id", { count: 'exact', head: true })
          .eq("user_id", user.id)
          .is("permanent_url", null)
          .not("temp_url", "is", null);
        
        if (!error && count !== null) {
          setPendingImages(count);
        }
      } catch (err) {
        console.error("Error checking pending images:", err);
      }
    };

    checkPendingImages();

    // Set up a subscription for real-time updates
    const channel = supabase
      .channel('content-images-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'content_images'
        },
        () => {
          checkPendingImages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleToolClick = (tool: string) => {
    if (tool === "content") {
      navigate("/content");
      return;
    }
    
    if (tool === "images") {
      navigate("/images");
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
          className="flex items-center justify-between px-4 py-2 text-white hover:bg-chat-accent/20 cursor-pointer"
          onClick={() => handleToolClick("images")}
        >
          <div className="flex items-center">
            <Image size={16} className="mr-2" />
            <span>Images</span>
          </div>
          
          {pendingImages > 0 && (
            <Badge 
              variant="default" 
              className="bg-chat-highlight text-black text-xs px-2 py-0 rounded-full"
            >
              {pendingImages}
            </Badge>
          )}
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
          onClick={() => setIsEmailModalOpen(true)}
        >
          <Mail size={16} className="mr-2" />
          <span>Email</span>
        </div>
      </CollapsibleContent>
      {isEmailModalOpen && (
        <EmailModal
          open={isEmailModalOpen}
          onClose={() => setIsEmailModalOpen(false)}
          defaultContent={emailBody}
          section={emailSection}
          userId={userId}
          onSend={() => setEmailBody("")}
        />
      )}
    </Collapsible>
  );
};

export default ToolsSection;
