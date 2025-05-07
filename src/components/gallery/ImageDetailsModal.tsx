import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Copy, Download, ExternalLink, Image } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface ContentImage {
  id: string;
  user_id: string;
  permanent_url: string | null;
  temp_url: string | null;
  content_type: string | null;
  prompt: string | null;
  style: string | null;
  blog: string | null;
  created_at: string;
}

interface ImageDetailsModalProps {
  selectedImage: ContentImage | null;
  setSelectedImage: (image: ContentImage | null) => void;
}

const isValidSupabaseUrl = (url: string | null | undefined): boolean => {
  return !!url && url.includes('.supabase.co/storage/');
};

const getImageUrl = (image: ContentImage) => {
  if (image.permanent_url && image.permanent_url.includes('.supabase.co/storage/')) return image.permanent_url;
  if (image.temp_url && image.temp_url.startsWith('https://drive.google.com/')) return image.temp_url;
  return null;
};

const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({ 
  selectedImage, 
  setSelectedImage 
}) => {
  const { toast } = useToast();

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "URL Copied",
      description: "Image URL copied to clipboard",
    });
  };

  const handleDownloadImage = (url: string, filename: string = "image.jpg") => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (!selectedImage) return null;

  const imageUrl = getImageUrl(selectedImage);

  return (
    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
      <DialogContent className="w-full max-w-full sm:max-w-2xl h-auto max-h-[90vh] overflow-y-auto bg-black border-chat-highlight p-2 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-white">Image Details</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="md:w-1/2">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={selectedImage.prompt || "Generated image"} 
                className="w-full max-h-[50vh] object-contain rounded-lg bg-black" 
              />
            ) : (
              <div className="w-full h-60 flex items-center justify-center bg-gray-800 text-gray-400 rounded-lg">
                <Image size={48} />
              </div>
            )}
          </div>
          <div className="md:w-1/2 text-white break-words">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Prompt</h3>
                <p className="text-sm">{selectedImage.prompt || "None"}</p>
              </div>
              
              {selectedImage.style && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Style</h3>
                  <p className="text-sm">{selectedImage.style}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-semibold text-gray-400 mb-1">Type</h3>
                <p className="text-sm">{selectedImage.content_type || "uncategorized"}</p>
              </div>
              
              {selectedImage.content_type === "gpt4.1image" && selectedImage.blog && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-1">Blog</h3>
                  <div className="bg-black/30 p-3 rounded text-sm max-h-60 overflow-y-auto whitespace-pre-line">
                    {selectedImage.blog}
                  </div>
                </div>
              )}
              
              <div className="flex flex-wrap gap-2 pt-2">
                {imageUrl && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex items-center gap-1"
                      onClick={() => handleCopyUrl(imageUrl)}
                    >
                      <Copy size={16} /> Copy URL
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => window.open(imageUrl, "_blank")}
                    >
                      <ExternalLink size={16} /> Open
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="flex items-center gap-1"
                      onClick={() => handleDownloadImage(imageUrl)}
                    >
                      <Download size={16} /> Download
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDetailsModal;
