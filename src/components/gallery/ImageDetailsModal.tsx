
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

const isValidDriveUrl = (url: string | null | undefined): boolean => {
  return !!url && url.startsWith('https://drive.google.com/');
};

const getImageUrl = (image: ContentImage): string | null => {
  if (image.permanent_url && isValidSupabaseUrl(image.permanent_url)) return image.permanent_url;
  if (image.temp_url && isValidDriveUrl(image.temp_url)) {
    // Convert Google Drive view URL to direct image URL if needed
    if (image.temp_url.includes('view?usp=sharing')) {
      return image.temp_url.replace('view?usp=sharing', 'preview');
    }
    return image.temp_url;
  }
  return null;
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const ImageDetailsModal: React.FC<ImageDetailsModalProps> = ({ 
  selectedImage, 
  setSelectedImage 
}) => {
  const { toast } = useToast();
  const [imageLoaded, setImageLoaded] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Reset states when the modal opens
  React.useEffect(() => {
    if (selectedImage) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [selectedImage]);

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

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = () => {
    console.error("Failed to load image:", selectedImage?.permanent_url || selectedImage?.temp_url);
    setImageError(true);
    setImageLoaded(false);
  };

  if (!selectedImage) return null;

  const imageUrl = getImageUrl(selectedImage);
  const createdDate = formatDate(selectedImage.created_at);

  return (
    <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
      <DialogContent className="w-full max-w-full sm:max-w-3xl h-auto max-h-[90vh] overflow-y-auto bg-gradient-to-br from-black to-gray-900 border border-chat-highlight p-2 sm:p-6 shadow-xl shadow-chat-highlight/20">
        <DialogHeader>
          <DialogTitle className="text-white text-xl font-bold flex items-center gap-2">
            <Image size={20} className="text-chat-highlight" />
            Image Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col md:flex-row gap-6 animate-fade-in">
          <div className="md:w-1/2 relative rounded-xl overflow-hidden bg-black/30 flex items-center justify-center">
            {imageUrl ? (
              <>
                {!imageLoaded && !imageError && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-chat-highlight/30 border-t-chat-highlight rounded-full animate-spin"></div>
                  </div>
                )}
                
                <img 
                  src={imageUrl} 
                  alt={selectedImage.prompt || "Generated image"} 
                  className={`w-full max-h-[50vh] object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                
                {imageError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-black/50 p-4">
                    <Image size={48} />
                    <p className="mt-2 text-center">Failed to load image</p>
                  </div>
                )}
              </>
            ) : (
              <div className="w-full h-60 flex items-center justify-center bg-gray-800/30 text-gray-400 rounded-lg">
                <div className="flex flex-col items-center">
                  <Image size={48} />
                  <p className="mt-2">No image available</p>
                </div>
              </div>
            )}
          </div>
          
          <div className="md:w-1/2 text-white break-words flex flex-col">
            <div className="space-y-4 flex-grow">
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-chat-highlight mb-1">Prompt</h3>
                <p className="text-sm">{selectedImage.prompt || "None"}</p>
              </div>
              
              {selectedImage.style && (
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-chat-highlight mb-1">Style</h3>
                  <p className="text-sm">{selectedImage.style}</p>
                </div>
              )}
              
              <div className="bg-black/30 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-chat-highlight mb-1">Type</h3>
                <p className="text-sm">{selectedImage.content_type || "uncategorized"}</p>
                <p className="text-xs text-gray-400 mt-2">Created on {createdDate}</p>
              </div>
              
              {selectedImage.content_type === "gpt4.1image" && selectedImage.blog && (
                <div className="bg-black/30 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-chat-highlight mb-1">Blog</h3>
                  <div className="bg-black/30 p-3 rounded text-sm max-h-40 overflow-y-auto whitespace-pre-line">
                    {selectedImage.blog}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2 pt-4 mt-auto">
              {imageUrl && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex items-center gap-1 bg-black/40 border-chat-highlight/50 hover:bg-chat-highlight/20"
                    onClick={() => handleCopyUrl(imageUrl)}
                  >
                    <Copy size={16} className="text-chat-highlight" /> Copy URL
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-1 bg-black/40 border-chat-highlight/50 hover:bg-chat-highlight/20"
                    onClick={() => window.open(imageUrl, "_blank")}
                  >
                    <ExternalLink size={16} className="text-chat-highlight" /> Open
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="flex items-center gap-1 bg-black/40 border-chat-highlight/50 hover:bg-chat-highlight/20"
                    onClick={() => handleDownloadImage(imageUrl)}
                  >
                    <Download size={16} className="text-chat-highlight" /> Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ImageDetailsModal;
