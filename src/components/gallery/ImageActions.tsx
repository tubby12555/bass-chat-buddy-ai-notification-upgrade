import React from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ImageActionsProps {
  imageUrl: string | null;
}

const ImageActions: React.FC<ImageActionsProps> = ({ imageUrl }) => {
  const { toast } = useToast();

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Image URL copied to clipboard",
      duration: 2000,
    });
  };

  const handleDownloadImage = (url: string, filename: string = "image.jpg") => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    toast({
      title: "Download Started",
      description: "Your image download has started",
      duration: 2000,
    });
  };

  if (!imageUrl) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-4 mt-auto">
      <Button 
        size="sm" 
        variant="outline" 
        className="flex items-center gap-1 bg-black/40 border-chat-highlight/50 hover:bg-chat-highlight/20 button-glow"
        onClick={() => handleCopyUrl(imageUrl)}
        aria-label="Copy image URL"
      >
        <Copy size={16} className="text-chat-highlight" /> Copy URL
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        className="flex items-center gap-1 bg-black/40 border-chat-highlight/50 hover:bg-chat-highlight/20 button-glow"
        onClick={() => window.open(imageUrl, "_blank")}
        aria-label="Open image in new tab"
      >
        <ExternalLink size={16} className="text-chat-highlight" /> Open
      </Button>
      <Button 
        size="sm" 
        variant="outline"
        className="flex items-center gap-1 bg-black/40 border-chat-highlight/50 hover:bg-chat-highlight/20 button-glow"
        onClick={() => handleDownloadImage(imageUrl)}
        aria-label="Download image"
      >
        <Download size={16} className="text-chat-highlight" /> Download
      </Button>
    </div>
  );
};

export default ImageActions;
